#!/usr/bin/env python3

import click
import shutil
from pathlib import Path
import json
import tempfile
import asyncio
import subprocess
from pyppeteer import launch


chrome_binary_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
inkscape_path = "/Applications/Inkscape.app/Contents/MacOS/inkscape"


def post_process_svg(svg_path):
    cmd = [
        inkscape_path,
        "--export-plain-svg",
        "--export-text-to-path",
        "--export-type=svg",
        f"--export-filename={svg_path}",
        str(svg_path)
    ]

    subprocess.run(cmd, capture_output=True, text=True, check=True)


def export_svg(svg_content, output_path):
    cleaned_svg = svg_content.replace('&nbsp;', '&#xA0;')
    cleaned_svg = cleaned_svg.replace('"Conduit"', '"ConduitITCStd"')

    svg_path = output_path.with_suffix('.svg')
    svg_path.write_text(cleaned_svg, encoding='utf-8')
    post_process_svg(svg_path)
    print(f"SVG saved to {svg_path}")


async def render_div_as_png(html_path, output_path, div_id, ratio):
    browser = await launch(headless=True, args=['--disable-web-security'])
    page = await browser.newPage()

    await page.setViewport({"width": 2000, "height": int(2000 * ratio), "deviceScaleFactor": 2})
    await page.goto(f'file://{html_path}', waitUntil='networkidle2')
    await page.waitForSelector(f'#{div_id}')
    await page.evaluate('''() => {
        const elements = document.querySelectorAll('.tp-dfwv');
        elements.forEach(element => element.style.display = 'none');
        document.body.style.background = 'transparent';
    }''')

    element = await page.querySelector(f'#{div_id}')

    if element:
        # Save PNG
        await element.screenshot({
            'path': output_path,
            'omitBackground': True,
        })
        print(f"Rendered {div_id} saved to {output_path}")

        # Save SVG
        svg_element = await element.querySelector('svg')
        if svg_element:
            svg_content = await page.evaluate('(el) => el.outerHTML', svg_element)
            export_svg(svg_content, output_path)

            if "front" in str(output_path):
                svg_content = await page.evaluate('''(el) => {
                    const nodesToRemove = el.querySelectorAll('[font-size="2"]');
                    nodesToRemove.forEach(node => node.remove());
                    return el.outerHTML;
                }
                ''', svg_element)
                export_svg(svg_content, output_path.with_name(f"{output_path.stem}_zipper{output_path.suffix}"))

        else:
            print(f"No <svg> found inside #{div_id}")

    else:
        print(f"Element #{div_id} not found on page {html_path}")

    await browser.close()


def render_div(html_file, output_png, div_id, ratio):
    asyncio.get_event_loop().run_until_complete(render_div_as_png(html_file, output_png, div_id, ratio))


def render_params(json_path):
    do_render_params(json_path, False)
    do_render_params(json_path, True)


def do_render_params(json_path, is_dark=False):
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_dir = Path(temp_dir)
        docs_src = Path("./docs")
        docs_dst = temp_dir / "docs"

        shutil.copytree(docs_src, docs_dst)

        scripts_file = docs_dst / "script.js"
        back_file = docs_dst / "back.js"

        with open(json_path, "r") as f:
            params = json.load(f)

        params["animate"] = False
        params["dark"] = is_dark
        params["tagline"] = True

        js_content = scripts_file.read_text()
        new_params_line = f"const params = {json.dumps(params)};"
        js_content = js_content.replace("const params = { ...default_params };", new_params_line)
        scripts_file.write_text(js_content)

        params["tagline"] = False

        js_content = back_file.read_text()
        new_params_line = f"const params = {json.dumps(params)};"
        js_content = js_content.replace("const params = { ...default_params };", new_params_line)
        back_file.write_text(js_content)

        renders_dir = Path("./renders")
        renders_dir.mkdir(exist_ok=True)

        dark_suffix = "_dark" if is_dark else ""

        output_png = renders_dir / (params["name"] + "_front" + dark_suffix + ".png")
        output_png_2 = renders_dir / (params["name"] + "_back" + dark_suffix + ".png")
        # TODO: Also copy a correctly colored version of the back design

        render_div(docs_dst / "index.html", output_png, div_id="star", ratio=1.1)
        render_div(docs_dst / "back.html", output_png_2, div_id="back", ratio=1.15)


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
