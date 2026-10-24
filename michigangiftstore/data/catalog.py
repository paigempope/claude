"""
Michigan Gift Store catalog: single source of truth (Detroit Gift Store model).

Shopify sells BOXES ONLY: five curated boxes, two flat-price builder sizes and two add-ons.
The individual Michigan items are content (name, size, hometown, why people miss them),
shown inside boxes, on the map and in the builder. They are not Shopify products.

Run `python3 data/catalog.py` to regenerate:
  theme/snippets/mgs-data.liquid   JSON the theme's interactive pieces read (live prices merged in by Liquid)
  data/products.csv                Shopify product import (boxes, builder sizes, add-ons), all as drafts
  preview/catalog.json             mock data for the local preview

Values (`v`, cents) are approximate retail for the "Worth $X on its own" anchor. Facts come
from research/brand-audit-and-product-catalog.md; anything unverified there stays out of the copy.
Keepsake makers are marked "supplier TBD" until sourced.
"""
import csv, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Map positions on the theme's Michigan outline (viewBox 600 x 640), projected from real lat/lon.
PLACES = {
    'detroit':     dict(n='Metro Detroit',    region='Metro Detroit', x=525, y=567),
    'chelsea':     dict(n='Chelsea',          region='Metro Detroit', x=457, y=570),
    'howell':      dict(n='Howell',           region='Metro Detroit', x=463, y=542),
    'grandrapids': dict(n='Grand Rapids',     region='West Michigan', x=342, y=510),
    'traverse':    dict(n='Traverse City',    region='Up North',      x=345, y=339),
    'glenarbor':   dict(n='Glen Arbor',       region='Up North',      x=320, y=326),
    'petoskey':    dict(n='Petoskey',         region='Up North',      x=390, y=281),
    'mackinac':    dict(n='Mackinac Island',  region='Up North',      x=412, y=236),
    'escanaba':    dict(n='Escanaba',         region='The U.P.',      x=250, y=244),
    'trenary':     dict(n='Trenary',          region='The U.P.',      x=257, y=203),
    'keweenaw':    dict(n='Keweenaw',         region='The U.P.',      x=186, y=84),
    'frankenmuth': dict(n='Frankenmuth',      region='The Thumb',     x=475, y=474),
    'huron':       dict(n='Huron County',     region='The Thumb',     x=521, y=423),
}

SHELVES = [
    dict(id='pop',    n='Pop',            note="It's pop, not soda"),
    dict(id='salty',  n='Salty',          note='Chips, pretzels, nuts'),
    dict(id='sweet',  n='Sweet',          note='Fudge, Sanders and chocolate'),
    dict(id='pantry', n='Up North pantry', note='Cherries, jam, toast, peanut butter'),
    dict(id='keep',   n='Keepsake',       note='Something that stays'),
]

