#!/usr/bin/env python3
"""Rename, crop-to-fill, and zip the PagesIcons download set."""

from __future__ import annotations

import re
import zipfile
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path("/Users/zac/Downloads/PagesIcons")
OUT = Path(__file__).resolve().parent
ICONS_TS = Path(__file__).resolve().parents[3] / "_component-icons.ts"
ZIP_PATH = OUT / "page-builder-icons.zip"
SIZE = 256
FILL = 0.90  # glyph occupies this fraction of the square
CONTENT_MAX = 230  # pixels darker than this count as the pictogram

# Descriptive download names → kebab stem (handle without @1)
PREFIX_TO_STEM: list[tuple[str, str]] = [
    ("AI_chat_bubble", "ai-chat"),
    ("AI_chat_widget", "ai-chat-widget"),
    ("Airplane_pictogram_for_destinati", "destination-details"),
    ("Arrow_pointing_into_tray", "form-upload-field"),
    ("Briefcase_UI_pictogram", "case-study-details"),
    ("CTA_button_pictogram", "cta-button"),
    ("Calendar_enterprise_pictogram", "event-details"),
    ("Calendar_grid_icon", "form-date-field"),
    ("Checkbox_icon_UI", "form-checkbox-field"),
    ("Circle_with_question_mark", "wildcard-detail"),
    ("Clipboard_icon_design", "form-builder"),
    ("Code_snippet_window", "code-snippet"),
    ("Cursor_over_window", "ui-section"),
    ("Designing_lead_form", "lead-form"),
    ("Document_and_pen", "content-block"),
    ("Document_checklist", "form-summary"),
    ("Document_frame_pictogram", "articles-carousel"),
    ("Document_pictogram_with_text_lines", "article-details"),
    ("Dropdown_select_field", "form-select-field"),
    ("Enterprise_document_pictogram", "page-details-section"),
    ("Enterprise_house_pictogram", "landing-details"),
    ("Enterprise_magnifying_glass", "search-experience"),
    ("Enterprise_pictogram_of_airplane", "destinations-carousel"),
    ("Enterprise_pictogram_of_bar_chart", "stats-carousel"),
    ("Enterprise_pictogram_of_camera", "image"),
    ("Enterprise_pictogram_of_clipboard", "forms-section"),
    ("Enterprise_pictogram_of_lightnin", "utility-trigger"),
    ("Enterprise_pictogram_of_nodes_co", "search-booking-segment"),
    ("Enterprise_pictogram_of_pills", "breadcrumb"),
    ("Enterprise_pictogram_of_sparkles", "ai-section"),
    ("Enterprise_speech_bubble", "feedback-section"),
    ("Enterprise_star_pictogram", "form-rating-field"),
    ("Envelope_UI_pictogram_subscribe", "subscribe-section"),
    ("Film_strip_play_button", "video"),
    ("Folded_map_with_map_pin", "locations-map"),
    ("Framed_star_icon_with_chevrons", "reviews-carousel"),
    ("Funnel_pictogram_filter_panel", "filter-panel"),
    ("Hamburger_menu_icon", "main-nav"),
    ("Handshake_enterprise_pictogram", "partner-details"),
    ("House_address_icon", "form-address-field"),
    ("ID_badge_pictogram", "job-details"),
    ("Indented_folder_tree", "tree-navigation"),
    ("Language_switcher_globe", "language-switcher"),
    ("Layout_section_pictogram", "layout-section"),
    ("Lightbulb_pictogram_in_frame", "features-carousel"),
    ("Location_search_bar_icon", "location-search-bar"),
    ("Magnifier_with_plane_icon", "travel-search"),
    ("Magnifying_glass_search_section", "search-section"),
    ("Map_pin_UI_icon", "locations-carousel"),
    ("Map_pin_UI_pictogram", "location-details"),
    ("Media_carousel_UI_pictogram", "media-carousel"),
    ("Mega_menu_navigation", "mega-menu"),
    ("Megapone_pictogram", "heros-and-promos-section"),
    ("Mobile_menu_phone", "mobile-menu"),
    ("Newspaper_pictogram", "news-details"),
    ("Open_book_pictogram", "recipe-spec"),
    ("Package_pictogram", "product-details"),
    ("Person_carousel_UI_icon", "person-carousel"),
    ("Person_silhouette_pictogram", "person-details"),
    ("Pictogram_of_HTML_fieldset", "form-fieldset"),
    ("Pictogram_of_article_with_TOC", "article-with-toc-details"),
    ("Pictogram_of_photo_mosaic", "media-wall"),
    ("Pictogram_of_quotation_marks", "block-quote"),
    ("Pictogram_of_range_slider", "form-range-field"),
    ("Pictogram_of_social_links", "social-links"),
    ("Pictogram_of_two_people", "social-section"),
    ("Pictogram_of_visual_tabs", "visual-tabs"),
    ("Price_tag_icon_design", "offers-carousel"),
    ("Price_tag_pictogram_design", "offer-details"),
    ("Pricing_carousel_icon", "pricing-carousel"),
    ("Products_carousel_UI", "products-carousel"),
    ("Puzzle_piece_pictogram", "wildcard-experience"),
    ("Refresh_or_rotate_arrow", "search-controls-bar"),
    ("Search_bar_UI_pictogram", "search-bar"),
    ("Search_bar_with_clock", "search-booking-bar"),
    ("Search_pagination_pictogram", "search-pagination-bar"),
    ("Site_tree_enterprise_pictogram", "navigation-section"),
    ("Social_share_pictogram", "social-share"),
    ("Stacked_cards_pictogram", "cards-and-lists-section"),
    ("Stacked_rectangles_with_plus_sign", "form-fieldset-array"),
    ("Tabs_block_pictogram", "tabs-block"),
    ("Telephone_handset_icon", "form-phone-field"),
    ("Text_area_input_pictogram", "form-textarea-field"),
    ("Text_input_bar_with_cursor", "form-text-field"),
    ("Three-step_process_indicator", "form-step"),
    ("Three_row_accordion_block", "accordion-block"),
    ("Two_nodes_connected_by_arrow", "form-conditional"),
    ("Two_swap_arrows_pictogram", "search-booking-mode"),
    ("Visual_accordion_enterprise_pict", "visual-accordion"),
    ("Website_footer_pictogram", "footer"),
    ("Website_header_pictogram", "header"),
    ("Wrench_pictogram_on_white_backgr", "service-details"),
]


