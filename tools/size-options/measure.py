"""Download size options (Nov 26): re-packs a COPY of the game's art pages a few ways and measures them.

Nothing in the game changes: the results go to the output folder given on the command line.
Usage:  python tools/size-options/measure.py <output folder>

Options measured, each on every art page (assets/art/*.webp and *.png):
  q90   lossy WebP, quality 90, transparency kept exact (the setting one pack already uses)
  q80   lossy WebP, quality 80, transparency kept exact
  half     pages at half size (each side), lossless, for phones (the game would draw them at 2x)
  halfq90  half size and lossy quality 90
"""
import json, os, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

ART = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'art')
OPTIONS = ('q90', 'q80', 'half', 'halfq90')


def encode(args):
    name, out = args
    src = os.path.join(ART, name)
    im = Image.open(src)
    im.load()
    im = im.convert('RGBA')
    sizes = {'now': os.path.getsize(src)}
    for opt in OPTIONS:
        path = os.path.join(out, opt, os.path.splitext(name)[0] + '.webp')
        if opt == 'halfq90':
            im.resize((max(1, im.width // 2), max(1, im.height // 2)), Image.LANCZOS).save(path, quality=90, alpha_quality=100, method=4)
        elif opt == 'half':
            im.resize((max(1, im.width // 2), max(1, im.height // 2)), Image.LANCZOS).save(path, lossless=True, method=4)
        else:
            im.save(path, quality=int(opt[1:]), alpha_quality=100, method=4)
        sizes[opt] = os.path.getsize(path)
    return name, sizes


def main():
    out = sys.argv[1]
    for opt in OPTIONS:
        os.makedirs(os.path.join(out, opt), exist_ok=True)
    names = sorted(n for n in os.listdir(ART) if n.endswith(('.webp', '.png')) and os.path.isfile(os.path.join(ART, n)))
    with ProcessPoolExecutor() as pool:
        results = dict(pool.map(encode, [(n, out) for n in names]))
    with open(os.path.join(out, 'sizes.json'), 'w') as f:
        json.dump(results, f, indent=1)
    total = {k: sum(r[k] for r in results.values()) for k in ('now',) + OPTIONS}
    print({k: f'{v / 1e6:.1f} MB' for k, v in total.items()})


if __name__ == '__main__':
    main()