# key: (name, size, maker, place, from-line, why, value cents, shelf or None, shape, color, flags)
# shapes: can bag jar bottle box slab bar toast stone ornament magnet mug card
ITEMS = {
    # Pop
    'rockrye':  ("Faygo Rock & Rye", "12 oz can", "Faygo", 'detroit', "Gratiot Ave, since 1907", "Cream soda with a cherry wink. Michiganders order it by name.", 300, 'pop', 'can', '#B8352B', {}),
    'redpop':   ("Faygo Redpop", "12 oz can", "Faygo", 'detroit', "Gratiot Ave, since 1907", "Strawberry pop. 'Redpop' is a word only Michiganders say.", 300, 'pop', 'can', '#D9443A', {}),
    'moonmist': ("Faygo Moon Mist", "12 oz can", "Faygo", 'detroit', "Gratiot Ave, since 1907", "The citrus pop at every Michigan grad party.", 300, 'pop', 'can', '#3E8F5A', {}),
    'rootbeer': ("Faygo Root Beer", "12 oz can", "Faygo", 'detroit', "Gratiot Ave, since 1907", "The flavor people who left buy by the case.", 300, 'pop', 'can', '#6B3E26', {}),
    'vernors':  ("Vernors Ginger Soda", "12 oz can", "Vernors", 'detroit', "Detroit, since 1866", "What Mom poured when you were sick. Add vanilla ice cream for a Boston Cooler.", 300, 'pop', 'can', '#2E7D4F', {}),
    # Salty
    'bbq':      ("Better Made Special BBQ Chips", "5 oz bag", "Better Made", 'detroit', "Gratiot Ave, since 1930", "The sweet BBQ chip nobody outside Michigan gets right.", 500, 'salty', 'bag', '#B8352B', {}),
    'cherrybbq':("Great Lakes Cherry BBQ Kettle Chips", "5 oz bag", "Great Lakes Potato Chip Co.", 'traverse', "Traverse City, since 2009", "Michigan potatoes, dusted with Traverse City cherry.", 500, 'salty', 'bag', '#7A1F2B', {}),
    'popdaddy': ("Pop Daddy Dill Pickle Pretzels", "7.5 oz bag", "Pop Daddy", 'howell', "Howell, since 2013", "Seasoned the Michigan way: heavy.", 500, 'salty', 'bag', '#3E8F5A', {}),
    'kars':     ("Kar's Sweet 'N Salty", "2 oz bag", "Kar's Nuts", 'detroit', "Madison Heights, since 1933", "The trail mix in every Michigan glove box.", 300, 'salty', 'bag', '#E9A23B', {'heat': True}),
    'pistachios':("Germack Pistachios", "8 oz bag", "Germack", 'detroit', "Eastern Market, since 1924", "Roasted in Eastern Market by America's oldest pistachio roaster.", 1000, 'salty', 'bag', '#5E8C3A', {}),
    # Sweet
    'hotfudge': ("Sanders Hot Fudge", "10 oz jar", "Sanders", 'detroit', "Detroit, since 1875", "The jar people ask for after they move away. Warm it and pour.", 900, 'sweet', 'jar', '#5A3221', {}),
    'caramels': ("Sanders Sea Salt Caramels", "6 oz box", "Sanders", 'detroit', "Detroit, since 1875", "Grandma's candy dish, grown up.", 900, 'sweet', 'box', '#1F4E8C', {'heat': True}),
    'mfudge':   ("Mackinac Island Fudge", "8 oz slab", "Murdick's Fudge", 'mackinac', "Mackinac Island, since 1887", "The souvenir every trip to the Straits ended with.", 1000, 'sweet', 'slab', '#6B3E26', {'heat': True}),
    'cocherry': ("Chocolate Covered Cherries", "5 oz bag", "Cherry Republic", 'glenarbor', "Glen Arbor, since 1989", "A Sleeping Bear Dunes day trip you can eat.", 900, 'sweet', 'bag', '#7A1F2B', {'heat': True}),
    'yooperbar':("Sayklly's Yooper Bar", "milk chocolate", "Sayklly's", 'escanaba', "Escanaba, since 1906", "A chocolate bar shaped like the U.P. Instant Yooper pride.", 700, 'sweet', 'bar', '#4A2A1A', {'heat': True}),
    # Up North pantry
    'drycherry':("Dried Montmorency Cherries", "8 oz bag", "Cherry Republic", 'glenarbor', "Glen Arbor, since 1989", "Michigan grows most of the country's tart cherries. These are the good ones.", 1300, 'pantry', 'bag', '#B8352B', {}),
    'spoon':    ("American Spoon Sour Cherry Preserves", "9.5 oz jar", "American Spoon", 'petoskey', "Petoskey, since 1982", "Small-batch preserves from Petoskey, made with Michigan cherries.", 1400, 'pantry', 'jar', '#B8352B', {}),
    'koeze':    ("Koeze Cream-Nut Peanut Butter", "17 oz jar", "Koeze", 'grandrapids', "Grand Rapids, since 1925", "Just peanuts and salt, in the jar Michiganders hoard.", 1100, 'pantry', 'jar', '#8A5A2B', {}),
    'trenary':  ("Trenary Toast", "16 slices", "Trenary Home Bakery", 'trenary', "Trenary, since 1928", "The cinnamon rusk Yoopers dunk in their coffee. Keeps for months.", 800, 'pantry', 'toast', '#C98B3A', {}),
    'jampot':   ("Wild Thimbleberry Jam", "9 oz jar", "The Jampot", 'keweenaw', "Keweenaw Peninsula", "Thimbleberries barely grow anywhere but the U.P.'s north woods.", 2800, 'pantry', 'jar', '#9B2242', {'up': 12, 'upv': 'Thimbleberry jam'}),
    'maple':    ("Michigan Maple Syrup", "8 oz jug", "Michigan maple farm (supplier TBD)", 'traverse', "Northern Michigan", "Michigan is a top-five maple state. Up North sugarbush syrup.", 1500, 'pantry', 'bottle', '#B5651D', {}),
    'jiffy':    ("Jiffy Corn Muffin Mix", "8.5 oz box", "Chelsea Milling", 'chelsea', "Chelsea, since 1930", "The little blue box in every Michigan pantry.", 200, 'pantry', 'box', '#2F6FB5', {'usOnly': True}),
    'noodles':  ("Zehnder's Egg Noodles", "12 oz bag", "Zehnder's", 'frankenmuth', "Frankenmuth", "The noodles from the Frankenmuth chicken dinner.", 800, 'pantry', 'bag', '#E9C450', {}),
    'beans':    ("Michigan Navy Beans", "1 lb bag", "Huron County grower (supplier TBD)", 'huron', "Huron County", "The Thumb grows more dry beans than anywhere in the country.", 500, 'pantry', 'bag', '#E8E2D0', {}),
    # Keepsake
    'stone':    ("Polished Petoskey Stone", "palm-size", "Petoskey shop (supplier TBD)", 'petoskey', "Little Traverse Bay", "Michigan's state stone. Everyone searched the beach for one.", 1200, 'keep', 'stone', '#9A9284', {}),
    'bridge':   ("Mackinac Bridge Ornament", "3 in", "Michigan maker (supplier TBD)", 'mackinac', "The Straits", "Five miles of bridge, for the tree.", 1400, 'keep', 'ornament', '#1F6FA3', {}),
    'magnet':   ("Mitten Magnet", "3 in", "Michigan maker (supplier TBD)", 'detroit', "Made in Michigan", "For the fridge of anyone who uses their hand as a map.", 500, 'keep', 'magnet', '#1F2D5C', {}),
    'mug':      ("Great Lakes Map Mug", "14 oz", "Michigan maker (supplier TBD)", 'detroit', "Made in Michigan", "All five lakes, around your morning coffee.", 1800, 'keep', 'mug', '#1F6FA3', {}),
    # Box-only
    'coffee':   ("Great Lakes Coffee Detroit Blend", "12 oz bag", "Great Lakes Coffee Roasting Co.", 'detroit', "Midtown Detroit, since 1994", "Roasted in Midtown. For dunking the Trenary Toast.", 1500, None, 'bag', '#3B2A20', {}),
    'card':     ("Greetings from Michigan Postcard", "4 x 6 in", "Us", 'detroit', "Handwritten in Michigan", "Your message, written by hand. Prices never go inside.", 0, None, 'card', '#F4F9FC', {}),
}

