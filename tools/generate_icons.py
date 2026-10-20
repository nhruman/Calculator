"""
generate_icons.py - Creates icons/icon-192.png and icons/icon-512.png
Run from the project folder:   pip install pillow   then   python tools/generate_icons.py
"""
from PIL import Image, ImageDraw

S = 1024  # draw big first, then shrink (makes smooth edges)

# 1) Violet -> cyan gradient background (full square, so it also works as a "maskable" icon)
top, bottom = (139, 92, 246), (6, 182, 212)
mask = Image.linear_gradient("L").resize((S, S))
img = Image.composite(Image.new("RGB", (S, S), bottom), Image.new("RGB", (S, S), top), mask).convert("RGBA")
d = ImageDraw.Draw(img)

# 2) Dark calculator body in the safe centre area
d.rounded_rectangle((250, 220, 774, 804), radius=90, fill=(11, 16, 32, 255))
d.rounded_rectangle((292, 262, 732, 372), radius=40, fill=(40, 50, 84, 255))   # display

# 3) Four symbols: + - x =
w, h, t = 50, 50, 24            # half size, half size, thickness
def plus(cx, cy):
    d.rounded_rectangle((cx - w, cy - t // 2, cx + w, cy + t // 2), radius=12, fill="white")
    d.rounded_rectangle((cx - t // 2, cy - h, cx + t // 2, cy + h), radius=12, fill="white")
def minus(cx, cy):
    d.rounded_rectangle((cx - w, cy - t // 2, cx + w, cy + t // 2), radius=12, fill="white")
def times(cx, cy):
    d.line((cx - 40, cy - 40, cx + 40, cy + 40), fill="white", width=t)
    d.line((cx - 40, cy + 40, cx + 40, cy - 40), fill="white", width=t)
def equal(cx, cy):
    for dy in (-22, 22):
        d.rounded_rectangle((cx - w, cy + dy - t // 2, cx + w, cy + dy + t // 2), radius=12, fill=(6, 182, 212))

plus(382, 500); minus(642, 500); times(382, 690); equal(642, 690)

for size in (192, 512):
    img.resize((size, size), Image.LANCZOS).convert("RGB").save(f"icons/icon-{size}.png")
    print("Created icons/icon-%d.png" % size)
