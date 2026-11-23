"""The v2 hero's glossy toy shading as a reusable material maker (same recipe as upgrade_hero.py), for skins and props.

    import sys; sys.path.insert(0, "<repo>/incoming-art/claude-hero-v2/source"); from hero_shading import glossy
"""
import bpy
from mathutils import Vector

LIGHT_DIR = Vector((-0.45, -0.55, 0.70)).normalized()


def lin(h):
    h = h.lstrip("#")
    o = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        o.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*o, 1.0)


def _shadow_of(hex_color):
    """A coloured shadow: the colour darker and shifted a little toward violet blue."""
    r, g, b, _ = lin(hex_color)
    return (r * 0.52 + 0.02, g * 0.52 + 0.025, b * 0.60 + 0.06, 1.0)


def glossy(name, hex_color, rim=0.2, glow=0.0, flat=False):
    """Soft three-tone shading + top highlight + rim light, done with an emission shader (no lights, like the house kit).
    glow > 0 lifts the shadow side (crystals, flames); flat=True gives one flat colour (eyes, tiny details)."""
    key = f"G_{name}"
    m = bpy.data.materials.get(key)
    if m:
        return m
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    emit = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(emit.outputs[0], out.inputs["Surface"])
    base = lin(hex_color)
    m.diffuse_color = base
    if flat:
        emit.inputs["Color"].default_value = base
        return m
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    light = nt.nodes.new("ShaderNodeCombineXYZ")
    light.inputs[0].default_value, light.inputs[1].default_value, light.inputs[2].default_value = LIGHT_DIR
    dot = nt.nodes.new("ShaderNodeVectorMath")
    dot.operation = "DOT_PRODUCT"
    remap = nt.nodes.new("ShaderNodeMapRange")
    remap.inputs["From Min"].default_value = -1.0
    remap.inputs["From Max"].default_value = 1.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "EASE"
    sh = _shadow_of(hex_color)
    if glow:
        sh = tuple(s + (b - s) * glow for s, b in zip(sh[:3], base[:3])) + (1,)
    cr.elements[0].position = 0.0
    cr.elements[0].color = tuple(x * 0.9 for x in sh[:3]) + (1,)
    cr.elements[1].position = 0.34
    cr.elements[1].color = sh
    hi = tuple(min(1.0, c * 1.18 + 0.05) for c in base[:3]) + (1,)
    for pos, col in ((0.47, base), (0.80, base), (0.93, hi)):
        e = cr.elements.new(pos)
        e.color = col
    nt.links.new(geo.outputs["Normal"], dot.inputs[0])
    nt.links.new(light.outputs[0], dot.inputs[1])
    nt.links.new(dot.outputs["Value"], remap.inputs["Value"])
    nt.links.new(remap.outputs["Result"], ramp.inputs["Fac"])
    # rim light, strongest on top
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    rm = nt.nodes.new("ShaderNodeMapRange")
    rm.inputs["From Min"].default_value = 0.55
    rm.inputs["From Max"].default_value = 0.95
    rm.inputs["To Max"].default_value = rim
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    up = nt.nodes.new("ShaderNodeMapRange")
    up.inputs["From Min"].default_value = -0.2
    up.inputs["From Max"].default_value = 0.7
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(geo.outputs["Normal"], sep.inputs[0])
    nt.links.new(sep.outputs[2], up.inputs["Value"])
    nt.links.new(lw.outputs["Facing"], rm.inputs["Value"])
    nt.links.new(rm.outputs["Result"], mul.inputs[0])
    nt.links.new(up.outputs["Result"], mul.inputs[1])
    add = nt.nodes.new("ShaderNodeMix")
    add.data_type = "RGBA"
    add.blend_type = "ADD"
    nt.links.new(mul.outputs[0], add.inputs["Factor"])
    nt.links.new(ramp.outputs["Color"], add.inputs[6])
    add.inputs[7].default_value = (1, 1, 1, 1)
    nt.links.new(add.outputs[2], emit.inputs["Color"])
    return m
