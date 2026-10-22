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

### Reconciling JSON and CSV

Run `python data_consolidate.py` to compare entries by `HKU_HKSLLEX_ID.id`. The script displays every differing field, then lets you choose JSON or CSV per conflicting row, one source for all conflicts, or overwrite an input file. By default, it writes only corrections for conflicting rows: choosing JSON creates `data_consolidated.csv`, while choosing CSV creates `data_consolidated.json`. If per-row choices go both ways, it creates both files. Existing output files are never overwritten.

Use `--prefer json` or `--prefer csv` to choose one source for every conflict without prompting. Use `--json`, `--csv`, or `--output` to specify input paths or the output filename stem.

To overwrite an input file interactively, choose `[o]verwrite an input file`, then select JSON or CSV as the target. A warning appears before modification, and confirmation requires typing `OVERWRITE data.json` or `OVERWRITE data.csv`. Back up the target file first. For non-interactive use, `--overwrite json` replaces conflicting JSON entries with CSV values; `--overwrite csv` replaces conflicting CSV entries with JSON values.

The HKSL videos are provided in two formats. Available on OSF are the videos in reduced MP4 and WebP formats (due to storage limitations); they can be found in "video/small" and "video/webp" respectively. Full, high-definition videos are available on request.

## **How to cite**

Thompson, A.L., Chik, A. W. C., Ngai, M., Chen, R., Ng, J., & Do, Y. (2026). Iconicity and semantic transparency in Hong Kong Sign Language: Evidence from ratings and three guessing paradigms. _Language and Cognition_, _18_, Article e21. https://doi.org/10.1017/langcog.2026.10070
