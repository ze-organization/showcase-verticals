#!/usr/bin/env python3
"""
Page Builder toolbox icons — Sitecore Office / officewhite language in grayscale.

Palette (https://sitecoreicons.com/ office/32x32 + officewhite/32x32):
  WHITE      background + inner panels (dominant)
  LIGHT gray object bodies
  DARK gray  outlines and small marks only — never the fill

Exact Sitecore 32×32 Office files are not publicly downloadable (only 16×16
gray previews exist on sitecoreicons.com). These drawings follow the same
airy outlined pictograms, with component-accurate metaphors.
"""

from __future__ import annotations

import math
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent
OFFICE = OUT / "_office"
SIZE = 256
FINAL = 48
STROKE = 6

BG = (255, 255, 255, 255)
WHITE = (255, 255, 255, 255)
LIGHT = (214, 214, 214, 255)
DARK = (102, 102, 102, 255)


def _new() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    im = Image.new("RGBA", (SIZE, SIZE), BG)
    return im, ImageDraw.Draw(im)


def _save(name: str, im: Image.Image) -> None:
    im.resize((FINAL, FINAL), Image.Resampling.LANCZOS).save(OUT / f"{name}.png")


def _rad(box, r) -> float:
    x0, y0, x1, y1 = box
    return min(r, max(0, (x1 - x0) / 2), max(0, (y1 - y0) / 2))


def _inset_pts(pts, amt: float):
    cx = sum(p[0] for p in pts) / len(pts)
    cy = sum(p[1] for p in pts) / len(pts)
    out = []
    for x, y in pts:
        dx, dy = cx - x, cy - y
        n = math.hypot(dx, dy) or 1
        a = min(amt, n * 0.42)
        out.append((x + dx / n * a, y + dy / n * a))
    return out


class Ico:
    def __init__(self) -> None:
        self.im, self.d = _new()

    def rr(self, box, r=16, fill=WHITE, rim=True) -> None:
        x0, y0, x1, y1 = box
        if x1 <= x0 or y1 <= y0:
            return
        rad = _rad(box, r)
        if rim:
            self.d.rounded_rectangle((x0, y0, x1, y1), radius=rad, fill=fill, outline=DARK, width=STROKE)
        else:
            self.d.rounded_rectangle((x0, y0, x1, y1), radius=rad, fill=fill)

    def el(self, box, fill=WHITE, rim=True) -> None:
        x0, y0, x1, y1 = box
        if x1 <= x0 or y1 <= y0:
            return
        if rim:
            self.d.ellipse(box, fill=fill, outline=DARK, width=STROKE)
        else:
            self.d.ellipse(box, fill=fill)

    def poly(self, pts, fill=WHITE, rim=True) -> None:
        self.d.polygon(pts, fill=fill)
        if rim:
            closed = list(pts) + [pts[0]]
            self.d.line(closed, fill=DARK, width=STROKE, joint="curve")

    def pie(self, box, a, b, fill=WHITE, rim=False) -> None:
        self.d.pieslice(box, a, b, fill=fill)

    def mark(self, box, r=4) -> None:
        """Solid dark accent — small only."""
        x0, y0, x1, y1 = box
        if x1 <= x0 or y1 <= y0:
            return
        self.d.rounded_rectangle(box, radius=_rad(box, r), fill=DARK)

    def hole(self, box, r=8, ellipse=False) -> None:
        if ellipse:
            self.el(box, fill=WHITE, rim=False)
        else:
            self.rr(box, r=r, fill=WHITE, rim=False)

    def line(self, xy, w=10, c=DARK) -> None:
        self.d.line(xy, fill=c, width=w, joint="curve")

    def arc(self, box, a, b, w=10, c=DARK) -> None:
        self.d.arc(box, a, b, fill=c, width=w)

    def done(self, name: str) -> None:
        _save(name, self.im)


