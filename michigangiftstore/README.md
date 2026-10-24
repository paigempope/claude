# michigangiftstore.com

A custom Shopify theme ("Mitten") plus research for **Michigan Gift Store**, the statewide sister brand of
[detroitgiftstore.com](https://detroitgiftstore.com). It sells Michigan-only grocery classics (Better Made, Faygo,
Vernors, Sanders, Mackinac fudge, Up North cherries, U.P. treats) to Michiganders who moved away and to the people who shop for them.

```
michigangiftstore/
├── theme/        Shopify Online Store 2.0 theme, built from scratch (no Dawn code). Theme Check: 0 errors, 0 warnings
├── data/         catalog.py → items, boxes, shelves, map pins → mgs-data.liquid + products.csv (boxes-only import)
├── research/     competitor teardown (21 stores), brand audit + product catalog, strategy & launch checklist
└── preview/      local renderer: renders the real theme files with mock data for design review
```

**Start with [`research/strategy.md`](research/strategy.md).** It explains each design decision, maps it to the
competitor finding behind it, and includes the step-by-step Shopify launch checklist.

## The theme at a glance

- **Look:**
  - Great Lakes postcard hero ("Greetings from MICHIGAN") with a postage stamp and postmark
  - An accurate two-peninsula Michigan outline, projected from public-domain US Census data
  - Self-hosted Fraunces, Overpass, Patrick Hand SC and DM Mono fonts
  - Lake-and-pines atmosphere: sky-to-lake hero, pine treeline, Great Lakes blue band, water-blue sections
  - Custom Michigan line icons instead of emoji; brand colors shared with Detroit Gift Store (navy, red, gold)
- **Interactive, Detroit Gift Store model:**
  - **Boxes only.** Five Michigan boxes, a flat-price builder ($49 / $89) and add-ons. The 30 Michigan items are content, not products.
  - **Box cards that open:**
    - polaroid items with each one's hometown and why people miss it
    - a "Worth $X on its own" anchor
    - three gift steps: pick the postcard (or your photo, +$10); who's it going to (ship to them, text or email them for their address, or ship to me); when to ship (next business day or hold for the holidays)
  - **Shelf builder:** Size, Fill it, Postcard + send, Review. Pop, salty, sweet, Up North pantry and keepsake shelves, with balance rules.
  - **"Every item has a Michigan address" map:** every item pinned to its real hometown. Tap a town to see what it puts in the box.
  - **Gift finder by person:** moved away, cottage crowd, Yooper, family statewide, client.
  - **Multi-recipient cart:** asks for every extra address before checkout.
  - **Also included:** free-shipping meter, holiday countdown and deadline table, FAQ with schema.
- **Merchant-editable:** every section has theme-editor settings. Product storytelling comes from `custom.*`
  metafields (region, origin city, founding year, "why they miss it", box contents). Reviews apps plug in through
  the standard `reviews.*` metafields and app blocks.
- **Performance:** vanilla JS (no jQuery, no frameworks), one CSS file, responsive `image_tag` srcsets, lazy-loaded
  recommendations, and preloaded fonts served from Shopify's CDN.

## Deploy

```bash
npm i -g @shopify/cli
shopify theme push --path theme --unpublished --store <your-store>.myshopify.com
```

Then follow the launch checklist in `research/strategy.md`: metafield definitions, product import, collections,
menus, pages, shipping profiles and apps.

## Preview locally (no Shopify needed)

```bash
cd preview && npm install && npm run build   # writes preview/dist
python3 -m http.server -d dist 8765           # open http://localhost:8765
```

The preview uses liquidjs with shims for Shopify-only tags, so it is close to the real store but not exact. Use
`shopify theme dev` for full fidelity. The product images in the preview are illustrated placeholders.

## Validate

```bash
shopify theme check --path theme
```
