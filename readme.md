# HKU-HKSLLEX - Hong Kong Sign Language Database

**The database is in BETA!** Open a new issue or browse current ones at [issues](https://github.com/ldlhku/HKU-HKSLLEX/issues).

HKSLLEX is a collection of Hong Kong Sign Language data as part of the documentation effort of the Knowledge Exchange project ["The Sound of Silence - A Journey through Deaf Culture in Hong Kong"](https://linguistics.hku.hk/ldlhku/hong-kong-sign-language). This repository is designed to store and organize a comprehensive database of Hong Kong Sign Language (HKSL) words, their English translations, and associated research data. It aims to provide a valuable resource for linguists, researchers, and educators studying HKSL, as well as individuals interested in learning the language.

This repository is also available on [OSF.io](https://osf.io/t4x56).

## **How to access the data?**

GitHub version only: you can browse the signs online [using the online sign browser](https://ldlhku.github.io/HKU-HKSLLEX/sign_browser_github.html). Search across all entry data, combine schema-based filters with nested AND/OR groups, select handshape glyphs and ARTO codes, and sort or paginate results.

After downloading the database, open "sign_browser.html" for a user-friendly view of the database. A local web server (for example, `python -m http.server`) allows the browser to load the JSON files automatically. If you open the HTML directly, choose both `data.json` and `doc/data.schema.json` when prompted. Download the `video/webp/`, `video/small/`, and `doc/cuhkcslds_handshapes/` folders to use videos and glyph selection.

Alternatively, you can download the entire database and access the data files. Videos are available in the video/ folder.

## **Documentation**

The database structure is defined in "doc/data.schema.json". A human-readable version is available at "doc/data.schema.json.html".

## **Data Format**

The data is stored in JSON format. A flattened CSV file (in UTF8-BOM) is also provided for easy access.

The HKSL videos are provided in two formats. Available on OSF are the videos in reduced MP4 and WebP formats (due to storage limitations); they can be found in "video/small" and "video/webp" respectively. Full, high-definition videos are available on request.

## **How to cite**

Thompson, A. L., Van Hoey, T., Chik, A. W. C., & Do, Y. (2025). Iconic hand gestures from ideophones exhibit stability and emergent phonological properties: An iterated learning study. _Cognitive Linguistics_, 36(2), 227–259. [https://doi.org/10.1515/cog-2024-0033](https://doi.org/10.1515/cog-2024-0033).
