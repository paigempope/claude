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

## 3. Product model and prices (Detroit Gift Store model)

Shopify sells **boxes only**, like detroitgiftstore.com. The 30 Michigan items are content: name, size, hometown, why
people miss them, and drawn package art. They live in `data/catalog.py`, which generates `theme/snippets/mgs-data.liquid`.

**Curated boxes (all ship free):**

| Box | Price | For |
|---|---|---|
| The Homesick Box | $59 | the ones who moved away |
| The Yooper | $69 | anyone from above the Bridge |
| The Up North | $79 | the cottage crowd |
| The Full Mitten | $99 | family all over the state |
| The Great Lakes | $189 | clients, closings and new hires |

**Build your own (flat price, whatever you pick):**
- Half box, $49: 4 picks, one per shelf.
- Full box, $89: 8 picks, at least one from every shelf, at most two per shelf.

**Add-ons:**
- Photo postcard, +$10
- Thimbleberry jam builder upgrade, +$12

Detroit's own "Michigan Box" overlaps The Up North. Keep this store regional and point Detroit's Michigan Box here,
or rename it toward Detroit.

## 4. Launch checklist (Shopify admin)

1. **Theme:** `shopify theme push --path theme --unpublished`. Preview it, then publish.
2. **Metafield definitions** (Settings → Custom data → Products), namespace `custom`:
   - `box_key`: single line text. Required on every curated box. It links the product to its contents in `mgs-data`.
   - `contents`, `shipping_note`, `why_miss`: multi-line text
   - `region`, `origin_city`, `founded_year`: single line text
3. **Import `data/products.csv`:** 5 boxes, 2 builder sizes and 2 add-ons, all as drafts. Keep these handles exactly, because the theme looks products up by handle:
   - Boxes: `the-homesick-box`, `the-yooper`, `the-up-north`, `the-full-mitten`, `the-great-lakes`
   - Builder sizes: `build-your-own-half-box`, `build-your-own-full-box`
   - Add-ons: `custom-photo-card`, `box-upgrade`
4. **Collection:** create `gift-boxes` (automated, tag = `gift-box`). The box shelf, corporate page and cart use it.
   **Main menu:** Gift boxes (`/#boxes`) / **Build a Box** / Gift finder (`/#finder`) / The map (`/#map`) / Shipping (`/pages/faq`) / Corporate.
5. **Pages:**
   - `build-a-box` (template `page.build-a-box`)
   - `corporate-gifts` (template `page.corporate-gifts`)
   - `faq` (template `page.faq`)
   - `about`
6. **Theme settings → Shipping & gifting:**
   - free-shipping threshold
   - holiday deadline
   - "Hold for the holidays" window (default Dec 8 to 11)
7. **Shipping profiles:** gift boxes $0. Builder boxes free over $75. Exclude `us-only` boxes (the Homesick Box contains Jiffy, which has lard) from Canada.
8. **Fulfilment:** gift details arrive as line-item properties on each order:
   - Recipient, From, Send to, Recipient contact, Ship, Postcard, Message, Picks
   - The cart also saves "Address for …" attributes for every extra recipient.
   - A photo-card line shares its box's hidden `_gid`.
   - For "Text or email them" orders, contact the recipient within 1 business day.
9. **Apps:**
   - Klaviyo for welcome, abandoned-cart and holiday-deadline flows
   - A reviews app once reviews are real. Turn the Testimonials section on only then.
10. **To edit items or boxes:** change `data/catalog.py` and run `python3 data/catalog.py`. Map pins are projected from real lat/lon; new towns need an x/y (see the comment in `PLACES`).

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
