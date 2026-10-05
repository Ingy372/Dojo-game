"""Readers and writers for the Open Tibia binary formats Spirebound builds from scratch.

Formats (protocol 10.98), written from the documented layouts and checked against the readers in
TFS 1.4.2 (src/fileloader.cpp, src/items.cpp, src/iomap.cpp) and OTClient mehah
(src/client/thingtypemanager.cpp, thingtype.cpp, spritemanager.cpp):

- OTB node tree (items.otb and .otbm): 4-byte identifier, then nodes. 0xFE starts a node (next byte is
  its type), 0xFF ends it, 0xFD escapes the next byte inside node properties.
- .spr: u32 signature, u32 sprite count, u32 offset per sprite (0 = empty). Each sprite: 3-byte color
  key, u16 data size, then runs of [u16 transparent][u16 colored][colored x RGB].
- .dat: u32 signature, u16 max id per category (item, creature, effect, missile), then every thing:
  attribute bytes terminated by 0xFF, (creatures: frame-group count + type), size, layers, patterns,
  phases, animation block when phases > 1, u32 sprite ids.

No CipSoft data is read or embedded. Everything here is generic file-format code.
"""
from __future__ import annotations

import struct
from dataclasses import dataclass, field

ESCAPE, START, END = 0xFD, 0xFE, 0xFF

# ---------------------------------------------------------------- OTB node tree


class Node:
    def __init__(self, ntype: int, props: bytes = b"", children=None):
        self.type = ntype
        self.props = props
        self.children = children or []

    def add(self, child: "Node") -> "Node":
        self.children.append(child)
        return child


def _escape(data: bytes) -> bytes:
    out = bytearray()
    for b in data:
        if b in (ESCAPE, START, END):
            out.append(ESCAPE)
        out.append(b)
    return bytes(out)


def write_tree(identifier: bytes, root: Node) -> bytes:
    assert len(identifier) == 4
    out = bytearray(identifier)

    def emit(n: Node):
        out.append(START)
        out.append(n.type)
        out.extend(_escape(n.props))
        for c in n.children:
            emit(c)
        out.append(END)

    emit(root)
    return bytes(out)


def read_tree(data: bytes, accepted: bytes) -> Node:
    ident = data[:4]
    if ident != accepted and ident != b"\0\0\0\0":
        raise ValueError(f"bad identifier {ident!r}")
    if data[4] != START:
        raise ValueError("missing root start")
    i = 5
    root = Node(data[i]); i += 1
    stack = [root]
    props = [bytearray()]
    while i < len(data):
        b = data[i]
        if b == START:
            i += 1
            n = Node(data[i])
            stack[-1].children.append(n)
            stack.append(n)
            props.append(bytearray())
        elif b == END:
            stack[-1].props = bytes(props.pop())
            stack.pop()
            if not stack:
                if i != len(data) - 1:
                    raise ValueError("trailing bytes after root")
                return root
        elif b == ESCAPE:
            i += 1
            if not stack[-1].children:
                props[-1].append(data[i])
        else:
            if not stack[-1].children:
                props[-1].append(b)
        i += 1
    raise ValueError("unterminated tree")


class Reader:
    def __init__(self, data: bytes):
        self.d = data
        self.p = 0

    def left(self) -> int:
        return len(self.d) - self.p

    def u8(self):
        v = self.d[self.p]; self.p += 1; return v

    def i8(self):
        v = struct.unpack_from("<b", self.d, self.p)[0]; self.p += 1; return v

    def u16(self):
        v = struct.unpack_from("<H", self.d, self.p)[0]; self.p += 2; return v

    def u32(self):
        v = struct.unpack_from("<I", self.d, self.p)[0]; self.p += 4; return v

    def i32(self):
        v = struct.unpack_from("<i", self.d, self.p)[0]; self.p += 4; return v

    def raw(self, n):
        v = self.d[self.p:self.p + n]; self.p += n; return v

    def string(self):
        n = self.u16(); return self.raw(n).decode("latin-1")


def pstr(s: str) -> bytes:
    b = s.encode("latin-1")
    return struct.pack("<H", len(b)) + b


# ---------------------------------------------------------------- items.otb

