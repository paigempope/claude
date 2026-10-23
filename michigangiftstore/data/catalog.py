"""
Launch catalog for michigangiftstore.com: single source of truth.

Run `python3 data/catalog.py` to regenerate:
  data/products.csv      Shopify product import (with custom.* metafield columns)
  preview/catalog.json   Mock data used by the local theme preview

Retail prices are SUGGESTED sell prices (sourcing cost + packing + margin), not
store shelf prices. Origin facts come from research/brand-audit-and-product-catalog.md;
anything marked unverified there is kept out of customer-facing copy.
Only shelf-stable items are listed. Frozen and refrigerated classics are covered by the
"can't ship" section instead.
"""
import csv, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))

# region keys -> display names
R = {
    'det': 'Metro Detroit', 'west': 'West Michigan', 'north': 'Up North',
    'up': 'The U.P.', 'thumb': 'The Thumb',
}

# (title, vendor, type/collection, region, origin_city, founded, price, compare_at, package shape, bg, tags, why_miss, shipping_note, grams)
ITEMS = [
    # --- Chips & Snacks
    ("Better Made Special BBQ Potato Chips, 9.5 oz", "Better Made", "Chips & Snacks", 'det', "Gratiot Ave, Detroit", "1930", 7.99, None, "bag", "#FBEFC4",
     ["bestseller", "box-eligible"], "The sweet BBQ chip every Michigander swears you can't find anywhere else.", "Packed with void fill so chips arrive whole.", 300),
    ("Better Made Original Potato Chips, 9.5 oz", "Better Made", "Chips & Snacks", 'det', "Gratiot Ave, Detroit", "1930", 7.49, None, "bag", "#FFF4CF",
     ["box-eligible"], "On every Detroit picnic table since 1930. Fight over the dark 'rainbow' chips.", "Packed with void fill so chips arrive whole.", 300),
    ("Better Made Red Hot BBQ Chips, 9.5 oz", "Better Made", "Chips & Snacks", 'det', "Gratiot Ave, Detroit", "1930", 7.99, None, "bag", "#F7DAD6",
     ["box-eligible"], "Special BBQ's spicier cousin.", "", 300),
    ("Great Lakes Cherry BBQ Kettle Chips, 8 oz", "Great Lakes Potato Chip Co.", "Chips & Snacks", 'north', "Traverse City", "2009", 6.99, None, "bag", "#F7DAD6",
     ["box-eligible", "bestseller"], "Kettle chips from Michigan potatoes, dusted with Traverse City cherry.", "", 260),
    ("Pop Daddy Dill Pickle Pretzels, 10 oz", "Pop Daddy", "Chips & Snacks", 'det', "Howell", "2013", 6.99, None, "bag", "#D9EBDF",
     ["box-eligible"], "The cult Michigan pretzel. One bag and you're hooked.", "", 300),
    ("Kar's Sweet 'N Salty Mix, 14 oz", "Kar's Nuts", "Chips & Snacks", 'det', "Madison Heights", "1933", 8.49, None, "bag", "#DCEDF7",
     ["box-eligible", "heat-sensitive"], "Born outside the old ballpark at Michigan & Trumbull, packed in every Michigan lunchbox.", "Contains chocolate pieces; cold-packed May–Sept.", 420),
    ("Germack Red Pistachios, 8 oz", "Germack", "Chips & Snacks", 'det', "Eastern Market, Detroit", "1924", 12.99, None, "bag", "#F7DAD6",
     ["box-eligible", "bestseller"], "America's oldest pistachio roaster, right in Eastern Market.", "", 260),
    ("Germack Cherry & Praline Nut Mix, 8 oz", "Germack", "Chips & Snacks", 'det', "Eastern Market, Detroit", "1924", 11.99, None, "bag", "#E3ECF7",
     ["box-eligible"], "Up North cherries and Eastern Market nuts in one bag.", "", 260),
    ("Detroit Popcorn Co. Caramel Corn, 8 oz", "Detroit Popcorn Co.", "Chips & Snacks", 'det', "Redford", "1923", 8.99, None, "bag", "#FBEFC4",
     ["box-eligible"], "A century of Detroit popcorn.", "", 260),
    ("McClure's Spicy Pickle Chips, 5 oz", "McClure's", "Chips & Snacks", 'det', "Detroit", "2006", 5.99, None, "bag", "#D9EBDF",
     ["box-eligible"], "Pickle-brine chips from Detroit's pickle brothers.", "", 170),
    # --- Pop
    ("Faygo Rock & Rye, 12 oz can (4-pack)", "Faygo", "Michigan Pop", 'det', "Gratiot Ave, Detroit", "1907", 9.99, None, "can", "#F7DAD6",
     ["bestseller", "box-eligible", "pop"], "Cream soda with a cherry wink. THE Michigan pop.", "Cans are wrapped and packed upright. In deep-freeze weeks we may hold pop a few days.", 1600),
    ("Faygo Redpop, 12 oz can (4-pack)", "Faygo", "Michigan Pop", 'det', "Gratiot Ave, Detroit", "1907", 9.99, None, "can", "#F7DAD6",
     ["box-eligible", "pop"], "'Redpop' is a word only Michiganders say.", "Cans are wrapped and packed upright.", 1600),
    ("Faygo Moon Mist, 12 oz can (4-pack)", "Faygo", "Michigan Pop", 'det', "Gratiot Ave, Detroit", "1907", 9.99, None, "can", "#D9EBDF",
     ["box-eligible", "pop"], "The citrus Faygo you drank at every Michigan grad party.", "Cans are wrapped and packed upright.", 1600),
    ("Faygo Variety Pack, 12 oz cans (8 flavors)", "Faygo", "Michigan Pop", 'det', "Gratiot Ave, Detroit", "1907", 21.99, None, "can", "#FBEFC4",
     ["pop", "ships-free"], "Rock & Rye, Redpop, Moon Mist, Cotton Candy and more. A nostalgia grab bag.", "Cans are wrapped and packed upright.", 3200),
    ("Vernors Ginger Soda, 12 oz can (4-pack)", "Vernors", "Michigan Pop", 'det', "Detroit", "1866", 9.99, None, "can", "#D9EBDF",
     ["bestseller", "box-eligible", "pop"], "What Mom gave you when you were sick. Add vanilla ice cream for a Boston Cooler.", "Cans are wrapped and packed upright.", 1600),
    # --- Sweets & Fudge
    ("Sanders Milk Chocolate Hot Fudge, 10 oz jar", "Sanders", "Fudge & Sweets", 'det', "Detroit", "1875", 8.99, None, "jar", "#E3ECF7",
     ["bestseller", "box-eligible"], "The hot fudge from the Sanders sundae counter. Warm the jar, pour over Hudsonville.", "Glass jar, bubble-wrapped. Shelf-stable unopened.", 450),
    ("Sanders Dark Chocolate Sea Salt Caramels, 6 oz", "Sanders", "Fudge & Sweets", 'det', "Clinton Township", "1875", 9.99, None, "box", "#DCE6F2",
     ["box-eligible", "heat-sensitive"], "The caramels every Michigan family brings to the holidays.", "Cold-packed May–September.", 200),
    ("Mackinac Island Fudge, Chocolate Pecan Slice", "Murdick's Fudge", "Fudge & Sweets", 'north', "Mackinac Island", "1887", 15.95, None, "bar", "#E3ECF7",
     ["box-eligible", "heat-sensitive", "seasonal"], "A Straits summer, in a half-pound slab. Fudgies welcome.", "Cold-packed May–September. Best within 3 weeks.", 260),
    ("Mackinac Island Fudge, Classic Chocolate Slice", "Murdick's Fudge", "Fudge & Sweets", 'north', "Mackinac Island", "1887", 15.95, None, "bar", "#DCE6F2",
     ["box-eligible", "heat-sensitive", "seasonal"], "The island's original fudge maker.", "Cold-packed May–September. Best within 3 weeks.", 260),
    ("Cherry Republic Chocolate Covered Cherries, 5 oz", "Cherry Republic", "Fudge & Sweets", 'north', "Glen Arbor", "1989", 8.95, None, "box", "#F7DAD6",
     ["box-eligible", "heat-sensitive"], "A Sleeping Bear Dunes day trip you can eat.", "Cold-packed May–September.", 170),
    ("Sayklly's Yooper Bar, milk chocolate", "Sayklly's", "Fudge & Sweets", 'up', "Escanaba", "1906", 7.99, None, "bar", "#DCEDF7",
     ["box-eligible", "heat-sensitive"], "A chocolate bar shaped like the U.P. Instant Yooper pride.", "Cold-packed May–September.", 120),
    # --- Up North / Cherries
    ("Cherry Republic Dried Montmorency Cherries, 8 oz", "Cherry Republic", "Up North Cherries", 'north', "Glen Arbor", "1989", 12.95, None, "bag", "#F7DAD6",
     ["bestseller", "box-eligible"], "Life, Liberty, Beaches & Pie. The Up North cherry, dried.", "", 240),
    ("American Spoon Sour Cherry Preserves, 9.5 oz", "American Spoon", "Up North Cherries", 'north', "Petoskey", "1982", 13.95, None, "jar", "#F7DAD6",
     ["box-eligible"], "Small-batch preserves from Petoskey, made with Michigan Montmorency cherries.", "Glass jar, bubble-wrapped.", 450),
    ("Traverse City Cherry Salsa, 16 oz", "Traverse Bay Farms", "Up North Cherries", 'north', "Bellaire", None, 9.99, None, "jar", "#F7DAD6",
     ["box-eligible"], "Sweet-heat salsa from the cherry capital.", "Glass jar, bubble-wrapped.", 600),
    ("Jampot Wild Thimbleberry Jam, 9 oz", "The Jampot", "Up North Cherries", 'up', "Keweenaw Peninsula", None, 27.99, None, "jar", "#E7D6E8",
     ["box-eligible", "limited"], "Thimbleberries barely grow anywhere but the U.P.'s north woods. Rare and worth it.", "Glass jar, bubble-wrapped. Limited stock each season.", 400),
    ("Michigan Pure Maple Syrup, 8 oz", "Michigan maple farm (supplier TBD)", "Up North Cherries", 'north', "Northern Michigan", None, 14.99, None, "bottle", "#DCEDF7",
     ["box-eligible"], "Michigan is a top-five maple state. This is Up North sugarbush syrup.", "Shipped in a plastic jug, not glass.", 360),
    # --- Pantry & Sauces
    ("Jiffy Corn Muffin Mix, 8.5 oz (3-pack)", "Chelsea Milling", "Pantry & Sauces", 'det', "Chelsea", "1930", 5.99, None, "box", "#DCEDF7",
     ["box-eligible", "us-only"], "The little blue box, made down the road in Chelsea since 1930.", "Contains lard; US addresses only.", 750),
    ("Koeze Cream-Nut Natural Peanut Butter, 17 oz", "Koeze", "Pantry & Sauces", 'west', "Grand Rapids", "1925", 10.99, None, "jar", "#DCEDF7",
     ["box-eligible"], "Dark-roasted Virginia peanuts on Grand Rapids equipment that dates to 1925.", "Glass jar, bubble-wrapped.", 700),
    ("National Coney Island Chili Sauce, 7.5 oz can (2-pack)", "National Coney Island", "Pantry & Sauces", 'det', "Metro Detroit", None, 9.99, None, "can", "#F7DAD6",
     ["box-eligible", "us-only"], "Make a real Detroit coney at home: dog, chili, mustard, onions.", "Contains meat; US addresses only.", 500),
    ("Hell Fire Detroit Hot Sauce, 5 oz", "Hell Fire Detroit", "Pantry & Sauces", 'det', "Warren", None, 12.99, None, "bottle", "#F7DAD6",
     ["box-eligible"], "The Detroit hot sauce that made it onto Hot Ones.", "Glass bottle, bubble-wrapped.", 300),
    ("Zehnder's Frankenmuth Egg Noodles, 12 oz", "Zehnder's", "Pantry & Sauces", 'thumb', "Frankenmuth", None, 7.99, None, "bag", "#FBEFC4",
     ["box-eligible"], "The noodles from the Frankenmuth chicken dinner.", "", 350),
    ("Michigan Navy Beans, 2 lb", "Huron County grower (supplier TBD)", "Pantry & Sauces", 'thumb', "Huron County", None, 6.99, None, "bag", "#E3ECF7",
     ["box-eligible"], "Huron County grows more dry beans than any county in the country.", "", 910),
    ("Pioneer Sugar, 4 lb", "Michigan Sugar Co.", "Pantry & Sauces", 'thumb', "Bay City", "1906", 6.49, None, "bag", "#EEF5FA",
     [], "Thumb sugar beets, grower-owned. Bake Grandma's recipe with the real thing.", "", 1810),
    # --- Coffee & Breakfast
    ("Trenary Toast, Cinnamon Sugar (16 slices)", "Trenary Home Bakery", "Coffee & Breakfast", 'up', "Trenary", "1928", 7.99, None, "bag", "#DCEDF7",
     ["bestseller", "box-eligible"], "The Finnish rusk Yoopers dunk in their coffee. Keeps for months.", "", 300),
    ("Great Lakes Coffee Detroit Blend, 12 oz whole bean", "Great Lakes Coffee Roasting Co.", "Coffee & Breakfast", 'det', "Midtown Detroit", "1994", 15.99, None, "bag", "#DCE6F2",
     ["box-eligible"], "Roasted in Midtown, poured all over Metro Detroit.", "", 360),
    ("Germack Detroit Roast Coffee, 12 oz", "Germack", "Coffee & Breakfast", 'det', "Eastern Market, Detroit", "1924", 14.99, None, "bag", "#E3ECF7",
     ["box-eligible"], "Eastern Market's pistachio roasters roast coffee too.", "", 360),
]

