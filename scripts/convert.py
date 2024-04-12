import pathlib
import cairosvg
import xml.etree.ElementTree as ET


def get_background_color(svg_file):
    tree = ET.parse(svg_file)
    root = tree.getroot()
    style = root.get("style")
    if style:
        styles = style.split(";")
        for s in styles:
            if "background-color" in s:
                return s.split(":")[-1].strip()
    return None


def to_png(input_file, output_file, width):
    background_color = get_background_color(input_file)
    cairosvg.svg2png(url=str(input_file), write_to=str(output_file), output_width=width, background_color=background_color)


def convert(input_dir, output_dir):
    input_path = pathlib.Path(input_dir)
    output_path = pathlib.Path(output_dir)

    if not output_path.exists():
        output_path.mkdir(parents=True)

    for svg in input_path.glob("**/*.svg"):
        relative_path = svg.relative_to(input_path)

        output_subdir = output_path / relative_path.parent
        output_subdir.mkdir(parents=True, exist_ok=True)

        png = output_subdir / (relative_path.stem + ".png")
        to_png(svg, png, 512)

        png_2x = output_subdir / (relative_path.stem + "@2x.png")
        to_png(svg, png_2x, 1024)


if __name__ == "__main__":
    input_dir = "logos/svg"
    output_dir = "logos/png"
    convert(input_dir, output_dir)
