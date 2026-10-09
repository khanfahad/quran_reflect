# Quran Reflect

A private, static web app for reflecting on 20 Quran verses (Arabic, transliteration, Saheeh International) with guided questions.

- Open `docs/index.html` in a browser, or serve with `python3 -m http.server -d docs`.
- Reflections are saved only in the browser (localStorage).
- Verse text is built by `tools/build.py` from the `quran-json` npm package plus reflections in `tools/content.json`.
