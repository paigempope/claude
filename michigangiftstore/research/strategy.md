# Michigan Gift Store: Positioning & Conversion Plan

How the research (`competitor-teardown.md`, `brand-audit-and-product-catalog.md`) turned into the
theme in `../theme`. Research date: October 23, 2026.

## 1. Positioning: the open lane

**"The Michigan grocery aisle you miss, shipped."**

- **No live store owns this lane.** Mitten Crate built its box around Faygo, Better Made and Sanders, and its
  Shopify store was offline ("Store unavailable") on Oct 23, 2026.
- **The other Michigan sellers are artisan-led.** Michigan Awesome, Cherry Republic, American Spoon, Michigan
  Pantry and Gift Baskets from Michigan sell artisan, cherry or apparel items. None of the iconic
  grocery brands appeared in Michigan Awesome's food filters.
- **The brands themselves don't sell gifts.** Better Made sells cases, Sanders sells chocolate, and Pure Detroit
  sells Faygo *merchandise*. None of them makes a mixed Michigan gift.
- **Our edge is shelf-stable shipping.** The national "Taste of Michigan" box (Goldbelly) is frozen, with a
  "product may thaw" warning. Shelf-stable boxes ship ground with no dry ice, which costs less and arrives
  more reliably.

### Split with the sister brand (avoid competing with Detroit Gift Store)

detroitgiftstore.com already has a `michigan-gift-boxes` collection and a $79 "Michigan Box". To keep the two sites
from fighting over the same Google queries:

| | Detroit Gift Store | Michigan Gift Store |
|---|---|---|
| Owns | "Detroit gifts", 313, coneys, Motown, Lions-adjacent | "Michigan gifts", statewide, Up North, U.P., West MI, Thumb |
| Hero products | Detroit-only boxes | Regional and statewide boxes, à la carte grocery icons |
| Cross-link | "Shopping for a Michigander outside the D?" → MGS | Region map "Metro Detroit" panel and footer card → DGS |

**Recommended change on DGS:** point its Michigan Box to MGS (or rename it toward Detroit), and add a canonical or
cross-link so only one site targets "michigan gift box".

**Shared family DNA.** The two brands should feel related. They share:
- Brand colors: navy #1F2D5C, red #B8352B, mustard gold #E9C450
- Fonts: Overpass for body text, Patrick Hand SC for handwritten kickers
- The lowercase "so, who's it for?" kicker pattern
- The "item, size | Place · since year" product line format

They differ in setting:
- **DGS:** cream paper, road signs and blackletter.
- **MGS:** the outdoors. Cool lake-mist and shallow-water blues instead of tan, a sky-to-lake hero with a pine treeline and
  waves, a Great Lakes blue heritage band, a pine-forest shoreline above the footer, postcards, stamps and an accurate
  two-peninsula map, with Fraunces as the display font.

**No emojis anywhere.** Use the theme's Michigan line-icon set instead (chip bag, pop can, fudge, cherries, peanut,
pine, mug, jar, bottle, lighthouse, crate, waves, mitten).

## 2. What the theme does, and why (research → feature)

