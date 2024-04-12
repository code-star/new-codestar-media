from itertools import product
from xml.etree import ElementTree as ET
from pathlib import Path
import copy

palette = [
    ("red", "#b03a48"),
    ("orange", "#d4804d"),
    ("yellow", "#d6b74b"),
    ("green", "#3e7a4c"),
    ("blue", "#3266A3"),
    ("purple", "#915394"),
    ("pink", "#d980a0"),
]

bg_color = "#f1e7da"


def process(input_svg, output_folder):
    show_tagline = (True, False)
    show_background = (True, False)
    themes = ("light", "dark")
    ET.register_namespace("","http://www.w3.org/2000/svg")

    for (color_name, fill), show_tagline, show_background, theme in product(palette, show_tagline, show_background, themes):
        tree = ET.parse(input_svg)
        root = tree.getroot()

        star = root.find(".//*[@id='star']")
        if star is not None:
            star.set("fill", fill)

        tagline = root.find(".//*[@id='tagline']")
        if tagline is not None:
            if not show_tagline:
                root.remove(tagline)
                root.set("viewBox", "-50 -50 100 17.5")
                root.set("height", "175")

        if show_background:
            root.set("style", f"background-color: {bg_color if theme == 'light' else '#000000'};")
            if show_tagline:
                root.set("viewBox", "-60 -60 120 45")
                root.set("width", "1200")
                root.set("height", "450")
            else:
                root.set("viewBox", "-60 -60 120 37.5")
                root.set("width", "1200")
                root.set("height", "375")

        if theme == "dark":
            for element_id in ["codestar", "tagline"]:
                element = root.find(f".//*[@id='{element_id}']")
                if element is not None:
                    element.set("fill", bg_color)

        output_dir = (
            output_folder
            / theme
            / ["bare", "tagline"][show_tagline]
            / ["transparent", "opaque"][show_background]
        )
        output_dir.mkdir(parents=True, exist_ok=True)

        output_filename = f"logo_{color_name}_{theme}"
        if not show_background:
            output_filename += "_transparent"
        if show_tagline:
            output_filename += "_tagline"
        output_filename += ".svg"

        output_path = output_dir / output_filename
        tree.write(output_path)


if __name__ == "__main__":
    input_svg = "logo.svg"
    output_folder = Path("logos") / "svg"
    process(input_svg, output_folder)
