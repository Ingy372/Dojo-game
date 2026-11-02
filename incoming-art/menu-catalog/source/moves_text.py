"""Jay's words for the Move Catalog, read straight from docs/self-defense.md (no rewording).
parse() -> {n: dict(belt, attack, does, result, stated)}
split_steps(does) -> numbered steps, split ONLY at Jay's commas. The words are untouched: the only edits are a capital
letter on the first word and a full stop at the end. Sentences that point at another move ("Same as #1 ...",
"As #21, then ...", "Like #3: ...") or start with "Self defense NN:" are NOT split: they come out as ONE step and are
flagged review=True, because a split would be a guess. Used by build_catalog.py and export_catalog.py."""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
DOC = os.path.join(REPO, 'docs', 'self-defense.md')
NOT_STATED = '(not stated)'
PAREN = re.compile(r'\s*\((?:Jay[^)]*|type not stated)\)')          # "(Jay, 2026-10-24)" attributions are notes, not words


def clean(s):
    s = PAREN.sub('', s).strip()
    return s


def parse():
    out = {}
    for ln in open(DOC, encoding='utf-8'):
        m = re.match(r'\|\s*(\d+)\s*\|(.*)\|\s*$', ln)
        if not m:
            continue
        cells = [c.strip() for c in m.group(2).split('|')]
        if len(cells) < 5:
            continue
        n = int(m.group(1))
        belt, attack, does, result = cells[0], cells[1], cells[2], cells[3]
        out[n] = dict(belt=belt, attack=clean(attack), does=clean(does), result=clean(result),
                      stated=NOT_STATED not in does)
    return out


def sentence(s):
    s = s.strip().rstrip('.')
    return s[:1].upper() + s[1:] + '.'


REF = re.compile(r'^(same as|as #|like #|self defense \d+:)', re.I)


def split_steps(does):
    """-> (steps, review). Case of the first letter and the closing full stop are the only changes."""
    if NOT_STATED in does:
        return [], False
    if REF.match(does.strip()):
        return [sentence(does)], True
    return [sentence(p) for p in does.split(', ') if p.strip()], False


if __name__ == '__main__':
    T = parse()
    for n in (1, 3, 6, 20, 22, 31, 36):
        print(n, T[n]['belt'], '|', T[n]['attack'], '|', split_steps(T[n]['does']), '|', T[n]['result'])
