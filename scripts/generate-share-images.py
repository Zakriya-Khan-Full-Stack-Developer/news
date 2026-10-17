#!/usr/bin/env python3
"""
Generate 1200x630 Open Graph / Twitter share cards.

  public/og-default.png            site-wide default share image
  public/blog/og/<post-id>.png     one card per article in public/data/blog-posts.json

WHY: every page used to share the square 512x512 logo, which renders as a
small, cropped thumbnail in summary_large_image cards. These cards are the
recommended 1200x630 size and show the page's own title.

The blog templates only reference a card when its file exists
(lib/data/blog.js#shareImageFor), so a new article without a card falls back
to og-default.png instead of pointing at a missing image. Re-run this script
after adding or retitling articles:

    pip install pillow fonttools brotli
    python3 scripts/generate-share-images.py

Dev-only tool: it is not part of `npm run build`, and its PNG output is
committed. It uses the site's own fonts (Fraunces / Inter from node_modules)
when available and falls back to DejaVu.
"""
import json
import os
import sys
import tempfile

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit('Pillow is required: pip install pillow fonttools brotli')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1200, 630
NAVY = (30, 42, 74)
NAVY_DARK = (19, 27, 49)
PARCHMENT = (247, 245, 242)
GOLD = (234, 179, 8)
GOLD_DEEP = (161, 98, 7)
MUTED = (184, 192, 214)


def woff2_to_ttf(src, out_dir, name):
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        return None
    if not os.path.exists(src):
        return None
    dst = os.path.join(out_dir, name)
    font = TTFont(src)
    font.flavor = None
    font.save(dst)
    return dst


def load_fonts():
    tmp = tempfile.mkdtemp(prefix='nv-fonts-')
    fr = os.path.join(ROOT, 'node_modules', '@fontsource-variable', 'fraunces', 'files', 'fraunces-latin-wght-normal.woff2')
    it = os.path.join(ROOT, 'node_modules', '@fontsource-variable', 'inter', 'files', 'inter-latin-wght-normal.woff2')
    serif = woff2_to_ttf(fr, tmp, 'fraunces.ttf')
    sans = woff2_to_ttf(it, tmp, 'inter.ttf')
    fallback_serif = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
    fallback_sans = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    fallback_sans_bold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

    def make(path, size, weight=None, fallback=None):
        try:
            f = ImageFont.truetype(path or fallback, size)
            if path and weight is not None:
                try:
                    f.set_variation_by_axes([weight])
                except Exception:
                    pass
            return f
        except Exception:
            return ImageFont.truetype(fallback, size)

    return {
        'serif': lambda size, weight=700: make(serif, size, weight, fallback_serif),
        'sans': lambda size, weight=500: make(sans, size, weight, fallback_sans),
        'sans_bold': lambda size: make(sans, size, 700, fallback_sans_bold),
    }


def wrap(draw, text, font, max_width):
    words, lines, line = text.split(), [], ''
    for w in words:
        trial = f'{line} {w}'.strip()
        if draw.textlength(trial, font=font) <= max_width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def base_canvas():
    img = Image.new('RGB', (W, H), NAVY)
    px = img.load()
    # Soft diagonal gradient, navy to a deeper navy.
    for y in range(H):
        for x in range(0, W, 4):
            t = (x / W) * 0.55 + (y / H) * 0.45
            c = tuple(int(NAVY[i] + (NAVY_DARK[i] - NAVY[i]) * t) for i in range(3))
            for dx in range(4):
                if x + dx < W:
                    px[x + dx, y] = c
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 14, H], fill=GOLD_DEEP)
    draw.rectangle([0, 0, 14, 210], fill=GOLD)
    return img, draw


def paste_logo(img, fonts, draw):
    logo_path = os.path.join(ROOT, 'public', 'nameverse_logo_emblem.webp')
    x = 72
    try:
        logo = Image.open(logo_path).convert('RGBA')
        logo.thumbnail((64, 64))
        img.paste(logo, (x, 56), logo)
        x += 80
    except Exception:
        pass
    draw.text((x, 60), 'NameVerse', font=fonts['serif'](40, 700), fill=PARCHMENT)
    draw.text((x + 2, 104), 'nameverse.site', font=fonts['sans'](20), fill=MUTED)


def card(title, eyebrow, footer, out_path, fonts):
    img, draw = base_canvas()
    paste_logo(img, fonts, draw)

    max_w = W - 72 - 96
    size = 68
    while size >= 40:
        tf = fonts['serif'](size, 700)
        lines = wrap(draw, title, tf, max_w)
        if len(lines) <= 3:
            break
        size -= 4
    lines = lines[:4]
    line_h = int(size * 1.18)
    block_h = line_h * len(lines)
    top = 200 + max(0, (300 - block_h) // 2)

    if eyebrow:
        ef = fonts['sans_bold'](22)
        label = eyebrow.upper()
        tw = draw.textlength(label, font=ef)
        draw.rounded_rectangle([72, top - 62, 72 + tw + 32, top - 22], radius=20, outline=GOLD, width=2)
        draw.text((88, top - 56), label, font=ef, fill=GOLD)

    for i, ln in enumerate(lines):
        draw.text((72, top + i * line_h), ln, font=tf, fill=PARCHMENT)

    ff = fonts['sans'](24)
    draw.line([72, H - 92, W - 96, H - 92], fill=(70, 84, 122), width=1)
    draw.text((72, H - 72), footer, font=ff, fill=MUTED)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    # A 256-colour palette keeps each card small (the gradient is subtle
    # enough that banding is not visible at share-card sizes).
    img.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(
        out_path, 'PNG', optimize=True
    )


def main():
    fonts = load_fonts()
    card(
        'Baby names with meanings, origins and cultural context',
        'Baby name reference',
        'Islamic \u00b7 Christian \u00b7 Hindu \u00b7 11,412 published name profiles',
        os.path.join(ROOT, 'public', 'og-default.png'),
        fonts,
    )
    with open(os.path.join(ROOT, 'public', 'data', 'blog-posts.json'), encoding='utf-8') as f:
        posts = json.load(f)
    count = 0
    for p in posts:
        if not p.get('id') or not p.get('title'):
            continue
        card(
            p['title'],
            p.get('category') or 'Naming guide',
            'NameVerse guides \u00b7 sources named in every article',
            os.path.join(ROOT, 'public', 'blog', 'og', f"{p['id']}.png"),
            fonts,
        )
        count += 1
    print(f'wrote og-default.png and {count} article cards')


if __name__ == '__main__':
    main()
