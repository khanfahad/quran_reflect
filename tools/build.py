"""Build site/data.js from the quran-json npm package (Arabic, Tanzil transliteration,
Saheeh International) and tools/content.json (reflections).
Usage: python3 -I tools/build.py <path to quran-json dist/chapters/en dir>"""
import json, sys, os
src = sys.argv[1]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
content = json.load(open(os.path.join(root, "tools/content.json"), encoding="utf-8"))
out = []
for key, c in content.items():
    s, a = map(int, key.split(":"))
    ch = json.load(open(os.path.join(src, f"{s}.json"), encoding="utf-8"))
    v = next(x for x in ch["verses"] if x["id"] == a)
    out.append({"ref": key, "surah": ch["transliteration"], "surahMeaning": ch["translation"],
                "arabic": v["text"], "transliteration": v["transliteration"],
                "translation": v["translation"], **c})
with open(os.path.join(root, "site/data.js"), "w", encoding="utf-8") as f:
    f.write("window.VERSES = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
print(len(out), "verses")
