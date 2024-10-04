#!/usr/bin/env python3

import click
import shutil
from pathlib import Path
import json
import tempfile
import asyncio
from pyppeteer import launch


chrome_binary_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


async def render_div_as_png(html_path, output_path, div_id):
    browser = await launch(headless=True, args=['--disable-web-security'])
    page = await browser.newPage()

    await page.setViewport({"width": 2000, "height": int(2000 * 1.1), "deviceScaleFactor": 2})
    await page.goto(f'file://{html_path}', waitUntil='networkidle2')
    await page.waitForSelector(f'#{div_id}')
    await page.reload(waitUntil='networkidle2')  # Need a refresh because the codestar text sometimes is not aligned
    await page.evaluate('''() => {
        const elements = document.querySelectorAll('.tp-dfwv');
        elements.forEach(element => element.style.display = 'none');
        document.body.style.background = 'transparent';
    }''')

    element = await page.querySelector(f'#{div_id}')

    if element:
        await element.screenshot({
            'path': output_path,
            'omitBackground': True,
        })
        print(f"Rendered {div_id} saved to {output_path}")
    else:
        print(f"Element #{div_id} not found on page {html_path}")

    await browser.close()

def render_div(html_file, output_png, div_id):
    asyncio.get_event_loop().run_until_complete(render_div_as_png(html_file, output_png, div_id))



def render_params(json_path):
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_dir = Path(temp_dir)
        docs_src = Path("./docs")
        docs_dst = temp_dir / "docs"

        shutil.copytree(docs_src, docs_dst)

        scripts_file = docs_dst / "script.js"

        with open(json_path, "r") as f:
            params = json.load(f)

        params["animate"] = False
        params["dark"] = False

        js_content = scripts_file.read_text()
        new_params_line = f"const params = {json.dumps(params)};"
        js_content = js_content.replace("const params = { ...default_params };", new_params_line)
        scripts_file.write_text(js_content)

        renders_dir = Path("./renders")
        renders_dir.mkdir(exist_ok=True)

        output_png = renders_dir / (params["name"] + "_front.png")
        # TODO: Also copy a correctly colored version of the back design

        render_div(docs_dst / "index.html", output_png, div_id="star")


def process_path(path):
    path = Path(path)

    if path.is_dir():
        for sub_path in path.rglob("*.json"):
            render_params(sub_path)
    elif path.is_file() and path.suffix == ".json":
        render_params(path)
    else:
        print(f"Skipping {path}, not a JSON file or directory")

@click.command()
@click.argument("paths", nargs=-1, type=click.Path(exists=True))
def process(paths):
    for path in paths:
        process_path(path)

if __name__ == "__main__":
    process()