# Boxes: handle, title, price $, who (handwritten line), pitch, panel color, items
BOXES = {
    'homesick':   ('the-homesick-box', "The Homesick Box", 59, "for the ones who moved away", "Built from what Michiganders who left say they miss first. Better Made, Rock & Rye, Vernors for a Boston Cooler and Sanders hot fudge.", '#F7DAD6', ['bbq', 'rockrye', 'vernors', 'hotfudge', 'jiffy', 'kars', 'card']),
    'yooper':     ('the-yooper', "The Yooper", 69, "for anyone from above the Bridge", "Trenary Toast and coffee to dunk it in, thimbleberry jam from the Keweenaw, a Yooper Bar and the Bridge for the tree.", '#D9EBDF', ['trenary', 'coffee', 'jampot', 'yooperbar', 'bridge', 'card']),
    'upnorth':    ('the-up-north', "The Up North", 79, "for the cottage crowd", "Cherry country in a box. Glen Arbor cherries, Mackinac fudge, Petoskey preserves and a Petoskey stone for the windowsill.", '#DCEDF7', ['drycherry', 'mfudge', 'cherrybbq', 'spoon', 'cocherry', 'stone', 'rockrye', 'card']),
    'fullmitten': ('the-full-mitten', "The Full Mitten", 99, "for family all over the state", "One classic from every corner: Detroit chips and pop, Grand Rapids peanut butter, Up North cherries and fudge, U.P. toast and Frankenmuth noodles.", '#FBEFC4', ['bbq', 'vernors', 'koeze', 'drycherry', 'mfudge', 'trenary', 'noodles', 'magnet', 'card']),
    'greatlakes': ('the-great-lakes', "The Great Lakes", 189, "for clients, closings and new hires", "The executive crate. Detroit-roasted coffee, thimbleberry jam, maple syrup, Petoskey preserves, Germack and Sanders, and a Great Lakes mug. Your logo on the card.", '#E3ECF7', ['coffee', 'jampot', 'maple', 'spoon', 'pistachios', 'hotfudge', 'caramels', 'mug', 'card']),
}

