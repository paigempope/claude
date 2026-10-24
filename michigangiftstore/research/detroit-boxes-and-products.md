# How Detroit Gift Store does boxes and products

Pulled from the live site on Oct 24, 2026:
- `/products.json`
- the home and product pages
- the theme script `assets/dgs.js`
- screenshots of the box panel and the builder

The theme script holds the item catalog, the shelves, the box definitions and the gift finder as data.

## 1. The big idea: sell boxes, not items

Shopify has only **9 products**, and **none of them has a product photo**. Nobody can buy a bag of chips by itself.

| Shopify product | Type | Price | What it is |
|---|---|---|---|
| The Care Package | Gift box | $59 | 6 items + card, US only (coney, lard) |
| The Game Day Box | Gift box | $75 | 7 items + card |
| The 313 Box | Gift box | $79 | 6 items + card (flagship) |
| The Michigan Box | Gift box | $79 | 7 items + card ("for the cottage crowd") |
| The Woodward | Gift box | $189 | 6 items + logo card (corporate) |
| Custom Half Box | Builder | $49 flat | any 4 picks |
| Custom Full Box | Builder | $89 flat | 8 picks |
| Box Upgrade | Add-on | $8 / $10 | Coney kit, Detroit Rose candle |
| Custom Photo Card | Add-on | $10 | your photo on the card |

Everything else (the 29 individual items) is **content, not inventory**. Each item is defined in the theme script with:
- name and size
- maker
- origin line ("Gratiot Ave, since 1930")
- a one-line reason people miss it
- a retail value
- a package shape and color
- a cutout photo

What this buys them:
- Shopify stays simple: no per-item stock in Shopify, and every order is a box.
- The average order is $49 at minimum.
- They can swap items without touching the catalog.

## 2. The item catalog (29 items, 5 shelves)

| Shelf | Note on the site | Items |
|---|---|---|
| Pop | "It's pop, not soda" | Faygo Rock & Rye, Root Beer, Redpop, Moon Mist, Cotton Candy; Vernors |
| Salty | "Chips and snack mix" | Better Made, Uncle Ray's, Kar's Sweet 'N Salty, Pop Daddy pretzels, Germack in-shell peanuts |
| Sweet | "Sanders and up north" | Sanders caramels, Sanders hot fudge, Mackinac Island fudge |
| Nuts + pantry | "Eastern Market and…" | Germack praline nuts, pistachios, dried cherries; Koeze; Jiffy; McClure's pickles; Coney kit (+$8, US only) |
| Keepsake | "Something that stays" | Honolulu Blue mug, skyline magnet, glitter ornament |

Box-only items that aren't on a shelf:
- leather journal
- Detroit-roasted coffee
- Hell Fire hot sauce
- licensed football playing cards
- the "Greetings from Detroit" card

**21 of the 29 items have a real cutout photo** in the theme assets. The rest (keepsakes, card) are drawn.

Every item line follows one format: **Name**, size. Place, since year. Examples:
- "**Better Made Original Chips**, 3 oz bag. Gratiot Ave, since 1930."
- "**Vernors Ginger Ale**, 12 oz can. Detroit, since 1866."

Each item also carries a "why" line, for example:
- "The bag on the table at every grad party in Metro Detroit."
- "Pour it over vanilla ice cream and you've got a Boston Cooler."

## 3. How a box is shown and sold

- **Box cards** have:
  - a colored panel with the box drawn as a tray, with the item cutouts poking out the top
  - a "7 things" sticker and a "for anyone who calls it home" handwritten line
  - the price and a short pitch
  - maker chips (Better Made · Faygo · Vernors · Sanders)
  - an **"Open it"** button