OTB_GROUP = {"none": 0, "ground": 1, "container": 2, "splash": 11, "fluid": 12}
OTB_FLAG = {
    "block_solid": 1 << 0, "block_projectile": 1 << 1, "block_pathfind": 1 << 2, "has_height": 1 << 3,
    "useable": 1 << 4, "pickupable": 1 << 5, "moveable": 1 << 6, "stackable": 1 << 7,
    "always_on_top": 1 << 13, "readable": 1 << 14, "rotatable": 1 << 15, "hangable": 1 << 16,
    "vertical": 1 << 17, "horizontal": 1 << 18, "allow_dist_read": 1 << 20, "look_through": 1 << 23,
    "animation": 1 << 24, "force_use": 1 << 26,
}
ATTR_SERVERID, ATTR_CLIENTID, ATTR_NAME, ATTR_SPEED = 0x10, 0x11, 0x12, 0x14
ATTR_LIGHT2, ATTR_TOPORDER = 0x2A, 0x2B
OTB_MAJOR = 3
OTB_MINOR_1098 = 57  # CLIENT_VERSION_1098 in TFS itemloader.h


@dataclass
class OtbItem:
    server_id: int
    client_id: int
    group: int = 0
    flags: int = 0
    speed: int = 0
    light: tuple = (0, 0)
    top_order: int = 0
    name: str = ""


def write_otb(items: list[OtbItem], build: int = 1, desc: str = "Spirebound items.otb") -> bytes:
    csd = desc.encode("latin-1")[:127].ljust(128, b"\0")
    vi = struct.pack("<III", OTB_MAJOR, OTB_MINOR_1098, build) + csd
    root = Node(0, struct.pack("<I", 0) + bytes([0x01]) + struct.pack("<H", len(vi)) + vi)
    for it in sorted(items, key=lambda x: x.server_id):
        p = bytearray(struct.pack("<I", it.flags))
        p += bytes([ATTR_SERVERID]) + struct.pack("<HH", 2, it.server_id)
        p += bytes([ATTR_CLIENTID]) + struct.pack("<HH", 2, it.client_id)
        if it.speed:
            p += bytes([ATTR_SPEED]) + struct.pack("<HH", 2, it.speed)
        if it.light != (0, 0):
            p += bytes([ATTR_LIGHT2]) + struct.pack("<HHH", 4, *it.light)
        if it.top_order:
            p += bytes([ATTR_TOPORDER]) + struct.pack("<HB", 1, it.top_order)
        if it.name:
            nb = it.name.encode("latin-1")
            p += bytes([ATTR_NAME]) + struct.pack("<H", len(nb)) + nb
        root.add(Node(it.group, bytes(p)))
    return write_tree(b"\0\0\0\0", root)


def read_otb(data: bytes):
    root = read_tree(data, b"OTBI")
    r = Reader(root.props)
    r.u32()
    assert r.u8() == 0x01
    assert r.u16() == 140
    major, minor, build = r.u32(), r.u32(), r.u32()
    items = []
    for n in root.children:
        r = Reader(n.props)
        it = OtbItem(0, 0, group=n.type, flags=r.u32())
        while r.left():
            a = r.u8(); ln = r.u16()
            if a == ATTR_SERVERID: it.server_id = r.u16()
            elif a == ATTR_CLIENTID: it.client_id = r.u16()
            elif a == ATTR_SPEED: it.speed = r.u16()
            elif a == ATTR_LIGHT2: it.light = (r.u16(), r.u16())
            elif a == ATTR_TOPORDER: it.top_order = r.u8()
            elif a == ATTR_NAME: it.name = r.raw(ln).decode("latin-1")
            else: r.raw(ln)
        items.append(it)
    return (major, minor, build), items


# ---------------------------------------------------------------- .spr

SPRITE_PX = 32
COLOR_KEY = b"\xff\x00\xff"


def encode_sprite(rgba: bytes) -> bytes:
    """rgba: 32*32*4 bytes. Pixels with alpha < 128 are transparent. Returns the pixel data block."""
    n = SPRITE_PX * SPRITE_PX
    out = bytearray()
    i = 0
    # trailing transparent pixels are implied by the reader
    last = n
    while last > 0 and rgba[(last - 1) * 4 + 3] < 128:
        last -= 1
    while i < last:
        t = 0
        while i < last and rgba[i * 4 + 3] < 128:
            t += 1; i += 1
        c0 = i
        while i < last and rgba[i * 4 + 3] >= 128:
            i += 1
        out += struct.pack("<HH", t, i - c0)
        for k in range(c0, i):
            out += rgba[k * 4:k * 4 + 3]
    return bytes(out)