def office_stamp(ico: Ico, file: str, box=(28, 28, 228, 228)) -> None:
    """Paste a Sitecore office/16x16 silhouette, recolored light-gray with a thin dark rim."""
    src = Image.open(OFFICE / file).convert("RGBA")
    sil = Image.new("RGBA", src.size, (0, 0, 0, 0))
    for y in range(src.height):
        for x in range(src.width):
            r, g, b, a = src.getpixel((x, y))
            if a > 40:
                sil.putpixel((x, y), LIGHT)
    x0, y0, x1, y1 = (int(v) for v in box)
    tw, th = max(8, x1 - x0), max(8, y1 - y0)
    scale = max(2, min(tw // src.width, th // src.height))
    while scale > 2 and src.width * scale + scale >= tw:
        scale -= 1
    big = sil.resize((src.width * scale, src.height * scale), Image.Resampling.NEAREST)
    alpha = big.split()[3]
    rad = scale if scale % 2 else scale + 1
    rad = max(3, min(rad, 9))
    outline_a = alpha.filter(ImageFilter.MaxFilter(size=rad))
    dark = Image.new("RGBA", big.size, DARK)
    dark.putalpha(outline_a)
    light = Image.new("RGBA", big.size, LIGHT)
    light.putalpha(alpha)
    layered = Image.alpha_composite(dark, light)
    px = x0 + (tw - layered.width) // 2
    py = y0 + (th - layered.height) // 2
    ico.im.paste(layered, (px, py), layered)


def star(ico: Ico, cx, cy, r_out, r_in=None, fill=LIGHT, n=5) -> None:
    r_in = r_in or r_out * 0.42
    pts = []
    for i in range(n * 2):
        ang = math.radians(-90 + i * (180 / n))
        r = r_out if i % 2 == 0 else r_in
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    ico.poly(pts, fill=fill)


def chev_lt(ico: Ico, cx, cy, s, w=12, fill=LIGHT) -> None:
    ico.poly(
        [
            (cx + s * 0.15, cy - s),
            (cx - s * 0.7, cy),
            (cx + s * 0.15, cy + s),
            (cx + s * 0.15 + w, cy + s - w * 0.7),
            (cx - s * 0.7 + w * 1.2, cy),
            (cx + s * 0.15 + w, cy - s + w * 0.7),
        ],
        fill=fill,
    )


def chev_rt(ico: Ico, cx, cy, s, w=12, fill=LIGHT) -> None:
    ico.poly(
        [
            (cx - s * 0.15, cy - s),
            (cx + s * 0.7, cy),
            (cx - s * 0.15, cy + s),
            (cx - s * 0.15 - w, cy + s - w * 0.7),
            (cx + s * 0.7 - w * 1.2, cy),
            (cx - s * 0.15 - w, cy - s + w * 0.7),
        ],
        fill=fill,
    )


def plus(ico: Ico, box, fill=DARK) -> None:
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    t = max(6, (x1 - x0) * 0.18)
    ico.rr((cx - t / 2, y0, cx + t / 2, y1), 3, fill=fill, rim=False)
    ico.rr((x0, cy - t / 2, x1, cy + t / 2), 3, fill=fill, rim=False)


def bars(ico: Ico, box, n=3) -> None:
    x0, y0, x1, y1 = box
    if x1 <= x0 or y1 <= y0:
        return
    gap = (y1 - y0) / (n * 2 - 1)
    shrink = min(16, max(0, (x1 - x0) * 0.14))
    for i in range(n):
        top = y0 + i * gap * 2
        right = max(x0 + 8, x1 - i * shrink)
        ico.rr((x0, top, right, top + max(5, gap * 0.7)), 4, fill=LIGHT, rim=False)


def chart(ico: Ico, box) -> None:
    x0, y0, x1, y1 = box
    w = (x1 - x0 - 16) / 3
    for i, hf in enumerate((0.45, 0.72, 1.0)):
        left = x0 + i * (w + 8)
        ico.rr((left, y1 - (y1 - y0) * hf, left + w, y1), 6, fill=LIGHT)


def person(ico: Ico, box, fill=LIGHT) -> None:
    office_stamp(ico, "user.png", box)


def pin(ico: Ico, box, fill=LIGHT) -> None:
    office_stamp(ico, "location_pin.png", box)


def house(ico: Ico, box, fill=LIGHT, door=True) -> None:
    office_stamp(ico, "home.png", box)


def flag(ico: Ico, box, fill=LIGHT) -> None:
    office_stamp(ico, "flag_generic.png", box)


def tag(ico: Ico, box, fill=LIGHT, hole=True) -> None:
    office_stamp(ico, "tag.png", box)


def box3d(ico: Ico, box, fill=LIGHT) -> None:
    office_stamp(ico, "package.png", box)


def window(ico: Ico, box=(28, 28, 228, 228), fill=WHITE) -> None:
    x0, y0, x1, y1 = box
    ico.rr(box, 18, fill=fill)
    ico.mark((x0 + 8, y0 + 32, x1 - 8, y0 + 42), 2)
    for x in (x0 + 18, x0 + 42, x0 + 66):
        ico.el((x, y0 + 12, x + 14, y0 + 26), fill=LIGHT, rim=False)


def card(ico: Ico, box=(44, 28, 212, 228), media=True) -> None:
    x0, y0, x1, y1 = box
    ico.rr(box, 18, fill=WHITE)
    if media:
        ico.rr((x0 + 14, y0 + 14, x1 - 14, y0 + 100), 10, fill=LIGHT)
    bars(ico, (x0 + 18, y0 + 118, x1 - 18, y1 - 18), 3)


def grid2(ico: Ico, cell) -> None:
    cells = [(32, 32, 118, 118), (138, 32, 224, 118), (32, 138, 118, 224), (138, 138, 224, 224)]
    for b in cells:
        ico.rr(b, 14, fill=WHITE)
        cell(ico, b)


def carousel(ico: Ico, inner) -> None:
    ico.rr((56, 44, 200, 212), 16, fill=WHITE)
    chev_lt(ico, 28, 128, 22, 10, fill=LIGHT)
    chev_rt(ico, 228, 128, 22, 10, fill=LIGHT)
    inner(ico, (72, 60, 184, 196))


def mag(ico: Ico, box, fill=LIGHT) -> None:
    office_stamp(ico, "magnifying_glass.png", box)


def plane(ico: Ico, box) -> None:
    office_stamp(ico, "airplane.png", box)


def camera(ico: Ico, box) -> None:
    office_stamp(ico, "camera.png", box)


def lightbulb(ico: Ico, box) -> None:
    office_stamp(ico, "lightbulb_on.png", box)


def doc(ico: Ico, box=(56, 24, 200, 232), lines=True) -> None:
    office_stamp(ico, "document_text.png", box)


def clipboard(ico: Ico) -> None:
    office_stamp(ico, "clipboard.png")


def wrench(ico: Ico, box) -> None:
    office_stamp(ico, "wrench.png", box)


def phone(ico: Ico, box) -> None:
    """Mobile phone — clearer at 48px than office/phone_receiver (top-down handset)."""
    x0, y0, x1, y1 = box
    ico.rr((x0 + 36, y0 + 4, x1 - 36, y1 - 4), 28, fill=WHITE)
    ico.mark((x0 + (x1 - x0) * 0.38, y0 + 18, x1 - (x1 - x0) * 0.38, y0 + 28), 4)
    ico.rr((x0 + 52, y0 + 44, x1 - 52, y1 - 56), 10, fill=LIGHT)
    ico.el(
        ((x0 + x1) / 2 - 12, y1 - 40, (x0 + x1) / 2 + 12, y1 - 16),
        fill=LIGHT,
        rim=False,
    )


def quotes(ico: Ico) -> None:
    def mark_q(x):
        ico.el((x, 40, x + 56, 96), fill=LIGHT)
        ico.el((x + 14, 54, x + 42, 82), fill=WHITE, rim=False)
        ico.poly([(x + 12, 88), (x + 56, 88), (x + 24, 168), (x, 144)], fill=LIGHT)

    mark_q(40)
    mark_q(148)


def film(ico: Ico) -> None:
    office_stamp(ico, "film.png")


def dollar(ico: Ico, box) -> None:
    office_stamp(ico, "money.png", box)


def puzzle(ico: Ico) -> None:
    ico.rr((52, 88, 164, 216), 12, fill=LIGHT)
    ico.el((80, 32, 136, 104), fill=LIGHT)
    ico.el((140, 112, 228, 200), fill=LIGHT)
    ico.el((28, 120, 84, 176), fill=WHITE, rim=False)


def chain_links(ico: Ico) -> None:
    office_stamp(ico, "link.png")


def share_nodes(ico: Ico) -> None:
    office_stamp(ico, "users_relation.png")


# ---------------------------------------------------------------------------
# Layout
# ---------------------------------------------------------------------------

def ico_container() -> None:
    p = Ico()
    p.rr((28, 28, 228, 228), 16, fill=WHITE)
    p.rr((44, 44, 212, 76), 8, fill=LIGHT)
    p.rr((44, 92, 124, 212), 8, fill=LIGHT)
    p.rr((140, 92, 212, 148), 8, fill=LIGHT)
    p.rr((140, 164, 212, 212), 8, fill=LIGHT)
    p.done("container")


def ico_column_splitter() -> None:
    p = Ico()
    p.rr((28, 32, 118, 224), 14, fill=WHITE)
    p.rr((138, 32, 228, 224), 14, fill=WHITE)
    p.mark((122, 96, 134, 160), 4)
    p.done("column-splitter")


def ico_row_splitter() -> None:
    p = Ico()
    p.rr((32, 28, 224, 118), 14, fill=WHITE)
    p.rr((32, 138, 224, 228), 14, fill=WHITE)
    p.mark((96, 122, 160, 134), 4)
    p.done("row-splitter")


def ico_section_wrapper() -> None:
    p = Ico()
    p.rr((24, 36, 232, 220), 16, fill=WHITE)
    p.rr((44, 72, 212, 200), 12, fill=LIGHT)
    p.mark((44, 50, 140, 62), 4)
    p.done("section-wrapper")


def ico_scroll_scene() -> None:
    p = Ico()
    p.el((24, 72, 232, 184), fill=LIGHT)
    p.el((88, 88, 168, 168), fill=WHITE)
    p.el((108, 108, 148, 148), fill=LIGHT, rim=False)
    p.done("scroll-scene")


def ico_scroll_to_top() -> None:
    p = Ico()
    p.el((28, 28, 228, 228), fill=WHITE)
    p.poly([(128, 56), (188, 128), (68, 128)], fill=LIGHT)
    p.rr((112, 112, 144, 200), 8, fill=LIGHT)
    p.done("scroll-to-top")


# ---------------------------------------------------------------------------
# Heros / banners
# ---------------------------------------------------------------------------

def ico_hero() -> None:
    p = Ico()
    p.rr((16, 32, 240, 224), 16, fill=WHITE)
    p.el((44, 48, 84, 88), fill=LIGHT, rim=False)
    p.poly([(28, 160), (80, 84), (116, 128), (160, 68), (228, 160)], fill=LIGHT)
    p.rr((16, 160, 240, 224), 16, fill=WHITE)
    p.rr((16, 160, 240, 176), 0, fill=WHITE, rim=False)
    bars(p, (36, 176, 168, 212), 2)
    p.done("hero")


def ico_hero_carousel() -> None:
    p = Ico()
    p.rr((48, 56, 208, 200), 14, fill=WHITE)
    p.el((72, 76, 104, 108), fill=LIGHT, rim=False)
    p.poly([(60, 176), (100, 120), (128, 148), (160, 108), (196, 176)], fill=LIGHT)
    chev_lt(p, 28, 128, 20, 10, fill=LIGHT)
    chev_rt(p, 228, 128, 20, 10, fill=LIGHT)
    p.done("hero-carousel")


def ico_promo() -> None:
    p = Ico()
    office_stamp(p, "megaphone.png")
    p.done("promo")


def ico_tagline_banner() -> None:
    p = Ico()
    p.rr((20, 88, 236, 168), 14, fill=WHITE)
    bars(p, (64, 112, 192, 152), 2)
    p.done("tagline-banner")


def ico_alert_banner() -> None:
    p = Ico()
    p.poly([(128, 28), (232, 220), (24, 220)], fill=LIGHT)
    p.mark((116, 96, 140, 148), 6)
    p.el((116, 164, 140, 188), fill=DARK, rim=False)
    p.done("alert-banner")


def ico_inline_banner() -> None:
    p = Ico()
    p.el((28, 28, 228, 228), fill=WHITE)
    p.el((112, 56, 144, 88), fill=LIGHT, rim=False)
    p.mark((116, 108, 140, 188), 8)
    p.done("inline-banner")


def ico_countdown_banner() -> None:
    p = Ico()
    office_stamp(p, "alarmclock.png")
    p.done("countdown-banner")


def ico_subscription_banner() -> None:
    p = Ico()
    p.rr((28, 64, 228, 192), 14, fill=WHITE)
    p.poly([(28, 64), (128, 140), (228, 64)], fill=LIGHT)
    p.done("subscription-banner")


def ico_consent_banner() -> None:
    p = Ico()
    p.arc((72, 28, 184, 140), 180, 0, 18, LIGHT)
    p.rr((60, 108, 196, 228), 16, fill=WHITE)
    p.el((108, 140, 148, 180), fill=LIGHT)
    p.mark((120, 168, 136, 204), 5)
    p.done("consent-banner")


def ico_article_header() -> None:
    p = Ico()
    p.rr((28, 28, 108, 108), 12, fill=LIGHT)
    p.el((48, 44, 76, 72), fill=WHITE, rim=False)
    p.poly([(40, 96), (64, 64), (82, 84), (96, 56), (108, 96)], fill=WHITE)
    p.rr((124, 40, 228, 68), 8, fill=LIGHT)
    bars(p, (124, 84, 200, 108), 1)
    bars(p, (28, 132, 228, 228), 4)
    p.done("article-header")


# ---------------------------------------------------------------------------
# Cards / items
# ---------------------------------------------------------------------------

def ico_card_block() -> None:
    p = Ico()
    card(p)
    p.done("card-block")


def ico_feature_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    lightbulb(p, (80, 44, 176, 168))
    bars(p, (64, 184, 192, 216), 2)
    p.done("feature-card")


def ico_article_card() -> None:
    p = Ico()
    p.rr((36, 28, 220, 228), 16, fill=WHITE)
    p.rr((52, 44, 124, 116), 8, fill=LIGHT)
    bars(p, (140, 48, 204, 112), 3)
    bars(p, (52, 140, 204, 208), 3)
    p.done("article-card")


def ico_product_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    box3d(p, (72, 48, 184, 168))
    bars(p, (60, 184, 196, 212), 2)
    p.done("product-card")


def ico_person_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    person(p, (72, 44, 184, 168))
    bars(p, (64, 184, 192, 212), 2)
    p.done("person-card")


def ico_location_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    pin(p, (76, 40, 180, 168))
    bars(p, (64, 184, 192, 216), 2)
    p.done("location-card")


def ico_destination_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    plane(p, (52, 48, 204, 168))
    bars(p, (64, 184, 192, 216), 2)
    p.done("destination-card")


def ico_offer_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    tag(p, (64, 48, 192, 188))
    p.done("offer-card")


def ico_review_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    for x in (68, 108, 148, 188):
        star(p, x, 100, 18, fill=LIGHT)
    bars(p, (64, 148, 192, 204), 2)
    p.done("review-card")


def ico_callout_card() -> None:
    p = Ico()
    p.rr((40, 36, 216, 188), 18, fill=WHITE)
    p.poly([(72, 188), (72, 228), (112, 188)], fill=LIGHT)
    p.el((112, 64, 144, 96), fill=LIGHT, rim=False)
    p.mark((116, 112, 140, 160), 8)
    p.done("callout-card")


def ico_pricing_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    p.el((80, 44, 176, 140), fill=LIGHT)
    dollar(p, (104, 64, 152, 120))
    bars(p, (64, 160, 192, 212), 2)
    p.done("pricing-card")


def ico_stats_card() -> None:
    p = Ico()
    p.rr((44, 28, 212, 228), 18, fill=WHITE)
    chart(p, (64, 48, 192, 200))
    p.done("stats-card")


def ico_badge_block() -> None:
    p = Ico()
    p.el((48, 28, 208, 188), fill=LIGHT)
    star(p, 128, 108, 48, fill=WHITE)
    p.poly([(88, 168), (104, 228), (128, 204), (152, 228), (168, 168)], fill=LIGHT)
    p.done("badge-block")


def ico_avatar_block() -> None:
    p = Ico()
    p.el((28, 28, 228, 228), fill=WHITE)
    person(p, (64, 44, 192, 220))
    p.done("avatar-block")


def ico_logo_item() -> None:
    p = Ico()
    p.rr((36, 56, 220, 200), 16, fill=WHITE)
    p.poly([(128, 72), (176, 128), (128, 184), (80, 128)], fill=LIGHT)
    p.el((112, 112, 144, 144), fill=WHITE, rim=False)
    p.done("logo-item")


def ico_quick_link_tile() -> None:
    p = Ico()
    p.rr((36, 36, 220, 220), 18, fill=WHITE)
    p.arc((48, 88, 140, 168), 90, 270, 16, DARK)
    p.arc((116, 88, 208, 168), 270, 90, 16, DARK)
    p.mark((108, 118, 148, 138), 5)
    p.done("quick-link-tile")


def ico_story_item() -> None:
    p = Ico()
    doc(p, (56, 28, 200, 228))
    p.done("story-item")


def ico_versus_item() -> None:
    p = Ico()
    p.rr((20, 72, 108, 184), 14, fill=WHITE)
    p.rr((148, 72, 236, 184), 14, fill=WHITE)
    p.poly([(116, 96), (140, 128), (116, 160), (108, 128)], fill=LIGHT)
    p.done("versus-item")


def ico_status_item() -> None:
    p = Ico()
    p.el((28, 28, 228, 228), fill=WHITE)
    p.line([(72, 132), (112, 176), (188, 84)], 16, DARK)
    p.done("status-item")


def ico_ranking_row() -> None:
    p = Ico()
    p.poly([(88, 28), (128, 92), (48, 92)], fill=LIGHT)
    p.rr((112, 80, 144, 176), 8, fill=LIGHT)
    p.poly([(168, 228), (208, 164), (128, 164)], fill=LIGHT)
    p.rr((152, 80, 184, 176), 8, fill=LIGHT)
    p.done("ranking-row")


def ico_media_item() -> None:
    p = Ico()
    p.rr((60, 28, 196, 228), 16, fill=WHITE)
    p.el((80, 48, 116, 84), fill=LIGHT, rim=False)
    p.poly([(72, 196), (108, 128), (140, 164), (164, 112), (184, 196)], fill=LIGHT)
    p.done("media-item")


def ico_accordion_item() -> None:
    p = Ico()
    p.rr((24, 40, 232, 112), 12, fill=WHITE)
    p.rr((24, 144, 232, 216), 12, fill=WHITE)
    bars(p, (44, 64, 168, 88), 1)
    plus(p, (188, 56, 220, 96), DARK)
    bars(p, (44, 168, 168, 192), 1)
    p.mark((196, 168, 212, 192), 4)
    p.done("accordion-item-rendering")


def ico_tab_rendering() -> None:
    p = Ico()
    p.rr((28, 36, 112, 88), 10, fill=WHITE)
    p.rr((120, 44, 196, 88), 10, fill=LIGHT)
    p.rr((28, 80, 228, 220), 14, fill=WHITE)
    bars(p, (48, 112, 208, 188), 3)
    p.done("tab-rendering")


def ico_lead_form_field() -> None:
    p = Ico()
    p.rr((24, 88, 232, 168), 12, fill=WHITE)
    bars(p, (44, 116, 160, 140), 1)
    p.mark((168, 108, 176, 148), 3)
    p.done("lead-form-field")


# ---------------------------------------------------------------------------
# Lists / grids / rails
# ---------------------------------------------------------------------------

def ico_articles_list_grid() -> None:
    p = Ico()

    def cell(q, b):
        x0, y0, x1, y1 = b
        q.rr((x0 + 14, y0 + 14, x1 - 14, y1 - 14), 6, fill=LIGHT)
        q.poly([(x1 - 28, y0 + 14), (x1 - 14, y0 + 28), (x1 - 14, y0 + 14)], fill=WHITE)

    grid2(p, cell)
    p.done("articles-list-grid")


def ico_products_list_grid() -> None:
    p = Ico()

    def cell(q, b):
        x0, y0, x1, y1 = b
        box3d(q, (x0 + 12, y0 + 12, x1 - 12, y1 - 12))

    grid2(p, cell)
    p.done("products-list-grid")


def ico_person_list_grid() -> None:
    p = Ico()
    grid2(p, lambda q, b: person(q, (b[0] + 10, b[1] + 8, b[2] - 10, b[3] - 8)))
    p.done("person-list-grid")


def ico_locations_list_grid() -> None:
    p = Ico()
    grid2(p, lambda q, b: pin(q, (b[0] + 16, b[1] + 8, b[2] - 16, b[3] - 8)))
    p.done("locations-list-grid")


def ico_destinations_list_grid() -> None:
    p = Ico()
    grid2(p, lambda q, b: plane(q, (b[0] + 6, b[1] + 16, b[2] - 6, b[3] - 16)))
    p.done("destinations-list-grid")


def ico_offers_list_grid() -> None:
    p = Ico()
    grid2(p, lambda q, b: tag(q, (b[0] + 8, b[1] + 8, b[2] - 8, b[3] - 8)))
    p.done("offers-list-grid")


def ico_features_list_grid() -> None:
    p = Ico()
    grid2(p, lambda q, b: lightbulb(q, (b[0] + 16, b[1] + 10, b[2] - 16, b[3] - 10)))
    p.done("features-list-grid")


def ico_reviews_list_grid() -> None:
    p = Ico()
    grid2(p, lambda q, b: star(q, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, 22, fill=LIGHT))
    p.done("reviews-list-grid")


def ico_stats_list_grid() -> None:
    p = Ico()
    grid2(p, lambda q, b: chart(q, (b[0] + 14, b[1] + 14, b[2] - 14, b[3] - 14)))
    p.done("stats-list-grid")


def ico_media_gallery_list_grid() -> None:
    p = Ico()

    def cell(q, b):
        x0, y0, x1, y1 = b
        q.el((x0 + 16, y0 + 16, x0 + 40, y0 + 40), fill=LIGHT, rim=False)
        q.poly([(x0 + 12, y1 - 12), (x0 + 36, y0 + 44), (x0 + 56, y0 + 64), (x1 - 12, y1 - 12)], fill=LIGHT)

    grid2(p, cell)
    p.done("media-gallery-list-grid")


def ico_pricing_list_grid() -> None:
    p = Ico()
    grid2(p, lambda q, b: dollar(q, (b[0] + 22, b[1] + 18, b[2] - 22, b[3] - 18)))
    p.done("pricing-list-grid")


def ico_status_list() -> None:
    p = Ico()
    for y in (36, 108, 180):
        p.rr((28, y, 228, y + 44), 10, fill=WHITE)
        p.el((44, y + 8, 76, y + 36), fill=LIGHT)
        p.line([(52, y + 22), (60, y + 30), (72, y + 14)], 5, DARK)
        bars(p, (92, y + 16, 196, y + 28), 1)
    p.done("status-list")


def ico_versus_list() -> None:
    p = Ico()
    p.rr((24, 40, 112, 216), 14, fill=WHITE)
    p.rr((144, 40, 232, 216), 14, fill=WHITE)
    p.el((108, 108, 148, 148), fill=LIGHT)
    p.done("versus-list")


def ico_link_list() -> None:
    p = Ico()
    for y in (40, 108, 176):
        p.el((32, y + 12, 64, y + 44), fill=LIGHT)
        p.rr((84, y + 16, 224, y + 40), 8, fill=WHITE)
    p.done("link-list")


def ico_linked_items_rail() -> None:
    p = Ico()
    p.el((48, 28, 132, 112), fill=LIGHT)
    p.el((68, 48, 112, 92), fill=WHITE, rim=False)
    p.el((124, 144, 208, 228), fill=LIGHT)
    p.el((144, 164, 188, 208), fill=WHITE, rim=False)
    p.rr((108, 96, 148, 160), 10, fill=LIGHT)
    p.done("linked-items-rail")


def ico_stories_rail() -> None:
    p = Ico()
    for x in (24, 96, 168):
        p.rr((x, 52, x + 64, 204), 10, fill=WHITE)
        bars(p, (x + 12, 72, x + 52, 116), 2)
    p.done("stories-rail")


def ico_logo_wall() -> None:
    p = Ico()
    grid2(
        p,
        lambda q, b: q.poly(
            [
                ((b[0] + b[2]) / 2, b[1] + 16),
                (b[2] - 16, (b[1] + b[3]) / 2),
                ((b[0] + b[2]) / 2, b[3] - 16),
                (b[0] + 16, (b[1] + b[3]) / 2),
            ],
            fill=LIGHT,
        ),
    )
    p.done("logo-wall")


def ico_ranking_table() -> None:
    p = Ico()
    p.rr((28, 36, 228, 220), 12, fill=WHITE)
    p.line([(28, 88), (228, 88)], 8)
    p.line([(28, 140), (228, 140)], 8)
    p.line([(92, 36), (92, 220)], 8)
    p.done("ranking-table")


def ico_matrix() -> None:
    p = Ico()
    cell, gap = 56, 12
    for r in range(3):
        for c in range(3):
            x, y = 38 + c * (cell + gap), 38 + r * (cell + gap)
            p.rr((x, y, x + cell, y + cell), 8, fill=WHITE)
    p.done("matrix")


def ico_quick_links_tiles() -> None:
    p = Ico()
    p.rr((28, 48, 118, 208), 14, fill=WHITE)
    p.rr((138, 48, 228, 208), 14, fill=WHITE)
    chev_rt(p, 73, 128, 18, 10, fill=LIGHT)
    chev_rt(p, 183, 128, 18, 10, fill=LIGHT)
    p.done("quick-links-tiles")


def ico_media_wall() -> None:
    p = Ico()
    p.rr((24, 32, 140, 140), 12, fill=WHITE)
    p.rr((152, 32, 232, 140), 12, fill=WHITE)
    p.rr((24, 152, 232, 224), 12, fill=WHITE)
    p.el((44, 48, 76, 80), fill=LIGHT, rim=False)
    p.poly([(40, 124), (72, 80), (100, 108), (128, 64), (140, 124)], fill=LIGHT)
    p.done("media-wall")


# ---------------------------------------------------------------------------
# Carousels
# ---------------------------------------------------------------------------

def ico_articles_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: doc(q, b))
    p.done("articles-carousel")


def ico_products_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: box3d(q, b))
    p.done("products-carousel")