BOXES = [
    ("The Day Tripper Gift Box", 45, "Day Tripper", "5 classics", "#FBEFC4", "giftbox",
     ["Better Made Special BBQ Potato Chips, 9.5 oz | Gratiot Ave, Detroit · since 1930",
      "Faygo Rock & Rye, 12 oz can | Gratiot Ave, Detroit · since 1907",
      "Sanders Milk Chocolate Hot Fudge, 10 oz jar | Detroit · since 1875",
      "Germack Red Pistachios, 8 oz | Eastern Market · since 1924",
      "Handwritten Michigan postcard with your note | Packed in Michigan"],
     "A quick hit of home for birthdays, teachers and 'thinking of you'."),
    ("The Up North Gift Box", 79, "Up North", "9 classics", "#F7DAD6", "giftbox",
     ["Everything in The Day Tripper | 5 Metro Detroit classics",
      "Mackinac Island fudge slice | Mackinac Island · since 1887 (seasonal)",
      "Cherry Republic dried Montmorency cherries, 8 oz | Glen Arbor · since 1989",
      "Great Lakes Cherry BBQ kettle chips, 8 oz | Traverse City · since 2009",
      "Vernors Ginger Soda, 12 oz can | Detroit · since 1866",
      "Koeze Cream-Nut peanut butter, 17 oz | Grand Rapids · since 1925"],
     "From Detroit to the Straits: chips, pop, fudge and cherries. Our most-gifted box."),
    ("The Full Mitten Gift Crate", 119, "Full Mitten", "14 classics", "#DCEDF7", "crate",
     ["Everything in The Up North | 9 classics",
      "Trenary Toast, 16 slices | Trenary, U.P. · since 1928",
      "American Spoon sour cherry preserves | Petoskey · since 1982",
      "Pop Daddy dill pickle pretzels | Howell · since 2013",
      "Jiffy corn muffin mix | Chelsea · since 1930",
      "Keepsake wooden crate | Reuse it for the next care package"],
     "Every region, from Detroit to the U.P., in one keepsake crate."),
    ("The Great Lakes Executive Crate", 179, "Executive", "20 classics", "#E3ECF7", "crate",
     ["Everything in The Full Mitten | 14 classics",
      "Great Lakes Coffee Detroit Blend | Midtown Detroit · since 1994",
      "Jampot wild thimbleberry jam | Keweenaw Peninsula",
      "Sanders sea salt caramels | Clinton Twp · since 1875",
      "Michigan maple syrup | Northern Michigan",
      "Logo card for corporate orders | Free on 25+ boxes"],
     "The whole state, top to bottom. Built for clients, closings and big thank-yous."),
]