def decode_sprite(block: bytes) -> bytes:
    n = SPRITE_PX * SPRITE_PX
    px = bytearray(n * 4)
    r = Reader(block)
    pos = 0
    while r.left() >= 4 and pos < n:
        t = r.u16(); c = r.u16()
        pos += t
        for _ in range(c):
            rgb = r.raw(3)
            px[pos * 4:pos * 4 + 4] = rgb + b"\xff"
            pos += 1
    return bytes(px)


def write_spr(signature: int, sprites: list[bytes]) -> bytes:
    """sprites[0] is sprite id 1. Each entry is a pixel-data block from encode_sprite."""
    count = len(sprites)
    head = struct.pack("<II", signature, count)
    offsets = bytearray()
    body = bytearray()
    base = len(head) + 4 * count
    for blk in sprites:
        offsets += struct.pack("<I", base + len(body))
        body += COLOR_KEY + struct.pack("<H", len(blk)) + blk
    return head + bytes(offsets) + bytes(body)


def read_spr(data: bytes):
    r = Reader(data)
    sig, count = r.u32(), r.u32()
    offs = [r.u32() for _ in range(count)]
    blocks = []
    for o in offs:
        if o == 0:
            blocks.append(b""); continue
        rr = Reader(data); rr.p = o + 3
        ln = rr.u16()
        blocks.append(rr.raw(ln))
    return sig, blocks


# ---------------------------------------------------------------- .dat (10.98)

# Raw attribute bytes as written in a 10.98 .dat (OTClient remaps 16 -> NoMoveAnimation,
# 17..34 -> value-1, 35 -> DefaultAction, 254 -> Usable).
DAT_ATTR = {
    "ground": 0, "border": 1, "bottom": 2, "top": 3, "container": 4, "stackable": 5, "forceuse": 6,
    "multiuse": 7, "writable": 8, "writableonce": 9, "fluid": 10, "splash": 11, "block": 12,
    "immovable": 13, "blockmissile": 14, "blockpath": 15, "nomoveanim": 16, "pickup": 17,
    "hangable": 18, "hooksouth": 19, "hookeast": 20, "rotate": 21, "light": 22, "donthide": 23,
    "translucent": 24, "displacement": 25, "height": 26, "corpse": 27, "animate": 28, "minimap": 29,
    "lenshelp": 30, "fullground": 31, "look": 32, "cloth": 33, "market": 34, "defaultaction": 35,
    "usable": 254,
}
DAT_ATTR_NAME = {v: k for k, v in DAT_ATTR.items()}
# attributes followed by u16 payloads (count)
DAT_ATTR_ARGS = {"ground": 1, "writable": 1, "writableonce": 1, "light": 2, "displacement": 2,
                 "height": 1, "minimap": 1, "lenshelp": 1, "cloth": 1, "defaultaction": 1}
DAT_ATTR_DEFAULTS = {"ground": (150,), "writable": (1000,), "writableonce": (1000,), "light": (3, 215),
                     "displacement": (8, 8), "height": (8,), "minimap": (0,), "lenshelp": (0,),
                     "cloth": (0,), "defaultaction": (0,)}


def normalize_attr(name: str, args: tuple) -> tuple:
    """Fill omitted u16 payloads with defaults so writer and reader always agree on byte length."""
    if name not in DAT_ATTR:
        raise ValueError(f"unknown flag {name!r}")
    need = DAT_ATTR_ARGS.get(name, 0)
    if len(args) == need:
        return tuple(args)
    if len(args) == 0 and name in DAT_ATTR_DEFAULTS:
        return DAT_ATTR_DEFAULTS[name]
    raise ValueError(f"flag {name} needs {need} values, got {args}")

CAT_ITEM, CAT_CREATURE, CAT_EFFECT, CAT_MISSILE = range(4)