- **The open-box panel** (a modal, or the product page itself) works like this:
  - Left side: every item appears as a tilted polaroid card with its photo, size and origin line. Tap one to read why people miss it.
  - It shows "Worth $X on its own": the sum of the item retail values plus $6, compared with the box price.
  - Right side, step 1, **Pick the card**: Greetings from Detroit, Woodward sign, Your photo (+$10), or 313. Then a handwritten message, up to 300 characters.
  - Step 2, **Who's it going to?**:
    - Ship it to them.
    - **Text or email them**: we ask for their address within 1 business day, they never see the price, and if they haven't answered in 5 days we email you.
    - Ship it to me.
    - Then fields for their name and who it's from.
  - Step 3, **When should it ship?**: next business day, or "Hold for the holidays" with a "Don't open till Christmas" sticker (US only).
  - A sticky price and **Add to cart** at the bottom.
- **Everything is stored on the cart line** as properties: Recipient, From, Send to, Recipient contact, Ship, Ships to, Card, Message, Picks.
- **Multiple recipients:** checkout takes one address, so the cart asks for every *other* box's address before checkout.

## 4. The builder

There are four steps: **Size → Fill it → Card + send → Review**.

- **Half box, $49:** 4 picks, at most one from each shelf.
- **Full box, $89:** 8 picks. It needs at least one from every shelf (5), then 3 more, with at most 2 per shelf.
- **Flat price.** The picks don't change the price. Only upgrades (the coney kit, +$8) and the photo card (+$10) add to it.
- The side panel shows "Your full box" as a tray of slots filling with item photos, a meter ("3 more picks to fill the box"), and the line items and total.
- The shelf rules make every box come out balanced: pop + salty + sweet + pantry + keepsake.

## 5. The other selling pieces

- **Gift finder** ("so, who's it For?") maps a **person to a box** and says why:

  | Person | Box |
  |---|---|
  | Someone who moved away | Care Package |
  | Family back home | 313 |
  | The game day crowd | Game Day |
  | The up-north people | Michigan Box |
  | A client or new hire | Woodward |
  | Someone who has everything | 313, or build one |

- **Map** ("every item has a **Detroit address**"): an illustrated skyline (Eastern Market, the bridge and more). Tap a building to see what it puts in the box.
- **Shipping section:** enter a ZIP to see delivery timing, plus the holiday cutoff ladder.
- **Corporate:**
  - 5-box minimum
  - 15% off orders of $5,000+
  - free logo card
  - one spreadsheet for all addresses
  - a pricing tool with no sales call

## 6. What this means for Michigan Gift Store

I built the Michigan theme the other way round: 36 Shopify products sold one by one, and a builder that charges the sum of the items plus a box fee. The Detroit model is stronger for a gift shop, and the two sites should feel like the same company. I recommend switching:

1. **Boxes only.** Michigan Shopify products become the boxes, two flat-price builder sizes and a few add-ons. The 36 items move into a data file (a metaobject or JSON) as content, using Detroit's item fields.
2. **Shelves for the builder, Michigan-style.** Pop / Salty / Sweet / Up North pantry / Keepsake, with regional twists: Trenary Toast, Jampot jam, Yooper Bar, Cherry Republic, American Spoon, Michigan maple. Flat $49 for 4 picks, $89 for 8.
3. **Copy the open-box panel**, so every box gets the same three gift steps:
   - pick the card
   - who's it going to, including "Text or email them"
   - when should it ship, including "Hold for the holidays"
4. **Add the "Worth $X on its own" value anchor** and the per-item "why" lines.
5. **Gift finder by person:**

   | Person | Box |
   |---|---|
   | Moved away | Care Package |
   | The cottage crowd | Up North |
   | Yoopers | U.P. box |
   | West Michigan | Lakeshore box |
   | Client | Executive |

6. **Don't duplicate the Detroit lineup.** The Michigan Box ($79: dried cherries, Mackinac fudge, Koeze, Kar's, Pop Daddy, Rock & Rye) overlaps the Michigan store almost exactly. Either move it here and point Detroit to it, or give the Michigan store regional boxes Detroit doesn't have (Up North, U.P., Lakeshore, The Thumb).
7. **Shared code.** The Detroit gift flow (recipient properties, multi-address cart, holiday hold) is already proven. Pulling the Detroit theme source (`shopify theme pull`) and reusing that logic beats rebuilding it.