def ico_person_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: person(q, b))
    p.done("person-carousel")


def ico_locations_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: pin(q, b))
    p.done("locations-carousel")


def ico_destinations_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: plane(q, b))
    p.done("destinations-carousel")


def ico_offers_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: tag(q, b))
    p.done("offers-carousel")


def ico_features_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: lightbulb(q, b))
    p.done("features-carousel")


def ico_reviews_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: star(q, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, 40, fill=LIGHT))
    p.done("reviews-carousel")


def ico_stats_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: chart(q, b))
    p.done("stats-carousel")


def ico_media_carousel() -> None:
    p = Ico()
    carousel(
        p,
        lambda q, b: q.poly(
            [(b[0] + 16, b[1] + 12), (b[2] - 8, (b[1] + b[3]) / 2), (b[0] + 16, b[3] - 12)],
            fill=LIGHT,
        ),
    )
    p.done("media-carousel")


def ico_pricing_carousel() -> None:
    p = Ico()
    carousel(p, lambda q, b: dollar(q, (b[0] + 16, b[1] + 24, b[2] - 16, b[3] - 24)))
    p.done("pricing-carousel")


# ---------------------------------------------------------------------------
# Page details
# ---------------------------------------------------------------------------

def ico_article_details() -> None:
    p = Ico()
    doc(p, (56, 24, 200, 232))
    p.done("article-details")