FINDER = [
    ('moved',  "Someone who moved away",      'homesick',   "Built from what Michiganders who left say they miss first: Better Made BBQ, Rock & Rye, Vernors and Sanders hot fudge."),
    ('cottage',"The cottage crowd",           'upnorth',    "Cherries from Glen Arbor, fudge from the Island and a Petoskey stone. Summer up north, shelf-stable."),
    ('yooper', "A Yooper",                    'yooper',     "Trenary Toast with coffee to dunk it in, thimbleberry jam and a Yooper Bar. They'll know you get it."),
    ('family', "Family all over the state",   'fullmitten', "One classic from every corner of the Mitten, so nobody's hometown gets left out."),
    ('client', "A client or new hire",        'greatlakes', "The executive crate with your logo on the card. Sending 10 or 500? Use corporate gifting."),
    ('all',    "Someone who has everything",  None,         "They don't have this. Build a box from five Michigan shelves and pick every item yourself."),
]

CARDS = [
    ('greet',  "Greetings from Michigan"),
    ('bridge', "Mackinac Bridge"),
    ('pines',  "Lake & pines"),
    ('photo',  "Your photo, +$10"),
]

SIZES = {
    'half': dict(handle='build-your-own-half-box', n="Half box", cap=4, per=1, price=49, d="4 picks: one each from any 4 shelves"),
    'full': dict(handle='build-your-own-full-box', n="Full box", cap=8, per=2, price=89, d="8 picks: one from every shelf, then 3 more (2 max per shelf)"),
}

ADDONS = {
    'photo-card':   ('custom-photo-card', "Custom Photo Card", [("Default Title", 10)], "Your photo printed on the front of the postcard that goes on top of the box, with a handwritten message inside."),
    'box-upgrade':  ('box-upgrade', "Box Upgrade", [("Thimbleberry jam", 12)], "Premium builder picks that cost a little more."),
}


def items_json():
    out = {}
    for k, (n, sz, m, place, frm, why, v, shelf, shape, color, flags) in ITEMS.items():
        out[k] = dict(n=n, sz=sz, m=m, place=place, from_=frm, why=why, v=v, shelf=shelf, s=shape, c=color, **flags)
    return {k: {('from' if kk == 'from_' else kk): vv for kk, vv in d.items()} for k, d in out.items()}


def line(k):
    n, sz, m, place, frm, *_ = ITEMS[k]
    return f"{n}, {sz} | {frm}"


