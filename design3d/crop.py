import json, sys
from PIL import Image
for v in sys.argv[1:]:
    im = Image.open(f'out/{v}.png'); W, H = im.size
    a = json.load(open(f'out/{v}.anchors.json'))
    x0, y0, x1, y1 = im.getchannel('A').point(lambda p: 255 if p > 8 else 0).getbbox()
    m = 30; x0, y0, x1, y1 = max(0, x0 - m), max(0, y0 - m), min(W, x1 + m), min(H, y1 + m)
    c = im.crop((x0, y0, x1, y1)); w, h = c.size
    c.save(f'../figures/render_{v}.png')
    rel = {k: [round((p[0] * W - x0) / w, 4), round((p[1] * H - y0) / h, 4)] for k, p in a.items()}
    json.dump({'size': [w, h], 'anchors': rel}, open(f'../figures/render_{v}.anchors.json', 'w'), indent=1)
    print(v, w, h, rel)