def ico_article_with_toc() -> None:
    p = Ico()
    p.rr((28, 28, 108, 228), 12, fill=WHITE)
    p.rr((128, 28, 228, 228), 12, fill=WHITE)
    bars(p, (44, 52, 92, 196), 4)
    bars(p, (148, 52, 208, 160), 3)
    p.done("article-with-toc-details")


def ico_news_details() -> None:
    p = Ico()
    p.rr((32, 28, 224, 228), 16, fill=WHITE)
    p.rr((48, 44, 124, 120), 8, fill=LIGHT)
    bars(p, (140, 48, 208, 112), 3)
    bars(p, (48, 144, 208, 204), 3)
    p.done("news-details")


def ico_case_study_details() -> None:
    p = Ico()
    office_stamp(p, "briefcase.png")
    p.done("case-study-details")


def ico_event_details() -> None:
    p = Ico()
    office_stamp(p, "calendar.png")
    p.done("event-details")


def ico_job_details() -> None:
    p = Ico()
    p.rr((48, 36, 208, 228), 16, fill=WHITE)
    p.rr((100, 24, 156, 52), 8, fill=LIGHT)
    person(p, (72, 64, 184, 200))
    p.done("job-details")


def ico_product_details() -> None:
    p = Ico()
    box3d(p, (36, 28, 220, 228))
    p.done("product-details")