def write_liquid_data():
    """Snippet emitting JSON; Liquid merges in live Shopify prices, variant ids and availability."""
    static = dict(items=items_json(), shelves=SHELVES, places=PLACES, finder=[dict(id=a, l=b, box=c, why=d) for a, b, c, d in FINDER],
                  cards=[dict(id=a, n=b) for a, b in CARDS])
    boxes_static = {k: dict(handle=h, n=t, p=p * 100, who=w, pitch=pi, blob=bl, items=it) for k, (h, t, p, w, pi, bl, it) in BOXES.items()}
    sizes_static = {k: dict(handle=v['handle'], n=v['n'], cap=v['cap'], per=v['per'], p=v['price'] * 100, d=v['d']) for k, v in SIZES.items()}

    parts = ["{%- comment -%}",
             "  GENERATED by data/catalog.py. Edit the catalog there, then rerun it.",
             "  Static item/box content plus live Shopify data (price, variant id, availability)",
             "  looked up by product handle, so prices always match the admin.",
             "{%- endcomment -%}",
             '<script type="application/json" id="MgsData">',
             "{",
             f'  "static": {json.dumps(static, ensure_ascii=False)},',
             f'  "boxDefs": {json.dumps(boxes_static, ensure_ascii=False)},',
             f'  "sizeDefs": {json.dumps(sizes_static, ensure_ascii=False)},',
             '  "live": {']
    live = []
    for k, (h, *_rest) in BOXES.items():
        live.append(f'    "{k}": {{%- assign p = all_products["{h}"] -%}}{{%- if p.id -%}}{{ "price": {{{{ p.price | json }}}}, "variant": {{{{ p.selected_or_first_available_variant.id | json }}}}, "url": {{{{ p.url | json }}}}, "available": {{{{ p.available | json }}}} }}{{%- else -%}}null{{%- endif -%}}')
    for k, v in SIZES.items():
        live.append(f'    "size_{k}": {{%- assign p = all_products["{v["handle"]}"] -%}}{{%- if p.id -%}}{{ "price": {{{{ p.price | json }}}}, "variant": {{{{ p.selected_or_first_available_variant.id | json }}}} }}{{%- else -%}}null{{%- endif -%}}')
    live.append('    "photo": {%- assign p = all_products["custom-photo-card"] -%}{%- if p.id -%}{ "price": {{ p.price | json }}, "variant": {{ p.selected_or_first_available_variant.id | json }} }{%- else -%}null{%- endif -%}')
    live.append('    "upgrades": {%- assign p = all_products["box-upgrade"] -%}{%- if p.id -%}{ {%- for v in p.variants -%}{{ v.title | json }}: { "price": {{ v.price | json }}, "variant": {{ v.id | json }} }{% unless forloop.last %},{% endunless %}{%- endfor -%} }{%- else -%}null{%- endif -%}')
    parts.append(",\n".join(live))
    parts += ['  },',
              '  "settings": { "free": {{ settings.free_shipping_threshold | times: 100 | json }}, "holdWindow": {{ settings.hold_window | json }}, "holdOpen": {{ settings.hold_enable | json }}, "money": {{ shop.money_format | json }} }',
              "}",
              "</script>", ""]
    path = os.path.join(ROOT, 'theme', 'snippets', 'mgs-data.liquid')
    open(path, 'w').write("\n".join(parts))