@dataclass
class FrameGroup:
    gtype: int = 0  # 0 idle, 1 moving (creatures only)
    width: int = 1
    height: int = 1
    exact: int = 32
    layers: int = 1
    px: int = 1
    py: int = 1
    pz: int = 1
    phases: int = 1
    anim: tuple | None = None  # (async, loop, start, [(min,max)...])
    sprites: list = field(default_factory=list)


@dataclass
class Thing:
    attrs: list = field(default_factory=list)  # list of (name, args tuple)
    groups: list = field(default_factory=lambda: [FrameGroup()])


def _write_thing(out: bytearray, t: Thing, creature: bool):
    for name, args in t.attrs:
        out.append(DAT_ATTR[name])
        if name == "market":
            cat, trade, show, nm, voc, lvl = args
            out += struct.pack("<HHH", cat, trade, show) + pstr(nm) + struct.pack("<HH", voc, lvl)
        else:
            for a in normalize_attr(name, args):
                out += struct.pack("<H", a)
    out.append(0xFF)
    if creature:
        out.append(len(t.groups))
    for g in t.groups:
        if creature:
            out.append(g.gtype)
        out += bytes([g.width, g.height])
        if g.width > 1 or g.height > 1:
            out.append(g.exact)
        out += bytes([g.layers, g.px, g.py, g.pz, g.phases])
        if g.phases > 1:
            asyn, loop, start, durs = g.anim or (1, 0, 0, [(150, 150)] * g.phases)
            out += struct.pack("<Bib", 0 if asyn else 1, loop, start)
            for mn, mx in durs:
                out += struct.pack("<II", mn, mx)
        n = g.width * g.height * g.layers * g.px * g.py * g.pz * g.phases
        assert len(g.sprites) == n, (n, len(g.sprites))
        for s in g.sprites:
            out += struct.pack("<I", s)


def write_dat(signature: int, items: dict, creatures: dict, effects: dict, missiles: dict) -> bytes:
    """Each dict maps id -> Thing. Gaps are filled with empty things."""
    cats = [(items, 100), (creatures, 1), (effects, 1), (missiles, 1)]
    out = bytearray(struct.pack("<I", signature))
    maxes = []
    for d, first in cats:
        mx = max(d) if d else first - 1
        maxes.append(mx)
        out += struct.pack("<H", mx)
    for ci, (d, first) in enumerate(cats):
        for tid in range(first, maxes[ci] + 1):
            _write_thing(out, d.get(tid) or Thing(groups=[FrameGroup(sprites=[0])]), ci == CAT_CREATURE)
    return bytes(out)


def read_dat(data: bytes):
    r = Reader(data)
    sig = r.u32()
    maxes = [r.u16() for _ in range(4)]
    result = []
    for ci in range(4):
        first = 100 if ci == CAT_ITEM else 1
        things = {}
        for tid in range(first, maxes[ci] + 1):
            t = Thing(attrs=[], groups=[])
            while True:
                a = r.u8()
                if a == 0xFF:
                    break
                name = DAT_ATTR_NAME.get(a)
                if name is None:
                    raise ValueError(f"unknown dat attr {a} on {ci}:{tid}")
                if name == "market":
                    args = (r.u16(), r.u16(), r.u16(), r.string(), r.u16(), r.u16())
                else:
                    args = tuple(r.u16() for _ in range(DAT_ATTR_ARGS.get(name, 0)))
                t.attrs.append((name, args))
            ngroups = r.u8() if ci == CAT_CREATURE else 1
            for _ in range(ngroups):
                g = FrameGroup()
                if ci == CAT_CREATURE:
                    g.gtype = r.u8()
                g.width, g.height = r.u8(), r.u8()
                g.exact = r.u8() if (g.width > 1 or g.height > 1) else 32
                g.layers, g.px, g.py, g.pz, g.phases = r.u8(), r.u8(), r.u8(), r.u8(), r.u8()
                if g.phases > 1:
                    asyn = r.u8() == 0
                    loop = r.i32(); start = r.i8()
                    durs = [(r.u32(), r.u32()) for _ in range(g.phases)]
                    g.anim = (asyn, loop, start, durs)
                n = g.width * g.height * g.layers * g.px * g.py * g.pz * g.phases
                g.sprites = [r.u32() for _ in range(n)]
                t.groups.append(g)
            things[tid] = t
        result.append(things)
    if r.left():
        raise ValueError(f"{r.left()} trailing bytes in dat")
    return sig, result
