# Michigan Gift Store: Brand Audit and Michigan-Only Product Catalog

*Research date: October 23, 2026. Prices come from web listings and change often. Every price says where it came from. Anything I could not confirm is marked **(unverified)**.*

---

## JOB 1: Brand audit of detroitgiftstore.com

The site was reachable and returned HTTP 200. I downloaded the raw HTML and CSS for these pages: the home page, `/collections/michigan-gift-boxes`, `/products/the-michigan-box`, the shipping, refund and contact policies, `/products.json`, and one blog post. **There is no About page:** `/pages/about` and `/pages/about-us` both return 404.

### Identity and ownership
- **Legal entity:** Detroit Gift Store LLC, 2200 Hunt St, Detroit, MI 48207. Email is hello@detroitgiftstore.com.
- **Link to michigangiftstore.com:** none on the site. No sister brand, parent company or owner name appears anywhere I checked.
- **Store name:** "Detroit Gift Store". It is used the same way in the `<title>`, `og:site_name` and the © line.
- **Logo:** text only, no image. It is set in two parts: **"Detroit"** in a blackletter font and **"Gift Store"** in a script font, tilted (rotate −6deg) and tucked under it. The CSS gives "Detroit" navy ink with a white outline and a mustard drop shadow, like a sticker. "Gift Store" is brick colour (#C9683F).
- **Badges and icons:** inline SVGs styled as road signs. There is an M-1 diamond (Woodward), an Interstate 75 shield, a "313" sticker and a "NORTH ↑ / Woodward Ave" sign.

### Shopify theme
`Shopify.theme = {"name":"Detroit Gift Store V1","id":196132012164,"schema_name":"Detroit Gift Store","schema_version":"1.0.0","theme_store_id":null,"role":"main"}`

This is a **custom theme**, not one from the Theme Store (`theme_store_id: null`). All styling is in one stylesheet, `assets/dgs.css`, about 42 KB.

### Colour palette (CSS custom properties in dgs.css)
| Token | Hex | Role |
|---|---|---|
| `--ink` / `--i-ink` | **#1F2D5C** | Primary navy for text, logo and outlines. Also the `<meta theme-color>` |
| `--ink-2` | #2B3B70 | Secondary navy |
| `--ink-soft` | #4C5778 | Muted text |
| `--paper` | **#F3EEE2** | Page background (warm cream) |
| `--paper-2` / `--i-cream` | #FBF8F1 | Lighter cream |
| `--red` | **#B8352B** | Accent red (the I-75 shield band) |
| `--i-red` | #C9473A | Illustration red |
| `--brick` | **#C9683F** | "Gift Store" script |
| `--mustard` / `--i-gold` | **#E9C450** | Shadow and highlight |
| `--sign` | #1D6A47 | Highway-sign green |
| `--good` | #2E7D5B | Success green |
| `--teal` | #3E9C8E | |
| `--sky` | #A8CEDD | |
| `--i-blue` | #5E9CC0 | |
| `--rose` / `--i-rose` | #E7B9A3 / #E9B9A7 | |
| `--tan` | #E8D9AA | |
| `--i-brown` | #A06C3F | |
| `--i-green` | #6E9A4A | |
| `--i-steel` | #C9CCCB | |
| Inline SVG only | #1F4E9C, #DDE2EE, #C8CEE0, #56628F | Interstate blue and greys |

`--rule` is rgba(31,45,92,.22).

### Fonts (one Google Fonts call)
`Archivo (wdth 62–125, wght 400–900)`, `Overpass (400/600/800/900)`, `Grenze Gotisch (700/900)`, `Yellowtail`, `Patrick Hand SC`

| CSS var | Font | Use |
|---|---|---|
| `--f-sign` | **Overpass** | Body text at 17px / 1.55. Overpass is modelled on Highway Gothic road-sign lettering |
| `--f-slab` | **Archivo** (variable width) | Headings and prices (29 uses) |
| `--f-hand` | **Patrick Hand SC** | Handwritten labels and kickers (29 uses) |
| `--f-black` | **Grenze Gotisch** | "Detroit" wordmark. A blackletter, in the spirit of the Olde English "D" |
| `--f-script` | **Yellowtail** | "Gift Store" and script accents |

### Tone of voice and taglines
The voice is warm, dry and plainspoken, like a local who knows the place. It names exact makers, streets and founding years. Section headers start in a lowercase handwritten line and end on one big word.

Taglines and copy taken from the site:
- "Detroit gifts and gift boxes, packed by hand in the 313"
- "Send them a little Detroit"
- "For anyone who grew up using their hand as a map." (The Michigan Box)
- "Every item has a Detroit address"
- "Gift like a Detroiter" (corporate)
- "Canada too: it's just across the bridge."
- "Questions? … a real person in Detroit answers within one business day"
- "Packed by hand in Detroit"
- "Are prices inside the box? Never. Your card goes on top, written by hand in Detroit."
- Handwritten-style headers: "so, who's it For?", "so, where's it Headed?", "Questions before you Send it", "or just Pack it yourself"
- Newsletter: "letters from The D"
- Announcement bar: "Order by Dec 11 for Christmas · Free US shipping over $75 · Ships to Canada"

Every product line follows one pattern: *item, size. Place, since year.* For example, "Better Made Original Chips, 3 oz bag. Gratiot Ave, since 1930."

### Navigation
- **Main nav:** Gift boxes, Build a box, Gift finder, Shipping (all anchors on the home page), and Corporate gifting (`/pages/corporate-gifts`). Plus Cart.
- **Footer, Shop:** Detroit gift boxes, Detroit food gifts, Michigan gift boxes, Detroit care packages, Christmas gift boxes, Build a box.
- **Footer, Gifting:** Corporate gifts, Realtor closing gifts, Shipping + deadlines.
- **Footer, Help:** Detroit food stories (blog), Questions, Search, and the policy pages.

### What they sell (from /products.json, 9 products)
| Product | Price | Contents (abridged) |
|---|---|---|
| The 313 Box | $79 | Better Made, Faygo Rock & Rye, Vernors, Sanders Hot Fudge, Germack Cherry & Praline Nuts, skyline magnet, card |
| The Michigan Box | $79 | Germack dried MI cherries, Mackinac Island fudge, Koeze Cream-Nut, Germack in-shell peanuts, Pop Daddy Dill Pickle Pretzels, Kar's Sweet 'N Salty, Faygo Rock & Rye, card |
| The Game Day Box | $75 | Honolulu-blue mug, licensed Detroit football playing cards, ornament, plus snacks |
| The Care Package | $59 | Coney sauce kit, Jiffy, Sanders Hot Fudge, Vernors, Faygo, Better Made |
| The Woodward (executive box) | $189 | Leather journal, Detroit-roasted coffee, Germack pistachios and nuts, Sanders, Hell Fire Detroit hot sauce |
| Custom Half Box | $49 | Any 4 items |
| Custom Full Box | $89 | Any 8 items |
| Box Upgrade (add-on) | $10 (Detroit Rose candle) / $8 (Coney kit) | |
| Custom Photo Card (add-on) | $10 | |

Prices run **$49–$189**, and most boxes sit at **$75–$79**.

There are about 20 SEO blog posts, including "Michigan-made food gifts", "Famous Detroit foods", "How to make a Boston Cooler" and "Gifts for someone who moved away from Detroit".

### Shipping and policies
- Packed in Detroit and shipped Monday to Friday, usually the next business day. Ships to all 50 states, PO boxes, APO and Canada.
- **Free US ground over $75.** Priority and Express are offered at checkout.
- Ground takes 1–6 business days. AK, HI and PR take 5–8. Canada takes 4–7.
- 2026 holiday order-by dates: Ground Dec 11, Priority Dec 15, Express Dec 17, Canada Dec 9. There is a "Hold for the holidays" option that ships Dec 8–11.
- **Canada:** the Care Package, the coney kit and Jiffy are US-only, because Canada does not allow mailed meat or lard.
- **Hot weather:** from May through September, chocolate gets a cold pack or is swapped for a heat-safe item.
- **Refunds:** no returns on food. If an item arrives damaged, melted or spoiled, a photo within 7 days gets a replacement or refund, with no need to send it back. Non-food keepsakes can be returned within 30 days.
- **Other features:**
  - "Text or email them" address collection, where the recipient never sees the price.
  - Free local pickup at 2200 Hunt St by appointment.
  - Corporate orders: 5-box minimum, 15% off orders of $5,000+, free logo card, one spreadsheet for all addresses.

### Things to know before positioning the sister brand
1. **They overlap.** DGS already has a "Michigan Gift Boxes" collection and a $79 Michigan Box built around cherries, fudge and Koeze. That collection page says most Michigan boxes "stop at cherries and fudge". Michigangiftstore.com needs a clear split, for example statewide and regional range versus DGS's Detroit focus, to avoid competing with itself in search.
2. **One fact on DGS is out of date.** Its blog says Koegel "does not sell its meat products online". Koegel's own site now says it sells online through a fulfilment partner, Lynch Shipping (see the catalog). Worth fixing on DGS.
3. **Small mismatch.** The Michigan Box collection copy says "Everything in it is shelf-stable … no ice packs", but the box includes fudge and the FAQ cold-packs chocolate from May to September.

---

## JOB 2: Michigan-only product catalog

**Key to the shipping column:**
- ✅ shelf-stable and ships normally
- 🌡️ heat-sensitive (needs a cold pack or a seasonal swap)
- 🫙 glass (breakage risk)
- 🥤 carbonated
- ❄️ frozen or refrigerated (needs a cold chain)
- 🍺 alcohol (excluded)

**Where sold:** "MI grocers" means common at Meijer, Kroger Michigan and similar in my judgement, but not confirmed against a specific listing **(unverified)**. Any listing I actually found is named.

### 1. Chips & Snacks
| # | Brand / Product | Origin (founded) | Where sold | Approx. price (source) | Ship | Why Michiganders miss it |
|---|---|---|---|---|---|---|
| 1 | **Better Made** Original and Rainbow chips | Detroit, Gratiot Ave (1930, as Cross & Peters; Better Made name 1934) | MI grocers, Kroger (listing found) | Not found | ✅ Fragile: pack in a void-filled box | The chip on every Detroit table since 1930. Rainbow chips are the darker "burnt" ones fans fight over |
| 2 | **Better Made Special BBQ** | Detroit | Costco (50 × 1 oz case) | $16.49 per 50-ct (Costco tracker) | ✅ | Its sweet BBQ is the Michigan chip people say they can't find anywhere else. *"Special Rip BBQ" as an exact product name is unverified. "Special BBQ" and "Red Hot BBQ" are confirmed* |
| 3 | **Better Made Red Hot BBQ** | Detroit | Costco (50-ct) | Not captured | ✅ | The spicy cousin of Special BBQ |
| 4 | **Uncle Ray's** potato chips | Detroit (Ray Jenkins began in 1965; chip brand launched 1995 or 1998, sources conflict). Owned by H.T. Hackney since 2006 | MI convenience stores, Walgreens, CVS. Meijer not confirmed | Not found | ✅ | Detroit-made gas-station chip with a founder story |
| 5 | **Great Lakes Potato Chip Co.** Cherry BBQ kettle chips | Traverse City (2009) | Costco (22 oz bag) | $5.79 for 22 oz (Costco tracker) | ✅ | Kettle chips from Michigan potatoes, flavoured with Traverse City cherry |
| 6 | **Kar's Sweet 'N Salty** trail mix | Madison Heights / Detroit (1933; Sue Kar sold nuts outside Navin Field). Same parent as Sanders, Second Nature Brands | National, but "Detroit Born" on the pack | Retail price not captured | ✅ (chocolate pieces 🌡️ mildly) | The ballpark-peanut origin story, and the snack in every Michigan lunchbox |
| 7 | **Germack** pistachios and roasted nuts | Detroit, Eastern Market (1924; family importing since 1912). Oldest pistachio roaster in the US | Eastern Market shop, supermarkets, QVC. Costco unverified | Not found | ✅ | Credited with dyeing pistachios red. An Eastern Market institution |
| 8 | **Germack** dried Michigan cherries and Cherry & Praline nuts | Detroit, Eastern Market | Germack shop (DGS stocks these) | Not found | ✅ | A Detroit source for Up North cherries |
| 9 | **Pop Daddy** Dill Pickle (and Garlic Parmesan) pretzels | Howell (2013; pretzels from 2018, per DGS's blog) | Costco (28 oz and a 24-ct variety pack), Kroger | $7.99 for 28 oz, $29.99 for the 24-pack (Tasting Table, undated) | ✅ | The cult Michigan pretzel. Dill pickle is the gateway flavour |
| 10 | **Detroit Popcorn Co.** | Detroit (1923, Samuel Carmas), now in Redford | Kroger Michigan (kiosk and expansion news) | Not found | ✅ | A century of Detroit popcorn. *A 1950 founding date was not supported. Sources say 1923* |
| 11 | **McClure's** potato chips (Garlic Dill, Spicy) | Detroit (2006, Bob & Joe McClure) | Specialty and national grocers | Not found | ✅ | Pickle-brine chips from Detroit's pickle brothers |

### 2. Pop (it's "pop" in Michigan, not "soda")
| # | Brand / Product | Origin | Where sold | Approx. price | Ship | Hook |
|---|---|---|---|---|---|---|
| 12 | **Faygo Rock & Rye** | Detroit (Feigenson Bros., Nov 1907; Gratiot Ave plant since 1935; flavour dates to the 1920s) | MI grocers, Walmart | 8-pack about $4.34; 12-pack $24 or more from third-party sellers (Walmart, undated) | 🥤 Cans: pack upright, wrap, avoid freezing and heat | Cream soda with a cherry note. *The* Michigan pop |
| 13 | **Faygo Redpop** (strawberry) | Detroit | MI grocers, Walmart | 12 × 12 oz about $24 (Walmart third party) | 🥤 | "Redpop" is a word only Michiganders use |
| 14 | **Faygo** Moon Mist / Cotton Candy / others | Detroit | MI grocers | Not found | 🥤 | Dozens of flavours, a nostalgia grab bag. *Exact current flavour list unverified* |
| 15 | **Vernors** ginger ale | Detroit (James Vernor, 1866; oldest surviving US ginger ale). Now Keurig Dr Pepper; Michigan plant in Holland | MI grocers (more widely spread now) | Not found | 🥤 | The Boston Cooler (Vernors and vanilla ice cream), and Vernors for an upset stomach |
| 16 | **Old Orchard** tart cherry and apple juice | Sparta (1985). Owned by Lassonde | National | 64 oz bottles (no price captured) | ✅ Heavy: poor value to ship | West Michigan orchard juice. *Marginal: widely sold outside MI* |

### 3. Sweets & Fudge
| # | Brand / Product | Origin | Where sold | Approx. price | Ship | Hook |
|---|---|---|---|---|---|---|
| 17 | **Sanders Milk Chocolate Hot Fudge** topping | Detroit (Fred Sanders, 1875). Made in Clinton Twp by Morley/Second Nature | MI grocers, Costco (16 oz) | 16 oz $4.97 (Costco tracker, out of stock). 10 oz retail not found | ✅ 🫙 Shelf-stable unopened | The hot fudge from the Sanders sundae counter |
| 18 | **Sanders Sea Salt Caramels** (milk or dark chocolate) | Detroit / Clinton Twp | Costco (36 oz tub) | $10.99–$13.99 per 36 oz (Costco reports) | 🌡️ Cold-pack May–Sept | The Costco tub every Michigan family brings to the holidays |
| 19 | **Sanders Bumpy Cake** | Detroit | MI grocers (refrigerated or bakery case) | — | ❄️ **Perishable: do not stock** (pickup only, or list as "sorry, doesn't ship") | Chocolate cake with buttercream "bumps" under fudge frosting. Birthday tradition |
| 20 | **Morley Candy Makers** (butter pecan clusters, peanut butter blocks) | Clinton Twp (1919). Owns Sanders | Morley stores (Clinton Twp, Rochester, Eastpointe) | Not found | 🌡️ | The candy company behind Sanders |
| 21 | **Murdick's Fudge** | Mackinac Island (1887; island's first fudge shop) | Island shops, online year-round | Customer-built 5-slice box $62.95 + shipping (one reviewer) | 🌡️ Fudge dries out. One review reported stale, hard slabs | The original island fudge. "Fudgies" is what locals call tourists |
| 22 | **JoAnn's Fudge** | Mackinac Island (1969, Joan & Frank Nephew); Mackinaw City shop added 1980 | Island and Mackinaw City shops, online | 3 slices about $20–25 (2017 and 2022 in-store) | 🌡️ | A Straits summer trip in a box |
| 23 | **Kilwins** fudge and chocolates | Petoskey (1947, Don & Katy Kilwin) | Franchise shops in about 25–30 states | Not found | 🌡️ | Northern Michigan born. *Weak "Michigan-only" story: stores are nationwide* |
| 24 | **Sayklly's Yooper Bar** (chocolate bar shaped like the U.P.) | Escanaba (1906, Joseph Sayklly) | Sayklly's shop, online | Not found | 🌡️ | A chocolate bar in the shape of the U.P. Instant Yooper pride |
| 25 | **Cherry Republic** chocolate-covered cherries | Glen Arbor (1989, Bob Sutherland) | Cherry Republic stores (Glen Arbor, Traverse City, Ann Arbor, etc.), online | $4.95 (milk) / $5.95 (dark), third-party, undated | 🌡️ | A Sleeping Bear Dunes day trip, edible |
| 26 | **Shatila** baklava | Dearborn | Shatila bakery; Goldbelly (US & Canada) | 72-piece tin $59.95 (Goldbelly) | ✅ Ships well for a short window. *Shelf life unverified* | Dearborn's famous Middle Eastern bakery. Founding year not verified |

### 4. Up North / Cherries
| # | Brand / Product | Origin | Where sold | Approx. price | Ship | Hook |
|---|---|---|---|---|---|---|
| 27 | **Cherry Republic** dried Montmorency cherries | Glen Arbor (1989) | CR stores, online, regional markets | $11.95 (third-party, undated) | ✅ | "Life, Liberty, Beaches & Pie": the Up North cherry brand |
| 28 | **Cherry Republic** cherry salsa | Glen Arbor | CR stores | 8 oz jar (price not found) | 🫙 | Cherry everything, the CR way |
| 29 | **Cherry Republic** Boom Chunka cookies | Glen Arbor | CR stores, online | Not found | Baked goods: *shelf life unverified* | Cottage-trip cookie |
| 30 | **American Spoon** Sour Cherry Preserves | Petoskey (1982; Rashid family) | American Spoon shops, spoon.com | $12.95 per 9.5 oz; 4-pack $50 (spoon.com, listed sold out) | 🫙 ✅ | Small-batch preserves from Petoskey, from Michigan Montmorency cherries |
| 31 | **Traverse Bay Fruit Co.** dried tart cherries | Traverse City (maker unclear: one listing names Cherry Central) | Walmart (12 × 3 oz). Costco **unverified** | Not captured | ✅ | Plain Montmorency dried cherries, good for multi-packs |
| 32 | **Cherry Bay Orchards** (Shoreline Fruit) dried cherries | Traverse City area (grower families since 1969; 6,000 acres) | Retail and specialty | Not found | ✅ | Grower-owned brand from the Grand Traverse region |
| 33 | **Traverse Bay Farms** cherry salsa | Bellaire | Walmart LocalFinds, online | 16 oz (price not captured) | 🫙 | "Award-winning" claims are line-wide, not specific to the cherry salsa. Don't repeat them unverified |
| 34 | **Traverse City Whiskey Co.** Premium Cocktail Cherries | Traverse City | Grocers, liquor stores | $17.99 per 16 oz (Lowes Foods) | 🫙 ✅ Hot-filled. ⚠️ Cooked in bourbon; label says alcohol cooks off, but **confirm the alcohol content** before listing | The Michigan Manhattan garnish |
| 35 | **Michigan maple syrup** (farm brands vary) | Statewide. Michigan ranked 5th in the US in 2024 (200,000 gal, USDA NASS) | Farm stands, MI grocers | Varies | ✅ Use plastic or tin, not glass | Up North sugarbush syrup. *No single dominant grocery brand was verified* |

### 5. Pantry & Sauces
| # | Brand / Product | Origin | Where sold | Approx. price | Ship | Hook |
|---|---|---|---|---|---|---|
| 36 | **Jiffy** Corn Muffin Mix | Chelsea (Chelsea Milling; mill 1901; first prepared baking mix sold to the public, 1930) | Everywhere, national | $0.69–$0.99 per 8.5 oz (Lowes Foods, Brookshire's) | ✅ ⚠️ Contains lard, so **no Canada** (as DGS found) | The little blue box made down the road in Chelsea. Cheap, so it works as a filler and story item |
| 37 | **Koeze Cream-Nut** peanut butter | Grand Rapids (produce business 1910; peanut butter since 1925) | Grocers (Meijer unverified), specialty | $7.39–$7.95 per 17 oz (ShopRite, Harney) | 🫙 ✅ Heavy | Dark-roasted Virginia peanuts on the same equipment used since 1925 (per Koeze) |
| 38 | **McClure's** pickles (Spicy, Garlic Dill) | Detroit (2006) | Grocers nationwide | 32 oz about $8.59 (H-E-B) | ❄️ **Sold refrigerated**: do not ship ambient (I believe they're unpasteurized; **check the label**). Use McClure's chips (#11) instead | Detroit's craft pickle |
| 39 | **Garden Fresh Gourmet** salsa | Ferndale (Jack & Annette Aronson; 1997 or 2005, sources conflict). Sold to Campbell 2015, then to Fontaine Santé | Grocers | — | ❄️ **Refrigerated: do not ship** | The salsa that started in a Ferndale BBQ joint |
| 40 | **Clancy's Fancy** hot sauce | Ann Arbor (first made in the 1970s) | Zingerman's, local markets | Not found | 🫙 ✅ | Thick, garlicky Ann Arbor hot sauce. *Current production status unverified* |
| 41 | **Hell Fire Detroit** hot sauce | Metro Detroit, now Warren (around 2015; origin stories conflict) | Online, local; DGS stocks it | Not found | 🫙 ✅ | Featured on *Hot Ones* |
| 42 | **National Coney Island** chili (coney) sauce | Metro Detroit | Walmart nationwide; NCI restaurants; online. Meijer and Kroger **unverified** | 4 × 7.5 oz pack (price not captured) | ✅ Canned. ⚠️ Contains meat, so **no Canada** | Make a Detroit coney at home |
| 43 | **Zehnder's of Frankenmuth** egg noodles and seasonings | Frankenmuth | Zehnder's Marketplace, online. Grocery availability **unverified** | Not found | ✅ | The noodles from the Frankenmuth chicken dinner |
| 44 | **Pioneer Sugar / Big Chief** (Michigan Sugar Co.) | Bay City (1906); factories in Caro, Croswell, Sebewaing; owned by about 1,000 growers, mostly in the Thumb | MI grocers (unverified at specific stores) | Not found | ✅ Heavy, low value | Thumb sugar beets. A good item for a "Thumb" story box |
| 45 | **Michigan navy beans** | Huron County / the Thumb (top US dry-bean county; MI is #2 in navy beans) | Varies | Not found | ✅ | Michigan beans go into the US Senate bean soup (*recipe claim not verified here*). **No specific brand verified** |
| 46 | **Pinconning cheese** (aged Colby-style) | Pinconning, Bay County (Dan Horn, about 1915; Wilson's Cheese Shoppe since 1939) | Wilson's Cheese Shoppe, regional grocers | Not found | ❄️ Semi-perishable: cold pack recommended, especially in warm months | The "Cheese Capital of Michigan" on old US-23 |
| 47 | **Jampot** wild thimbleberry jam | Keweenaw Peninsula, near Eagle Harbor (run by monks; which order is unclear) | Jampot shop (seasonal), online; other U.P. retailers | 9 oz about $24–$30 at another retailer | 🫙 ✅ | Thimbleberries grow almost only in the U.P.'s north woods. Premium, rare |

### 6. Coffee & Breakfast
| # | Brand / Product | Origin | Where sold | Approx. price | Ship | Hook |
|---|---|---|---|---|---|---|
| 48 | **Trenary Toast** | Trenary, U.P. (1928, Finnish immigrant founder) | Bakery, U.P. stores, online | 16-slice bag $4.75 (Atlas Obscura, dated) | ✅ About 1-year shelf life | Cinnamon-sugar Finnish rusk for dunking in coffee. Pure Yooper |
| 49 | **Great Lakes Coffee Roasting Co.** | Detroit, Midtown (1994) | Cafés, DTW airport, online | Not found | ✅ | Detroit-roasted beans |
| 50 | **Zingerman's** coffee, coffee cake, bread | Ann Arbor (deli 1982; Mail Order 1992) | Zingerman's, online | Not found | Coffee ✅; bread and cake ship fast | Ann Arbor's food landmark. ⚠️ **Also a direct competitor in Michigan gift boxes** |
| 51 | **Germack coffee** | Detroit, Eastern Market | Germack shop | Not found | ✅ | Germack roasts coffee as well as nuts |
| 52 | **Kellogg's cereals** (WK Kellogg Co) | Battle Creek. Ferrero bought WK Kellogg on Sept 26, 2025; Battle Creek stays the North American cereal HQ | Everywhere | National pricing | ✅ | "Cereal City" story only. ⚠️ **Not Michigan-only; low value as a product.** Use it in "Battle Creek" storytelling, not as a hero SKU |

### 7. Frozen / perishable / alcohol: list as "Michigan classics we can't ship" or ship only with a cold chain
| # | Product | Origin | Notes |
|---|---|---|---|
| 53 | **Koegel Viennas** | Flint (1916) | ❄️ Koegel now sells online through Lynch Shipping (all 50 states). Point customers there rather than stocking it |
| 54 | **Buddy's** frozen Detroit-style pizza | Detroit (1946, by common account; no source found in this search) | ❄️ In grocery freezers (30 oz cheese at Giant; $13.49 at a SE Michigan Kroger, one Reddit report). Ships nationally through Goldbelly |
| 55 | **Achatz** pies | Armada (1993) | ❄️ Goldbelly ships them frozen. Meijer stocking **unverified** |
| 56 | **Hudsonville Ice Cream** | Hudsonville / Holland (ice cream since 1926; creamery roots 1895) | ❄️ Do not ship |
| 57 | **Stroh's Ice Cream** / **Superman** ice cream | Detroit brand / Michigan regional flavour | ❄️ Superman's origin is disputed: Michigan Public calls the Stroh's origin claim "dubious". Hudsonville sells "Super Scoop"; Meijer sells "Scooperman". Good for **merchandise and content only** |
| 58 | **Detroit Style Pizza Co.** | Metro Detroit | ❄️ **Grocery availability unverified.** Buscemi's has also moved into grocery freezers |
| 59 | **Bell's, Founders, Detroit City Distillery, etc.** | Various | 🍺 **Excluded.** Shipping alcohol needs licences |
| — | **"Mackinaw Peanut Butter Co."** | — | **Not found. Possibly doesn't exist.** Use Koeze Cream-Nut (#37) |

### By region
| Region | Products (#) |
|---|---|
| **Detroit / Metro** (including Ann Arbor, Chelsea, Howell) | Better Made (1–3), Uncle Ray's (4), Kar's (6), Germack (7, 8, 51), Pop Daddy (9), Detroit Popcorn (10), McClure's (11, 38), Faygo (12–14), Vernors (15), Sanders (17–19), Morley (20), Shatila (26), Jiffy (36), Garden Fresh (39), Clancy's Fancy (40), Hell Fire (41), National Coney (42), Great Lakes Coffee (49), Zingerman's (50), Buddy's (54), Achatz (55), Stroh's (57), Detroit Style Pizza (58) |
| **West Michigan** (including Battle Creek) | Koeze (37), Old Orchard (16), Hudsonville (56), Kellogg's (52). Vernors is now bottled in Holland |
| **Up North** (northern Lower Peninsula and the Straits) | Great Lakes Chips (5), Cherry Republic (25, 27–29), American Spoon (30), Kilwins (23), Traverse Bay Fruit (31), Cherry Bay Orchards (32), Traverse Bay Farms (33), TC Whiskey cherries (34), maple syrup (35), Murdick's (21), JoAnn's (22). Mackinac Island is technically in a U.P. county but is culturally "Up North" |
| **U.P.** | Trenary Toast (48), Sayklly's Yooper Bar (24), Jampot thimbleberry jam (47) |
| **Thumb / Great Lakes Bay** (including Frankenmuth and Flint) | Michigan Sugar Pioneer and Big Chief (44), Huron County navy beans (45), Pinconning cheese (46), Zehnder's noodles (43), Koegel (53, Flint) |

**The U.P. and Thumb ranges are thin.** More research is needed before running regional boxes for them. Pasties and other U.P. items are mostly perishable.

**Strongest shelf-stable hero products for launch:**
- Better Made BBQ
- Great Lakes Cherry BBQ chips
- Faygo Rock & Rye and Redpop
- Vernors
- Sanders hot fudge and caramels (caramels seasonal)
- Germack
- Kar's
- Pop Daddy
- Koeze
- Jiffy
- Cherry Republic and American Spoon cherries
- Trenary Toast
- Yooper Bar (seasonal)
- Mackinac fudge (seasonal)
- Jampot jam

---

## Legal and practical notes (brief; **not legal advice**, so check with a Michigan business attorney and MDARD)

- **Trademarks:**
  - Brand names may be used to describe genuine products you resell ("contains Better Made chips"). This is nominative fair use.
  - Do not use brand logos as your own branding, imply endorsement or partnership, or put brand names in your store name or ads in a way that suggests affiliation without permission.
  - **"Pure Michigan"** is a registered trademark of the state's economic development agency (MEDC). Don't use it without a licence.
  - Team names and colours ("Detroit football", Lions marks) need licensing. DGS sells officially licensed cards for this reason.
- **Cottage food law doesn't apply.** These are commercially made, sealed products.
  - If you **repack** anything, you take on packer obligations: FDA labelling, allergen statements and traceability. Examples: splitting a 36 oz Costco caramel tub, or cutting fudge slabs.
  - Ask **MDARD** whether your operation needs a Michigan food establishment licence. Many food sellers, including some online and mail-order sellers, do. Whether you qualify for an exemption depends on what you do.
- **Where to buy stock:** buying at retail (Costco, Meijer) works for testing, but you get no invoices for lot recalls, retailers may limit quantities, and margins are thin. For scale, ask brands or distributors for wholesale accounts. Costco's membership terms on resale are **unverified**.
- **Michigan bottle deposit:** Michigan charges a 10¢ deposit on pop cans, which customers out of state can't redeem. Include it in your pricing. Don't redeem out-of-state containers in Michigan; that is illegal.
- **Carbonated drinks:**
  - Cans can burst or leak when frozen, overheated, or dropped on the seam.
  - Pack them upright in individual wraps or dividers, and consider pausing in deep winter or summer heat.
  - Glass-bottle pop is high risk.
  - Pop is heavy, which drives up shipping cost (DGS uses single 12 oz cans).
- **Heat-sensitive chocolate and fudge:** follow DGS's May–September practice of a cold pack or a swap. Consider not shipping chocolate over weekends.
- **Perishable, frozen and alcohol items:** need insulated packaging, dry ice or gel packs, and expedited shipping, or partners such as Goldbelly. Dry ice has carrier hazmat rules. Shipping alcohol needs state licences, so exclude it.
- **Canada:** mailed meat products (coney sauce, lard in Jiffy) are restricted, per DGS's own policy. Duties and GST/HST may apply.
- **Sales tax:** Michigan exempts most groceries but taxes candy and soft drinks. Mixed gift boxes need a tax decision. Other states can require you to collect their sales tax once your sales there pass a threshold ("economic nexus").

---

## Main sources
- detroitgiftstore.com: the home page, /collections/michigan-gift-boxes, /products/the-michigan-box, /policies/shipping-policy, /policies/refund-policy, /policies/contact-information, /products.json, /blogs/news/michigan-made-food-gifts, and assets/dgs.css. Fetched raw on Oct 23, 2026.
- [Better Made on Wikipedia](https://en.wikipedia.org/wiki/Better_Made_Potato_Chips), [Detroit Historical Society: Better Made](https://detroithistorical.org/learn/encyclopedia-of-detroit/better-made-snack-food-company), [Costco tracker: Better Made Special BBQ 50-ct](https://app.warehouserunner.com/costco/1856147-better-made-bbq-potato-chip-50-1-oz)
- [Faygo on Wikipedia](https://en.wikipedia.org/wiki/Faygo), [Tasting Table: Rock & Rye](https://www.tastingtable.com/1357083/ingrediens-rock-and-rye-flavor-faygo), [Vernors on Wikipedia](https://en.wikipedia.org/wiki/Vernors)
- [Costco Sanders caramels (eatthis)](https://www.eatthis.com/sams-club-vs-costco-sea-salt-caramels), [Costco tracker: Sanders hot fudge](https://app.warehouserunner.com/costco/1371789-sanders-milk-chocolate-fudge-16-ounces), [Morley Candy on Wikipedia](https://en.wikipedia.org/wiki/Morley_Candy_Company)
- [Tulane: Germack](https://news.tulane.edu/news/alumnus-shares-nuts-and-bolts-family-business), [Kar's/Sanders merger](https://www.foodmanufacturing.com/home/news/13247100/beloved-detroit-snacking-brands-kars-nuts-and-sanders-merge), [Uncle Ray's on Wikipedia](https://en.wikipedia.org/wiki/Uncle_Ray%27s)
- [Costco tracker: Great Lakes Cherry BBQ](https://app.warehouserunner.com/costco/1195190-great-lakes-michigan-cherry-bbq-22-ounce-bag), [Tasting Table: Pop Daddy at Costco](https://www.tastingtable.com/2247951/costco-best-items-buy-this-month-pop-daddy-pretzels-dollar-tree-snacks/), [DBusiness: Detroit Popcorn in Kroger](https://www.dbusiness.com/daily-news/detroit-popcorn-co-plans-expansion-in-krogers-michigan-locations/)
- [Metro Parent: Garden Fresh](https://metroparent.com/things-to-do/at-home/michigan-made-garden-fresh-gourmet/), [H-E-B: McClure's](https://www.heb.com/product-detail/mcclure-s-spicy-pickle-spears-32-oz/1449395)
- [American Spoon](https://spoon.com/products/sour-cherry-preserves), [Cherry Republic products (third-party)](https://coveyouscenicfarm.com/grocery/dried-fruit-mushrooms-mixed-nuts/dried-fruit), [Shoreline Fruit](https://farmcredit.com/stories/shoreline-fruit/), [Traverse Bay Farms](https://pr.washingtoncitypaper.com/article/38-Awards-in-25-Years-Traverse-Bay-Farms-Has-Earned-Recognition-Across-Its-Entire-Product-Line/6a955bf3f388f60002ab755e), [TC Whiskey cherries (Lowes Foods)](https://shop.lowesfoods.com/products/traverse-city-whiskey-co.-premium-cocktail-cherries-16-oz/3102623)
- [Murdick's](https://www.originalmurdicksfudge.com/about-us/), [Mackinac Island: shipping fudge](https://mackinacisland.org/?p=48587), [JoAnn's review](https://swmichigandining.com/2022/06/05/joanns-fudge-mackinaw-city/), [Kilwins on Wikipedia](https://en.wikipedia.org/wiki/Kilwins), [Sayklly's (Visit Escanaba)](https://visitescanaba.com/blog/saykllys-candies)
- [Tasting Table: Jiffy](https://www.tastingtable.com/1702868/store-bought-baking-mix-michigan), [Lowes Foods: Jiffy](https://shop.lowesfoods.com/products/jiffy-corn-muffin-mix-8.5-oz/19867), [Koeze (Northern Express)](https://www.northernexpress.com/amp/news/food/koeze-cream-nut-peanut-butter/), [ShopRite: Cream-Nut](https://www.shoprite.com/sm/pickup/rsid/140/product/creamnut-smooth-natural-peanut-butter-17-oz-id-00071157303412)
- [Ferrero completes WK Kellogg deal](https://newsroom.wkkellogg.com/2025-09-26-FERRERO-COMPLETES-ACQUISITION-OF-WK-KELLOGG-CO), [Trenary Toast (Atlas Obscura)](https://assets.atlasobscura.com/foods/trenary-toast-upper-peninsula), [Visit Escanaba: Trenary](https://visitescanaba.com/blog/bring-home-the-iconic-up-treat-trenary-toast), [Great Lakes Coffee (Metro Times)](https://www.metrotimes.com/?p=163356), [Zingerman's on Wikipedia](https://en.wikipedia.org/wiki/Zingerman%27s)
- [Pinconning cheese on Wikipedia](https://en.wikipedia.org/wiki/Pinconning_cheese), [Michigan Sugar on Wikipedia](https://en.wikipedia.org/wiki/Michigan_Sugar), [Michigan Bean Commission](https://michiganbeastg.wpengine.com/?p=6914), [USDA NASS 2024 Michigan maple](https://nass.usda.gov/Statistics_by_State/Michigan/Publications/Current_News_Release/2024/nr2432mi.pdf), [Jampot (Poorrock Abbey)](https://poorrockabbey.com/pages/our-story), [Zehnder's Marketplace](https://www.frankenmuth.org/directory/zehnders-marketplace-shopping/)
- [Koegel on Wikipedia](https://en.wikipedia.org/wiki/Koegel_Meat_Company), [Koegel About](https://koegelmeats.com/about), [DBusiness: Buddy's into grocery](https://www.dbusiness.com/daily-news/local-investors-buy-buddys-pizza-plan-to-put-iconic-brand-in-grocery-stores/), [Achatz on Goldbelly](https://www.goldbelly.com/restaurants/achatz-handmade-pie-co/best-seller-pies-2-pack), [Hudsonville (Dairy Processing)](https://www.dairyprocessing.com/articles/1932-on-the-record-hudsonville-ice-cream), [Michigan Public: Superman ice cream](https://www.michiganpublic.org/podcast/on-hand/2026-08-24/is-superman-ice-cream-from-michigan), [Shatila on Goldbelly](https://www.goldbelly.com/shatila-bakery), [FOX 2: National Coney chili](https://fox2detroit.com/news/national-coney-island-now-selling-its-detroit-coney-chili-sauce-store-online), [Hell Fire Detroit (Metro Times)](https://www.metrotimes.com/food-drink/why-hell-fire-detroits-hot-ones-famous-sauce-is-on-fire-and-more-dining-scene-views-32734012/), [Clancy's Fancy (AnnArbor.com)](https://www.annarbor.com/business-review/clancys-fancy-hot-sauce-all-fired-up-to-expand-with-new-marketing-drive), [Old Orchard on Wikipedia](https://en.wikipedia.org/wiki/Old_Orchard_Brands)