def handle(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:80]


def main():
    rows, preview = [], []
    cols = ["Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published", "Option1 Name", "Option1 Value",
            "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Policy", "Variant Fulfillment Service",
            "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable", "Variant Weight Unit",
            "SEO Title", "SEO Description", "Status",
            "Region (product.metafields.custom.region)",
            "Origin city (product.metafields.custom.origin_city)",
            "Founded year (product.metafields.custom.founded_year)",
            "Why they miss it (product.metafields.custom.why_miss)",
            "Contents (product.metafields.custom.contents)",
            "Shipping note (product.metafields.custom.shipping_note)"]

    for i, (title, vendor, typ, reg, city, year, price, cmp, shape, bg, tags, why, ship, grams) in enumerate(ITEMS):
        h = handle(title)
        all_tags = [f"region:{R[reg]}", typ] + tags
        if price < 25: all_tags.append("under-25")
        body = f"<p>{why}</p><p>Made by {vendor} · {city}, Michigan{(' · since ' + year) if year else ''}. Hand-packed and shipped from Michigan.</p>"
        rows.append({
            "Handle": h, "Title": title, "Body (HTML)": body, "Vendor": vendor, "Type": typ, "Tags": ", ".join(all_tags),
            "Published": "TRUE", "Option1 Name": "Title", "Option1 Value": "Default Title", "Variant SKU": f"MGS-{i+1:03d}",
            "Variant Grams": grams, "Variant Inventory Tracker": "shopify", "Variant Inventory Policy": "deny",
            "Variant Fulfillment Service": "manual", "Variant Price": f"{price:.2f}", "Variant Compare At Price": f"{cmp:.2f}" if cmp else "",
            "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE", "Variant Weight Unit": "g",
            "SEO Title": f"{title} | Shipped from Michigan", "SEO Description": f"{why} Buy {vendor} online, hand-packed in Michigan and shipped to all 50 states.",
            "Status": "draft",
            "Region (product.metafields.custom.region)": R[reg], "Origin city (product.metafields.custom.origin_city)": f"{city}, MI",
            "Founded year (product.metafields.custom.founded_year)": year or "", "Why they miss it (product.metafields.custom.why_miss)": why,
            "Contents (product.metafields.custom.contents)": "", "Shipping note (product.metafields.custom.shipping_note)": ship,
        })
        preview.append(dict(handle=h, title=title, vendor=vendor, type=typ, region=R[reg], origin=f"{city}, MI", founded=year,
                            price=int(round(price * 100)), compare_at=int(cmp * 100) if cmp else None, shape=shape, bg=bg,
                            tags=all_tags, why=why, contents=[], kind='item'))

    for j, (title, price, short, count, bg, shape, contents, blurb) in enumerate(BOXES):
        h = handle(title)
        tags = ["Gift Boxes", "ships-free", "gift-box"] + (["bestseller"] if j == 1 else [])
        rows.append({
            "Handle": h, "Title": title, "Body (HTML)": f"<p>{blurb}</p><p>Hand-packed in Michigan with a handwritten card. Prices never go inside. Ships free.</p>",
            "Vendor": "Michigan Gift Store", "Type": "Gift Boxes", "Tags": ", ".join(tags), "Published": "TRUE",
            "Option1 Name": "Title", "Option1 Value": "Default Title", "Variant SKU": f"MGS-BOX-{j+1}", "Variant Grams": 2500 + j * 1200,
            "Variant Inventory Tracker": "", "Variant Inventory Policy": "continue", "Variant Fulfillment Service": "manual",
            "Variant Price": f"{price:.2f}", "Variant Compare At Price": "", "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
            "Variant Weight Unit": "g", "SEO Title": f"{title}: Michigan Gift Box, Ships Free",
            "SEO Description": f"{blurb} Better Made, Faygo, Sanders and more, packed in Michigan and shipped free.",
            "Status": "draft", "Region (product.metafields.custom.region)": "Statewide",
            "Origin city (product.metafields.custom.origin_city)": "", "Founded year (product.metafields.custom.founded_year)": "",
            "Why they miss it (product.metafields.custom.why_miss)": "", "Contents (product.metafields.custom.contents)": "\n".join(contents),
            "Shipping note (product.metafields.custom.shipping_note)": "Ships free by ground. Chocolate and fudge are cold-packed May–September.",
        })
        preview.append(dict(handle=h, title=title, vendor="Michigan Gift Store", type="Gift Boxes", region="Statewide", origin="", founded=None,
                            price=price * 100, compare_at=None, shape=shape, bg=bg, tags=tags, why=blurb, contents=contents, kind='box', short=short, count=count))

    # Build-a-box container product (variants = sizes; price = packing + card fee)
    for k, (size, fee) in enumerate([("Small · 4 items", 6), ("Classic · 6 items", 8), ("Big · 10 items", 12)]):
        rows.append({c: "" for c in cols} | {
            "Handle": "build-your-own-box", "Title": "Build Your Own Michigan Box" if k == 0 else "",
            "Body (HTML)": "<p>Gift box, tissue, crinkle fill and a handwritten card.</p>" if k == 0 else "",
            "Vendor": "Michigan Gift Store" if k == 0 else "", "Type": "Box Builder" if k == 0 else "",
            "Tags": "box-container, hidden" if k == 0 else "", "Published": "TRUE" if k == 0 else "",
            "Option1 Name": "Size" if k == 0 else "", "Option1 Value": size, "Variant SKU": f"MGS-BYO-{k+1}",
            "Variant Grams": 400, "Variant Inventory Policy": "continue", "Variant Fulfillment Service": "manual",
            "Variant Price": f"{fee:.2f}", "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE", "Variant Weight Unit": "g",
            "Status": "draft" if k == 0 else ""})

    with open(os.path.join(HERE, "products.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)
    os.makedirs(os.path.join(HERE, "..", "preview"), exist_ok=True)
    with open(os.path.join(HERE, "..", "preview", "catalog.json"), "w") as f:
        json.dump(preview, f, indent=1, ensure_ascii=False)
    print(f"{len(ITEMS)} items + {len(BOXES)} boxes + box builder -> data/products.csv, preview/catalog.json")


if __name__ == "__main__":
    main()