def ico_service_details() -> None:
    p = Ico()
    wrench(p, (28, 28, 228, 228))
    p.done("service-details")


def ico_partner_details() -> None:
    p = Ico()
    office_stamp(p, "handshake.png")
    p.done("partner-details")


def ico_person_details() -> None:
    p = Ico()
    person(p, (48, 24, 208, 232))
    p.done("person-details")


def ico_location_details() -> None:
    p = Ico()
    pin(p, (48, 16, 208, 240))
    p.done("location-details")


def ico_destination_details() -> None:
    p = Ico()
    plane(p, (16, 48, 240, 208))
    p.done("destination-details")


def ico_offer_details() -> None:
    p = Ico()
    tag(p, (32, 32, 224, 224))
    p.done("offer-details")


def ico_landing_details() -> None:
    p = Ico()
    house(p, (24, 24, 232, 232))
    p.done("landing-details")


def ico_wildcard_detail() -> None:
    p = Ico()
    p.el((28, 28, 228, 228), fill=WHITE)
    p.el((112, 56, 144, 88), fill=LIGHT, rim=False)
    p.arc((88, 96, 168, 176), 200, 20, 14, DARK)
    p.el((112, 176, 144, 208), fill=LIGHT, rim=False)
    p.done("wildcard-detail")


def ico_wildcard_experience() -> None:
    p = Ico()
    puzzle(p)
    p.done("wildcard-experience")


# ---------------------------------------------------------------------------
# Forms
# ---------------------------------------------------------------------------

def ico_form_builder() -> None:
    p = Ico()
    clipboard(p)
    bars(p, (64, 84, 192, 200), 3)
    p.done("form-builder")


def ico_lead_form() -> None:
    p = Ico()
    p.rr((40, 24, 216, 232), 16, fill=WHITE)
    p.rr((60, 52, 196, 84), 8, fill=LIGHT)
    p.rr((60, 104, 196, 136), 8, fill=LIGHT)
    p.rr((60, 168, 148, 200), 8, fill=LIGHT)
    p.done("lead-form")


def ico_form_text_field() -> None:
    p = Ico()
    p.rr((20, 88, 236, 168), 12, fill=WHITE)
    bars(p, (40, 116, 168, 140), 1)
    p.mark((180, 108, 188, 148), 3)
    p.done("form-text-field")


def ico_form_textarea_field() -> None:
    p = Ico()
    p.rr((28, 40, 228, 216), 14, fill=WHITE)
    bars(p, (48, 64, 208, 176), 4)
    p.done("form-textarea-field")


def ico_form_select_field() -> None:
    p = Ico()
    p.rr((20, 88, 236, 168), 12, fill=WHITE)
    bars(p, (40, 116, 160, 140), 1)
    p.poly([(196, 108), (220, 128), (196, 148)], fill=LIGHT)
    p.done("form-select-field")


def ico_form_checkbox_field() -> None:
    p = Ico()
    office_stamp(p, "checkbox_selected.png")
    p.done("form-checkbox-field")


def ico_form_date_field() -> None:
    p = Ico()
    office_stamp(p, "calendar.png")
    p.done("form-date-field")


def ico_form_phone_field() -> None:
    p = Ico()
    phone(p, (32, 36, 224, 220))
    p.done("form-phone-field")


def ico_form_address_field() -> None:
    p = Ico()
    p.rr((40, 24, 216, 232), 16, fill=WHITE)
    house(p, (72, 48, 184, 168))
    bars(p, (60, 184, 196, 216), 2)
    p.done("form-address-field")


def ico_form_upload_field() -> None:
    p = Ico()
    p.poly([(128, 24), (196, 108), (60, 108)], fill=LIGHT)
    p.rr((108, 96, 148, 176), 8, fill=LIGHT)
    p.rr((36, 188, 220, 228), 10, fill=WHITE)
    p.done("form-upload-field")