| # | Tactic seen on top performers | Where it lives in the theme |
|---|---|---|
| 1 | Free shipping said *on the product card* (Cherry Republic, Michigan Awesome) | `ships-free` tag → green "Ships free" badge on cards and PDP; box tiers say "· ships free" |
| 2 | Announcement bar: threshold + holiday deadline (Zingerman's, DGS) | `announcement-bar`: live countdown to the date in Theme settings, then rotating messages |
| 3 | Shop by price (Harry & David, Zingerman's, Spoon, Texas Gift Co.) | Homepage "Shop by price (or by place)" tiles; collection quick-link chips menu |
| 4 | Specific, no-hassle guarantee (Zingerman's, Cherry Republic) | Hero bullets, PDP perks, cart summary, value props, FAQ |
| 5 | "What's inside" lists with brand, size and origin (Cherry Republic, Zingerman's, DGS) | `custom.contents` metafield → PDP list as "item, size \| Place · since year" |
| 6 | Heritage dates as trust ("since 1887") | Heritage marquee (Vernors 1866 → Kar's 1933); "Since 19xx" stamp on every PDP |
| 7 | Reviews and press near the top (Homesick, Goldbelly) | Hero rating line and testimonials section, **switched off until you have real reviews** |
| 8 | Visible corporate path (nearly everyone) | Hero text link, nav item, split CTA, `page.corporate-gifts` quote form |
| 9 | Build-your-own beside ready-to-send (Texas Gift Co., Spoon, Michigan Awesome) | `build-a-box` section: no app, 4/6/10 slots, live total, gift note, box ID on each line |
| 10 | Ship-date choice (Zingerman's, Here Here) | "Choose a ship date" cart attribute + "ships today if ordered in Xh Ym" on the PDP (real 1 p.m. ET cutoff) |
| 11 | Free gift message said up front (Texas Gift Co., Michigan Pantry) | Hero bullet, cart gift note, "leave prices out" checkbox |
| 12 | Gift finder by persona or craving (Harry & David, Texas Gift Co.) | `miss-quiz`: "What do they miss most?" pick up to 3 |
| 13 | Add-on upsell (Harry & David "Add something extra") | PDP complementary products block; cart drawer "Toss one more in the box" |
| 14 | Holiday deadlines table (Goldbelly, Wisconsin Cheeseman) | `shipping-deadlines`: rows strike through automatically once their date passes |
| 15 | Emotional "home" story (Homesick, Michigan Awesome) | Hero copy, "Why they miss it" quote block on every product, story section |
| 16 | Shop by region (Goldbelly) | Interactive Michigan map with pins for Metro Detroit, West MI, Up North, U.P. and the Thumb |

Things the research flagged as hurting local competitors, and how we avoid each:
- **Sold-out items featured on the homepage.** Badges handle stock state, and quick-add is hidden when an item is unavailable.
- **"Read more" buttons instead of add to cart.** Every card has a one-tap add, and box tiers have a full add-to-cart button.
- **No prices on the homepage.** Every card and tier shows its price.
- **No holiday cutoffs.** We show cutoffs in three places: the announcement bar, the deadlines table and the FAQ.

## 3. Price architecture

Based on observed competitor price clusters: entry $35–50, core $65–85, premium $95–135, flagship $165–190.

| Tier | Price | Product |
|---|---|---|
| Add-ons | $5–$16 | Single chips, pop 4-packs, fudge slice, jams |
| Entry box | **$45** | The Day Tripper: 5 classics, ships free |
| Core (hero SKU) | **$79** | The Up North: 9 classics, ships free, "Most gifted" |
| Premium | **$119** | The Full Mitten: 14 classics, keepsake crate |
| Flagship / corporate | **$179** | The Great Lakes Executive Crate |
| Build your own | items + $6/$8/$12 box fee | Free shipping at $75 |

**Shipping:**
- Every curated box ships free. Build that cost into the box price.
- Everything else ships free at **$75**, which matches DGS and Michigan Awesome and is the median of observed thresholds.
- Pop is heavy, so cap it at 4 cans per box SKU and sell multi-packs à la carte.

## 4. Launch checklist (Shopify admin)

1. **Theme:** `shopify theme push --path theme --unpublished`. Preview it, then publish. Or zip the `theme` folder and upload it.
2. **Metafield definitions** (Settings → Custom data → Products), namespace `custom`:
   - `region`, `origin_city`, `founded_year`: single line text
   - `why_miss`, `contents`, `shipping_note`: multi-line text
   - `ingredients`: rich text

   Collections, also namespace `custom`:
   - `kicker`: single line
   - `seo_copy`: rich text
3. **Import products:** Products → Import `data/products.csv`. All rows import as **draft**. Add photos and confirm costs before publishing.
4. **Collections** (automated, by tag):
   - Gift Boxes (`gift-box`)
   - Chips & Snacks, Michigan Pop, Fudge & Sweets, Up North Cherries, Pantry & Sauces, Coffee & Breakfast (by product type)
   - Regions: `region:Metro Detroit`, `region:Up North`, etc.
   - Under $25 (`under-25`), Under $50 and $50–$100 (price conditions)
   - Bestsellers (`bestseller`)
   - Box items (`box-eligible`)
5. **Menus:**
   - `main-menu`: Gift boxes ▾ / Shop the Mitten ▾ / By region ▾ / **Build a Box** / Corporate
   - `footer-shop`, `footer-help`, `footer`
   - `collection-chips`: Under $25 / Under $50 / Metro Detroit / Up North / The U.P. / Pop / Ships free
6. **Pages:**
   - `build-a-box` (template `page.build-a-box`). In the editor, pick the **Build Your Own Michigan Box** product and the Box items collection.
   - `corporate-gifts` (template `page.corporate-gifts`)
   - `faq` (template `page.faq`)
   - `about`
7. **Theme editor wiring:**
   - Point each box tier at its product.
   - Featured collection → Bestsellers.
   - Region pins → region collections.
   - Quiz options → collections.
   - Cart drawer upsell → Box items.
8. **Shipping profiles:**
   - Give gift boxes a $0 rate (a separate shipping profile).
   - Give everything else free shipping over $75.
   - Offer Priority and Express rates.
9. **Apps** (the theme already has hooks for each):
   - Reviews (Judge.me or Okendo) writes the `reviews.rating` metafields that cards and PDPs already read. The PDP accepts app blocks.
   - Klaviyo for the 10%-off welcome flow, plus abandoned-cart and holiday-deadline emails.
   - Shopify Search & Discovery for complementary products (the PDP add-on block) and filters.
   - Optional: a multi-address or "send to many" gifting app for corporate orders.
10. **Turn on proof only when it's real:**
    - Fill in the hero rating line, and switch the Testimonials section back on, only once you have genuine reviews. The FTC's 2024 rule bans fake reviews.

## 5. SEO plan

Use collections as landing pages: write 150–300 words of copy into the `custom.seo_copy` metafield, which renders below the product grid.

- `/collections/michigan-gift-boxes` (shared target with DGS, decide which site owns it), `/michigan-care-package`, `/taste-of-michigan-gift-box`, `/michigan-gifts-under-50`
- Brand intent: "Faygo gift box / buy Faygo online", "Vernors shipped", "Better Made chips gift", "Sanders gift box", "Mackinac Island fudge shipped". Research found these "where to buy X outside Michigan" queries are served mostly by thin pages.
- Destination pages: "Michigan gifts shipped to Florida / Arizona / Texas / Chicago" (snowbird and transplant hubs)
- Blog (the article template ends with a shop CTA): "Foods you can only get in Michigan", "Where to buy Vernors outside Michigan", "Michigan holiday shipping deadlines 2026", "What is Rock & Rye?"
- Built in: Organization, WebSite and SearchAction, Product, BreadcrumbList, FAQPage and Article JSON-LD. "What's inside" lists are real text, not images.

## 6. Photography brief (what makes it look custom)

The theme ships with illustrated fallbacks so it never looks broken. Real photos are what will convert. Shoot:
- **Box hero shots:** overhead, on cream linen or birch, with a handwritten postcard visible.
- **Product cutouts:** on transparent or cream backgrounds, used in the collection tiles.
- **A real packing-table photo** for the story section. Authentic beats stock.
- **One lake, dune or lighthouse photo** for the postcard hero (optional; the illustration works).

## 7. Legal and practical notes (not legal advice)

- **Brand names:** describing genuine resold products by name ("contains Better Made chips") is generally fine. Don't use brand logos as our branding or imply endorsement. The footer says "Not affiliated with the brands we carry."
- **"Pure Michigan"** is a state-owned trademark. The theme avoids it.
- **Licensing:** ask MDARD about a food establishment licence. If you repack anything (splitting Costco caramels, cutting fudge), you take on labelling and allergen duties.
- **Sourcing:** retail-sourced stock (Meijer, Costco) is fine for testing. For scale, open wholesale accounts so you get lot traceability for recalls.
- **Restricted items:**
  - Jiffy (contains lard) and coney sauce (contains meat) are tagged `us-only`. Exclude them from Canada shipping zones.
  - Chocolate items are tagged `heat-sensitive`. The PDP shows the cold-pack notice automatically.
- **Michigan bottle deposit:** the 10¢ deposit on pop isn't redeemable out of state. Price it in.
