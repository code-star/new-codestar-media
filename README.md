![](./logos/png/dark/tagline/opaque/logo_orange_dark_tagline@2x.png#gh-dark-mode-only)
![](./logos/png/light/tagline/opaque/logo_orange_light_tagline@2x.png#gh-light-mode-only)

---

# New Codestar Logo Media Repo

## Installing

To install the Python 3 dependencies, run:

```sh
pip install -r scripts/requirements.txt
```

## Regenerating

To re-generate all the logos (if the master logo was modified), run:

```sh
rm -rf logos
python scripts/process.py
python scripts/convert.py
```