def ico_form_range_field() -> None:
    p = Ico()
    p.rr((24, 112, 232, 144), 12, fill=LIGHT)
    p.el((100, 88, 156, 168), fill=WHITE)
    p.el((112, 100, 144, 156), fill=LIGHT, rim=False)
    p.done("form-range-field")


def ico_form_rating_field() -> None:
    p = Ico()
    star(p, 128, 128, 96, fill=LIGHT)
    p.done("form-rating-field")


def ico_form_fieldset() -> None:
    p = Ico()
    p.rr((28, 36, 228, 220), 16, fill=WHITE)
    p.rr((48, 72, 208, 200), 12, fill=LIGHT)
    p.rr((56, 24, 140, 56), 8, fill=WHITE)
    p.done("form-fieldset")


def ico_form_fieldset_array() -> None:
    p = Ico()
    p.rr((28, 24, 228, 112), 12, fill=WHITE)
    p.rr((28, 144, 228, 232), 12, fill=WHITE)
    plus(p, (188, 48, 212, 88), DARK)
    p.done("form-fieldset-array")


def ico_form_step() -> None:
    p = Ico()
    for i, x in enumerate((40, 128, 216)):
        p.el((x - 28, 100, x + 28, 156), fill=WHITE if i else LIGHT)
        if i < 2:
            p.rr((x + 24, 120, x + 60, 136), 4, fill=LIGHT)
    p.done("form-step")


def ico_form_summary() -> None:
    p = Ico()
    doc(p, (48, 24, 208, 232))
    p.done("form-summary")


def ico_form_conditional() -> None:
    p = Ico()
    p.el((28, 48, 100, 120), fill=LIGHT)
    p.el((156, 136, 228, 208), fill=LIGHT)
    p.line([(92, 96), (164, 160)], 12)
    p.poly([(148, 136), (176, 148), (152, 172)], fill=LIGHT)
    p.done("form-conditional")


def ico_subscribe_section() -> None:
    p = Ico()
    p.rr((28, 64, 228, 192), 14, fill=WHITE)
    p.poly([(28, 64), (128, 140), (228, 64)], fill=LIGHT)
    p.done("subscribe-section")


# ---------------------------------------------------------------------------
# Navigation
# ---------------------------------------------------------------------------

def ico_header() -> None:
    p = Ico()
    p.rr((24, 36, 232, 220), 14, fill=WHITE)
    p.rr((40, 52, 216, 92), 8, fill=LIGHT)
    p.el((52, 64, 80, 80), fill=WHITE, rim=False)
    bars(p, (100, 68, 200, 80), 1)
    p.done("header")


def ico_footer() -> None:
    p = Ico()
    p.rr((24, 36, 232, 220), 14, fill=WHITE)
    p.rr((40, 164, 216, 204), 8, fill=LIGHT)
    bars(p, (56, 176, 200, 192), 1)
    p.done("footer")


def ico_main_nav() -> None:
    p = Ico()
    p.rr((28, 28, 228, 228), 16, fill=WHITE)
    for y in (64, 112, 160):
        p.rr((52, y, 204, y + 28), 10, fill=LIGHT)
    p.done("main-nav")


def ico_mega_menu() -> None:
    p = Ico()
    p.rr((20, 32, 236, 76), 10, fill=LIGHT)
    p.rr((20, 92, 88, 224), 10, fill=WHITE)
    p.rr((104, 92, 172, 224), 10, fill=WHITE)
    p.rr((188, 92, 236, 224), 10, fill=WHITE)
    p.done("mega-menu")


def ico_mobile_menu() -> None:
    p = Ico()
    p.rr((76, 16, 180, 240), 24, fill=WHITE)
    bars(p, (96, 56, 160, 124), 3)
    p.el((112, 196, 144, 216), fill=LIGHT, rim=False)
    p.done("mobile-menu")


def ico_breadcrumb() -> None:
    p = Ico()
    p.rr((16, 100, 88, 156), 10, fill=WHITE)
    chev_rt(p, 112, 128, 16, 8, fill=LIGHT)
    p.rr((136, 100, 208, 156), 10, fill=WHITE)
    chev_rt(p, 228, 128, 16, 8, fill=LIGHT)
    p.done("breadcrumb")


def ico_language_switcher() -> None:
    p = Ico()
    office_stamp(p, "globe.png")
    p.done("language-switcher")


def ico_tree_navigation() -> None:
    p = Ico()
    p.rr((32, 36, 120, 84), 8, fill=LIGHT)
    p.rr((32, 72, 224, 220), 14, fill=WHITE)
    bars(p, (56, 108, 200, 208), 3)
    p.done("tree-navigation")


def ico_utility_trigger() -> None:
    p = Ico()
    p.poly(
        [
            (156, 24),
            (72, 132),
            (120, 132),
            (100, 232),
            (184, 124),
            (136, 124),
        ],
        fill=LIGHT,
    )
    p.done("utility-trigger")


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

def ico_search_bar() -> None:
    p = Ico()
    p.rr((16, 88, 240, 168), 40, fill=WHITE)
    mag(p, (28, 96, 108, 168))
    p.done("search-bar")


def ico_search_experience() -> None:
    p = Ico()
    mag(p, (24, 24, 232, 232))
    p.done("search-experience")


def ico_filter_panel() -> None:
    p = Ico()
    p.poly(
        [
            (28, 28),
            (228, 28),
            (156, 124),
            (156, 228),
            (100, 228),
            (100, 124),
        ],
        fill=LIGHT,
    )
    p.rr((112, 148, 144, 212), 8, fill=WHITE)
    p.done("filter-panel")


def ico_search_controls_bar() -> None:
    p = Ico()
    p.arc((36, 36, 220, 220), 40, 300, 18, DARK)
    p.poly([(200, 40), (236, 36), (216, 88)], fill=LIGHT)
    p.done("search-controls-bar")


def ico_search_pagination_bar() -> None:
    p = Ico()
    p.rr((20, 96, 76, 160), 10, fill=WHITE)
    p.rr((90, 88, 166, 168), 12, fill=LIGHT)
    p.rr((180, 96, 236, 160), 10, fill=WHITE)
    chev_lt(p, 48, 128, 12, 7, fill=LIGHT)
    chev_rt(p, 208, 128, 12, 7, fill=LIGHT)
    p.done("search-pagination-bar")


def ico_location_search_bar() -> None:
    p = Ico()
    p.rr((16, 88, 240, 168), 40, fill=WHITE)
    pin(p, (36, 96, 100, 168))
    p.done("location-search-bar")


def ico_search_booking_bar() -> None:
    p = Ico()
    p.rr((16, 80, 240, 176), 16, fill=WHITE)
    p.el((36, 96, 108, 160), fill=LIGHT)
    p.line([(72, 128), (72, 108)], 8, DARK)
    p.line([(72, 128), (92, 140)], 8, DARK)
    p.rr((128, 112, 216, 144), 8, fill=LIGHT)
    p.done("search-booking-bar")


def ico_search_booking_mode() -> None:
    p = Ico()
    p.arc((36, 56, 220, 200), 200, 20, 16, DARK)
    p.poly([(200, 56), (236, 36), (224, 88)], fill=LIGHT)
    p.arc((36, 72, 220, 216), 20, 200, 16, DARK)
    p.poly([(56, 200), (20, 220), (32, 168)], fill=LIGHT)
    p.done("search-booking-mode")


def ico_search_booking_segment() -> None:
    p = Ico()
    p.rr((16, 88, 100, 168), 14, fill=WHITE)
    p.rr((156, 88, 240, 168), 14, fill=WHITE)
    chev_rt(p, 128, 128, 20, 10, fill=LIGHT)
    p.el((40, 112, 76, 148), fill=LIGHT)
    p.el((180, 112, 216, 148), fill=LIGHT)
    p.done("search-booking-segment")


