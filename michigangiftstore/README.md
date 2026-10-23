# michigangiftstore.com

A custom Shopify theme ("Mitten") plus research for **Michigan Gift Store**, the statewide sister brand of
[detroitgiftstore.com](https://detroitgiftstore.com). It sells Michigan-only grocery classics (Better Made, Faygo,
Vernors, Sanders, Mackinac fudge, Up North cherries, U.P. treats) to Michiganders who moved away and to the people who shop for them.

```
michigangiftstore/
├── theme/        Shopify Online Store 2.0 theme, built from scratch (no Dawn code). Theme Check: 0 errors, 0 warnings
├── data/         catalog.py → products.csv (Shopify import: 36 shelf-stable items, 4 gift boxes, box builder)
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
- **Conversion features:**
  - Free-shipping progress bar and holiday-deadline countdown
  - Ships-free badges and good / better / best box tiers
  - Shop-by-price tiles and a "What do they miss most?" gift finder
  - Interactive shop-by-region map
  - Build-your-own box (no app)
  - Gift note, gift-receipt and ship-date fields in the cart
  - Sticky add-to-cart, quick add and a cart-drawer upsell
  - A real ship-by countdown on product pages (1 p.m. ET cutoff)
  - Holiday deadline table and FAQ (with FAQ schema)
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