def write_csv():
    cols = ["Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published", "Option1 Name", "Option1 Value",
            "Variant SKU", "Variant Grams", "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price",
            "Variant Requires Shipping", "Variant Taxable", "Variant Weight Unit", "SEO Title", "SEO Description", "Status",
            "Region (product.metafields.custom.region)", "Contents (product.metafields.custom.contents)",
            "Box key (product.metafields.custom.box_key)", "Shipping note (product.metafields.custom.shipping_note)"]
    rows = []
    base = {c: "" for c in cols}
    for i, (k, (h, t, p, who, pitch, blob, its)) in enumerate(BOXES.items()):
        us = any(ITEMS[x][10].get('usOnly') for x in its)
        heat = any(ITEMS[x][10].get('heat') for x in its)
        body = f"<p>{pitch}</p><p>Packed by hand in Michigan with a handwritten postcard. No prices inside the box. Ships the next business day.</p>"
        tags = ["gift-box", "ships-free", k] + (["corporate"] if k == 'greatlakes' else []) + (["us-only"] if us else []) + (["heat-sensitive"] if heat else [])
        rows.append(base | {
            "Handle": h, "Title": t, "Body (HTML)": body, "Vendor": "Michigan Gift Store", "Type": "Gift box", "Tags": ", ".join(tags),
            "Published": "TRUE", "Option1 Name": "Title", "Option1 Value": "Default Title", "Variant SKU": f"MGS-{k.upper()}",
            "Variant Grams": 1200 + 150 * len(its), "Variant Inventory Policy": "continue", "Variant Fulfillment Service": "manual",
            "Variant Price": f"{p:.2f}", "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE", "Variant Weight Unit": "g",
            "SEO Title": f"{t}: Michigan Gift Box, Ships Free", "SEO Description": f"{pitch[:120]} Packed by hand in Michigan.",
            "Status": "draft", "Region (product.metafields.custom.region)": "Statewide",
            "Contents (product.metafields.custom.contents)": "\n".join(line(x) for x in its),
            "Box key (product.metafields.custom.box_key)": k,
            "Shipping note (product.metafields.custom.shipping_note)": ("Ships to US addresses only (Jiffy contains lard). " if us else "") + ("Chocolate and fudge are cold-packed May–September." if heat else ""),
        })
    for k, v in SIZES.items():
        rows.append(base | {
            "Handle": v['handle'], "Title": f"Build Your Own {v['n']}", "Body (HTML)": f"<p>A {v['n'].lower()} you pack yourself: {v['d']}. Packed by hand in Michigan with a handwritten postcard.</p>",
            "Vendor": "Michigan Gift Store", "Type": "Custom box", "Tags": "builder", "Published": "TRUE", "Option1 Name": "Title", "Option1 Value": "Default Title",
            "Variant SKU": f"MGS-BYO-{k.upper()}", "Variant Grams": 1000 if k == 'half' else 1600, "Variant Inventory Policy": "continue",
            "Variant Fulfillment Service": "manual", "Variant Price": f"{v['price']:.2f}", "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
            "Variant Weight Unit": "g", "Status": "draft"})
    for k, (h, t, variants, body) in ADDONS.items():
        for j, (vt, price) in enumerate(variants):
            rows.append(base | {
                "Handle": h, "Title": t if j == 0 else "", "Body (HTML)": f"<p>{body}</p>" if j == 0 else "", "Vendor": "Michigan Gift Store" if j == 0 else "",
                "Type": "Add-on" if j == 0 else "", "Tags": "add-on" if j == 0 else "", "Published": "TRUE" if j == 0 else "",
                "Option1 Name": ("Title" if vt == "Default Title" else "Upgrade") if j == 0 else "", "Option1 Value": vt,
                "Variant SKU": f"MGS-{k.upper()}-{j+1}", "Variant Grams": 100, "Variant Inventory Policy": "continue",
                "Variant Fulfillment Service": "manual", "Variant Price": f"{price:.2f}", "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
                "Variant Weight Unit": "g", "Status": "draft" if j == 0 else ""})
    with open(os.path.join(HERE, "products.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)
    return len(rows)


def write_preview():
    data = dict(items=items_json(), shelves=SHELVES, places=PLACES,
                boxes={k: dict(handle=h, n=t, p=p * 100, who=w, pitch=pi, blob=bl, items=it,
                               contents=[line(x) for x in it]) for k, (h, t, p, w, pi, bl, it) in BOXES.items()},
                sizes={k: dict(v, p=v['price'] * 100) for k, v in SIZES.items()},
                finder=[dict(id=a, l=b, box=c, why=d) for a, b, c, d in FINDER], cards=[dict(id=a, n=b) for a, b in CARDS])
    os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
    json.dump(data, open(os.path.join(ROOT, 'preview', 'catalog.json'), 'w'), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    write_liquid_data()
    n = write_csv()
    write_preview()
    print(f"{len(ITEMS)} items, {len(BOXES)} boxes, {len(SIZES)} builder sizes -> mgs-data.liquid, products.csv ({n} rows), preview/catalog.json")