def ico_travel_search() -> None:
    p = Ico()
    mag(p, (8, 8, 200, 200))
    plane(p, (40, 64, 160, 140))
    p.done("travel-search")


def ico_locations_map() -> None:
    p = Ico()
    p.poly(
        [
            (24, 56),
            (96, 28),
            (176, 64),
            (232, 40),
            (232, 196),
            (176, 228),
            (96, 188),
            (24, 216),
        ],
        fill=LIGHT,
    )
    pin(p, (88, 64, 168, 188))
    p.done("locations-map")


# ---------------------------------------------------------------------------
# Media / UI
# ---------------------------------------------------------------------------

def ico_image() -> None:
    p = Ico()
    camera(p, (28, 40, 228, 216))
    p.done("image")


def ico_video() -> None:
    p = Ico()
    film(p)
    p.done("video")


def ico_code_snippet() -> None:
    p = Ico()
    window(p, (24, 28, 232, 228))
    chev_lt(p, 80, 128, 32, 14, fill=LIGHT)
    p.line([(108, 156), (128, 96)], 10)
    chev_rt(p, 176, 128, 32, 14, fill=LIGHT)
    bars(p, (56, 188, 200, 204), 1)
    p.done("code-snippet")


def ico_content_block() -> None:
    p = Ico()
    doc(p, (28, 48, 168, 232))
    p.poly([(148, 28), (176, 56), (232, 28), (232, 56), (176, 84), (148, 56)], fill=LIGHT)
    p.poly([(176, 84), (232, 56), (220, 140), (164, 168)], fill=WHITE)
    p.done("content-block")


def ico_block_quote() -> None:
    p = Ico()
    quotes(p)
    bars(p, (36, 184, 220, 208), 1)
    p.done("block-quote")


def ico_cta_button() -> None:
    p = Ico()
    p.rr((16, 84, 240, 172), 44, fill=WHITE)
    bars(p, (48, 116, 148, 140), 1)
    chev_rt(p, 188, 128, 22, 10, fill=LIGHT)
    p.done("cta-button")


def ico_accordion_block() -> None:
    p = Ico()
    for i, y in enumerate((28, 100, 172)):
        p.rr((24, y, 232, y + 56), 12, fill=WHITE)
        bars(p, (44, y + 18, 168, y + 38), 1)
        if i == 0:
            plus(p, (188, y + 12, 220, y + 44), DARK)
        else:
            p.mark((196, y + 24, 220, y + 32), 3)
    p.done("accordion-block")


def ico_visual_accordion() -> None:
    p = Ico()
    p.rr((24, 28, 232, 120), 14, fill=WHITE)
    p.el((44, 44, 84, 84), fill=LIGHT, rim=False)
    p.poly([(40, 104), (72, 60), (96, 84), (124, 48), (160, 104)], fill=LIGHT)
    p.rr((24, 140, 232, 188), 12, fill=WHITE)
    p.rr((24, 204, 232, 232), 12, fill=WHITE)
    plus(p, (196, 152, 220, 176), DARK)
    p.done("visual-accordion")


def ico_tabs_block() -> None:
    p = Ico()
    p.rr((24, 36, 100, 92), 10, fill=WHITE)
    p.rr((108, 44, 176, 92), 10, fill=LIGHT)
    p.rr((184, 44, 232, 92), 10, fill=LIGHT)
    p.rr((24, 84, 232, 220), 14, fill=WHITE)
    bars(p, (44, 116, 212, 188), 3)
    p.done("tabs-block")


def ico_visual_tabs() -> None:
    p = Ico()
    p.rr((24, 28, 100, 84), 10, fill=WHITE)
    p.rr((108, 36, 176, 84), 10, fill=LIGHT)
    p.rr((184, 36, 232, 84), 10, fill=LIGHT)
    p.rr((24, 76, 232, 228), 14, fill=WHITE)
    p.el((48, 100, 88, 140), fill=LIGHT, rim=False)
    p.poly([(40, 200), (80, 132), (112, 168), (152, 108), (212, 200)], fill=LIGHT)
    p.done("visual-tabs")


def ico_recipe_spec() -> None:
    p = Ico()
    p.rr((28, 28, 228, 176), 14, fill=WHITE)
    p.rr((108, 168, 148, 228), 8, fill=LIGHT)
    p.rr((72, 216, 184, 236), 6, fill=LIGHT)
    bars(p, (48, 52, 208, 148), 3)
    p.done("recipe-spec")


# ---------------------------------------------------------------------------
# Social / AI
# ---------------------------------------------------------------------------

def ico_social_share() -> None:
    p = Ico()
    office_stamp(p, "users.png")
    p.done("social-share")


def ico_social_links() -> None:
    p = Ico()
    office_stamp(p, "users_relation.png")
    p.done("social-links")


def ico_ai_chat() -> None:
    p = Ico()
    p.rr((28, 36, 228, 176), 20, fill=WHITE)
    p.poly([(64, 176), (64, 228), (112, 176)], fill=LIGHT)
    bars(p, (60, 80, 196, 140), 2)
    p.done("ai-chat")


def ico_ai_chat_widget() -> None:
    p = Ico()
    p.rr((28, 48, 196, 176), 20, fill=WHITE)
    p.poly([(56, 176), (56, 228), (108, 176)], fill=LIGHT)
    star(p, 208, 56, 28, fill=LIGHT)
    bars(p, (52, 84, 168, 104), 1)
    p.done("ai-chat-widget")


# ---------------------------------------------------------------------------
# Sections
# ---------------------------------------------------------------------------

def ico_layout_section() -> None:
    p = Ico()
    p.rr((20, 28, 236, 228), 16, fill=WHITE)
    p.rr((36, 44, 220, 76), 6, fill=LIGHT)
    p.rr((36, 92, 92, 212), 8, fill=LIGHT)
    p.rr((108, 92, 164, 212), 8, fill=LIGHT)
    p.rr((180, 92, 220, 212), 8, fill=LIGHT)
    p.done("layout-section")


def ico_heros_and_promos_section() -> None:
    p = Ico()
    p.poly([(128, 20), (204, 108), (176, 236), (80, 236), (52, 108)], fill=LIGHT)
    p.poly([(128, 72), (156, 140), (100, 140)], fill=WHITE)
    p.done("heros-and-promos-section")


def ico_cards_and_lists_section() -> None:
    p = Ico()
    p.el((28, 28, 228, 92), fill=LIGHT)
    p.rr((28, 68, 228, 188), 0, fill=WHITE)
    p.el((28, 164, 228, 228), fill=LIGHT)
    p.line([(44, 92), (212, 92)], 8)
    p.line([(44, 164), (212, 164)], 8)
    p.done("cards-and-lists-section")


def ico_page_details_section() -> None:
    p = Ico()
    doc(p, (56, 24, 200, 232))
    p.done("page-details-section")


def ico_navigation_section() -> None:
    p = Ico()
    p.rr((100, 24, 156, 72), 8, fill=LIGHT)
    p.rr((28, 72, 228, 220), 14, fill=WHITE)
    bars(p, (52, 100, 204, 188), 3)
    p.done("navigation-section")


def ico_forms_section() -> None:
    p = Ico()
    clipboard(p)
    bars(p, (64, 88, 192, 196), 3)
    p.done("forms-section")


def ico_search_section() -> None:
    p = Ico()
    mag(p, (24, 24, 232, 232))
    p.done("search-section")