def expected_stems() -> set[str]:
    text = ICONS_TS.read_text()
    return set(re.findall(r'"([a-z0-9-]+)@1"', text))


def stem_for(name: str) -> str:
    if ".png_" in name:
        return name.split(".png_")[0]
    matches = [stem for prefix, stem in PREFIX_TO_STEM if name.startswith(prefix)]
    if len(matches) != 1:
        raise SystemExit(f"Could not map {name!r} → {matches}")
    return matches[0]


def content_bbox(im: Image.Image) -> tuple[int, int, int, int]:
    gray = im.convert("L")
    mask = gray.point(lambda p: 255 if p <= CONTENT_MAX else 0)
    # Drop JPEG specks so a stray dark pixel does not inflate the crop.
    mask = mask.filter(ImageFilter.MinFilter(3))
    bbox = mask.getbbox()
    if bbox is None:
        raise SystemExit("no content")
    x0, y0, x1, y1 = bbox
    return (max(0, x0 - 2), max(0, y0 - 2), min(im.width, x1 + 2), min(im.height, y1 + 2))


def crop_to_fill(im: Image.Image) -> Image.Image:
    rgb = im.convert("RGB")
    x0, y0, x1, y1 = content_bbox(rgb)
    w, h = x1 - x0, y1 - y0
    side = max(w, h)
    pad = int(round(side * (1 / FILL - 1) / 2))
    half = side / 2 + pad
    cx = (x0 + x1) / 2
    cy = (y0 + y1) / 2
    left = int(round(cx - half))
    top = int(round(cy - half))
    size = int(round(half * 2))
    canvas = Image.new("RGB", (size, size), (255, 255, 255))
    src = rgb.crop(
        (
            max(0, left),
            max(0, top),
            min(rgb.width, left + size),
            min(rgb.height, top + size),
        )
    )
    canvas.paste(src, (max(0, -left), max(0, -top)))
    return canvas.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def main() -> None:
    expected = expected_stems()
    files = sorted(
        p
        for p in SRC.iterdir()
        if p.suffix.lower() in {".jpeg", ".jpg", ".png"} and not p.name.startswith(".")
    )
    mapped: dict[str, Path] = {}
    for path in files:
        stem = stem_for(path.name)
        if stem in mapped:
            raise SystemExit(f"Duplicate stem {stem}: {mapped[stem].name} and {path.name}")
        mapped[stem] = path

    missing = sorted(expected - mapped.keys())
    extra = sorted(mapped.keys() - expected)
    if missing or extra:
        raise SystemExit(f"missing={missing}\nextra={extra}")

    written: list[Path] = []
    fills: list[tuple[str, float]] = []
    for stem, path in sorted(mapped.items()):
        src = Image.open(path)
        out = crop_to_fill(src)
        dest = OUT / f"{stem}.png"
        out.save(dest, "PNG")
        written.append(dest)
        bx0, by0, bx1, by1 = content_bbox(out)
        fills.append((stem, max(bx1 - bx0, by1 - by0) / SIZE))

    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for dest in written:
            zf.write(dest, dest.name)

    small = [f"{n}={v:.0%}" for n, v in fills if v < 0.7]
    print(f"wrote {len(written)} pngs + {ZIP_PATH.name}")
    print(f"fill min={min(v for _, v in fills):.0%} max={max(v for _, v in fills):.0%}")
    if small:
        print("still small:", ", ".join(small[:20]))


if __name__ == "__main__":
    main()
