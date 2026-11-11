"""Habits icons: python3 tools/make_icons.py  (needs Pillow). Dark tile, 2x2 day grid, three days done.
Writes icons/icon-192.png, icon-512.png, icon-maskable-512.png (art in the 80% safe zone), apple-touch-icon.png."""
import os
from PIL import Image, ImageDraw
BG, ON, OFF = "#121417", "#5BC48A", "#2E333B"
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons"); os.makedirs(out, exist_ok=True)
def make(size, safe, rounded):
    S = size * 4; im = Image.new("RGBA", (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if rounded: d.rounded_rectangle([0, 0, S - 1, S - 1], radius=S // 5, fill=BG)
    else: d.rectangle([0, 0, S, S], fill=BG)
    art = S * safe * 0.62; x0 = (S - art) / 2; gap = art * 0.1; c = (art - gap) / 2
    for i, on in enumerate([1, 1, 1, 0]):
        x = x0 + (i % 2) * (c + gap); y = x0 + (i // 2) * (c + gap)
        d.rounded_rectangle([x, y, x + c, y + c], radius=c * 0.28, fill=ON if on else OFF)
        if on:  # tick
            w = max(2, int(c * 0.12))
            d.line([(x + c * .26, y + c * .52), (x + c * .43, y + c * .69), (x + c * .75, y + c * .33)], fill=BG, width=w, joint="curve")
    return im.resize((size, size), Image.LANCZOS)
make(192, 1, True).save(os.path.join(out, "icon-192.png"))
make(512, 1, True).save(os.path.join(out, "icon-512.png"))
make(512, 0.8, False).save(os.path.join(out, "icon-maskable-512.png"))
make(180, 1, False).convert("RGB").save(os.path.join(out, "apple-touch-icon.png"))
print("icons written")