def ico_social_section() -> None:
    p = Ico()
    person(p, (16, 40, 136, 232))
    person(p, (120, 56, 240, 232))
    p.done("social-section")


def ico_ai_section() -> None:
    p = Ico()
    p.rr((48, 48, 88, 208), 10, fill=LIGHT)
    p.el((36, 20, 100, 72), fill=LIGHT)
    star(p, 176, 72, 44, fill=LIGHT)
    star(p, 208, 160, 24, fill=LIGHT)
    p.done("ai-section")


def ico_feedback_section() -> None:
    p = Ico()
    p.rr((88, 28, 148, 92), 12, fill=LIGHT)
    p.rr((36, 84, 220, 228), 18, fill=WHITE)
    p.rr((56, 112, 100, 208), 10, fill=LIGHT)
    p.done("feedback-section")


def ico_ui_section() -> None:
    p = Ico()
    p.el((156, 24, 232, 100), fill=LIGHT)
    p.rr((108, 72, 180, 232), 16, fill=WHITE)
    p.poly([(36, 232), (108, 232), (108, 140)], fill=LIGHT)
    p.el((176, 40, 212, 76), fill=WHITE, rim=False)
    p.done("ui-section")


ALL = [
    ico_container,
    ico_column_splitter,
    ico_row_splitter,
    ico_section_wrapper,
    ico_scroll_scene,
    ico_scroll_to_top,
    ico_hero,
    ico_hero_carousel,
    ico_promo,
    ico_tagline_banner,
    ico_alert_banner,
    ico_inline_banner,
    ico_countdown_banner,
    ico_subscription_banner,
    ico_consent_banner,
    ico_article_header,
    ico_card_block,
    ico_feature_card,
    ico_article_card,
    ico_product_card,
    ico_person_card,
    ico_location_card,
    ico_destination_card,
    ico_offer_card,
    ico_review_card,
    ico_callout_card,
    ico_pricing_card,
    ico_stats_card,
    ico_badge_block,
    ico_avatar_block,
    ico_logo_item,
    ico_quick_link_tile,
    ico_story_item,
    ico_versus_item,
    ico_status_item,
    ico_ranking_row,
    ico_media_item,
    ico_accordion_item,
    ico_tab_rendering,
    ico_lead_form_field,
    ico_articles_list_grid,
    ico_products_list_grid,
    ico_person_list_grid,
    ico_locations_list_grid,
    ico_destinations_list_grid,
    ico_offers_list_grid,
    ico_features_list_grid,
    ico_reviews_list_grid,
    ico_stats_list_grid,
    ico_media_gallery_list_grid,
    ico_pricing_list_grid,
    ico_status_list,
    ico_versus_list,
    ico_link_list,
    ico_linked_items_rail,
    ico_stories_rail,
    ico_logo_wall,
    ico_ranking_table,
    ico_matrix,
    ico_quick_links_tiles,
    ico_media_wall,
    ico_articles_carousel,
    ico_products_carousel,
    ico_person_carousel,
    ico_locations_carousel,
    ico_destinations_carousel,
    ico_offers_carousel,
    ico_features_carousel,
    ico_reviews_carousel,
    ico_stats_carousel,
    ico_media_carousel,
    ico_pricing_carousel,
    ico_article_details,
    ico_article_with_toc,
    ico_news_details,
    ico_case_study_details,
    ico_event_details,
    ico_job_details,
    ico_product_details,
    ico_service_details,
    ico_partner_details,
    ico_person_details,
    ico_location_details,
    ico_destination_details,
    ico_offer_details,
    ico_landing_details,
    ico_wildcard_detail,
    ico_wildcard_experience,
    ico_form_builder,
    ico_lead_form,
    ico_form_text_field,
    ico_form_textarea_field,
    ico_form_select_field,
    ico_form_checkbox_field,
    ico_form_date_field,
    ico_form_phone_field,
    ico_form_address_field,
    ico_form_upload_field,
    ico_form_range_field,
    ico_form_rating_field,
    ico_form_fieldset,
    ico_form_fieldset_array,
    ico_form_step,
    ico_form_summary,
    ico_form_conditional,
    ico_subscribe_section,
    ico_header,
    ico_footer,
    ico_main_nav,
    ico_mega_menu,
    ico_mobile_menu,
    ico_breadcrumb,
    ico_language_switcher,
    ico_tree_navigation,
    ico_utility_trigger,
    ico_search_bar,
    ico_search_experience,
    ico_filter_panel,
    ico_search_controls_bar,
    ico_search_pagination_bar,
    ico_location_search_bar,
    ico_search_booking_bar,
    ico_search_booking_mode,
    ico_search_booking_segment,
    ico_travel_search,
    ico_locations_map,
    ico_image,
    ico_video,
    ico_code_snippet,
    ico_content_block,
    ico_block_quote,
    ico_cta_button,
    ico_accordion_block,
    ico_visual_accordion,
    ico_tabs_block,
    ico_visual_tabs,
    ico_recipe_spec,
    ico_social_share,
    ico_social_links,
    ico_ai_chat,
    ico_ai_chat_widget,
    ico_layout_section,
    ico_heros_and_promos_section,
    ico_cards_and_lists_section,
    ico_page_details_section,
    ico_navigation_section,
    ico_forms_section,
    ico_search_section,
    ico_social_section,
    ico_ai_section,
    ico_feedback_section,
    ico_ui_section,
]


def _palette_report(paths: list[Path]) -> None:
    dark_hex = DARK[:3]
    light_hex = LIGHT[:3]
    white_hex = WHITE[:3]
    print("Palette sample (non-white pixels):")
    for name in (
        "social-links.png",
        "destination-details.png",
        "destination-card.png",
        "service-details.png",
        "code-snippet.png",
        "form-phone-field.png",
    ):
        path = OUT / name
        if not path.exists():
            continue
        im = Image.open(path).convert("RGBA")
        n = {"white": 0, "light": 0, "dark": 0, "other": 0}
        for pix in im.getdata():
            rgb = pix[:3]
            if pix[3] < 16:
                continue
            if rgb == white_hex:
                n["white"] += 1
            elif rgb == light_hex:
                n["light"] += 1
            elif rgb == dark_hex:
                n["dark"] += 1
            else:
                n["other"] += 1
        vis = n["light"] + n["dark"] + n["other"]
        dark_pct = (100 * n["dark"] / vis) if vis else 0
        print(f"  {name}: white={n['white']} light={n['light']} dark={n['dark']} other={n['other']}  dark/visible={dark_pct:.0f}%")


def main() -> None:
    for fn in ALL:
        fn()
    pngs = sorted(p for p in OUT.glob("*.png") if not p.name.startswith("_"))
    print(f"Wrote {len(pngs)} PNGs")
    _palette_report(pngs)

    zip_path = OUT / "page-builder-icons.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in pngs:
            zf.write(p, p.name)
    print(f"Zipped {zip_path.name} ({len(pngs)} files)")

    cols = 12
    cell = 56
    rows = (len(pngs) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cell, rows * cell), BG)
    grid = ImageDraw.Draw(sheet)
    for i, path in enumerate(pngs):
        im = Image.open(path).convert("RGBA")
        x, y = (i % cols) * cell, (i // cols) * cell
        grid.rectangle((x, y, x + cell - 1, y + cell - 1), outline=(230, 230, 230, 255))
        pad = (cell - FINAL) // 2
        sheet.paste(im, (x + pad, y + pad), im)
    sheet.save(OUT / "_contact-sheet.png")


if __name__ == "__main__":
    main()
