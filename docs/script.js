import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';

const draw = SVG().addTo("#star");
draw.viewbox("-50 -50 100 110");

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const pane = new Pane({
  title: 'Code star factory',
  expanded: true,
});

const default_params = {
    color: 0,
    star_type: 0,
    ion_probability: 0.33,
    particle_density: 0.8,
    arc_probability: 0.3,
    animate: true,
    dark: false,
    seed: 1337,
    name: "<YOUR NAME>",
    tagline: true,
};

const params = { ...default_params };

let rng = mulberry32(params.seed);
let animateRng = mulberry32(params.seed);

let random = 0;

let name = "";

const color_names = {
    "Red": 0,
    "Orange": 1,
    "Yellow": 2,
    "Green": 3,
    "Blue": 4,
    "Purple": 5,
    "Pink": 6,
    "Random": -1
};

const f1 = pane.addFolder({
  title: "Star type",
});

f1.addBinding(
    params, "color",
    {
        label: "Star color",
        options: color_names
    }
);

const star_names = {
    "Pulsar": 0,
    "Quasar": 1,
    "Supernova": 2,
    "Neutron star": 3,
    "Supergiant": 4,
    "Random": -1
};

f1.addBinding(
    params, "star_type",
    {
        label: "Star type",
        options: star_names
    }
);

const randomize1 = f1.addButton({
  title: 'Randomize type'
});

const f2 = pane.addFolder({
  title: "Composition",
});

f2.addBinding(
    params, "ion_probability",
    { min: 0, max: 1.0, step: 0.01, label: "Ion probability" }
);

f2.addBinding(
    params, "particle_density",
    { min: 0, max: 1.0, step: 0.01, label: "Density" }
);

f2.addBinding(
    params, "arc_probability",
    { min: 0, max: 1.0, step: 0.01, label: "Arc probability" }
);

const reset = f2.addButton({
  title: 'Reset probabilities'
});

const randomize2 = f2.addButton({
  title: 'Randomize probabilities'
});

const f3 = pane.addFolder({
  title: "Miscellaneous",
});

f3.addBinding(params, "animate", { label: "Animate" });

f3.addBinding(params, "dark", { label: "Dark mode" });

const nameParam = f3.addBinding(params, "name", { label: "Name" });

const seedParam = f3.addBinding(params, "seed", {
    label: "Seed",
    format: (v) => v.toFixed(0),
});

const regenerate = f3.addButton({
  title: 'Randomize seed'
});

const download = f3.addButton({
  title: 'Download SVG'
});

const downloadParams = f3.addButton({
    title: "Export parameters",
});

reset.on("click", () => {
    params.ion_probability = 0.33;
    params.particle_density = 0.8;
    params.arc_probability = 0.3;
    pane.refresh();
    draw.clear();
    codestar();
});

randomize1.on("click", () => {
    params.color = Math.floor(Math.random() * colors.length);
    params.star_type = Math.floor(Math.random() * setups.length);
    pane.refresh();
    draw.clear();
    codestar();
});

randomize2.on("click", () => {
    params.ion_probability = Math.random();
    params.particle_density = Math.random();
    params.arc_probability = Math.random();
    pane.refresh();
    draw.clear();
    codestar();
});

regenerate.on("click", () => {
    draw.clear();
    params.seed = Math.floor(rng() * 100000);
    seedParam.refresh();
    codestar();
});

function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}

download.on("click", () => {
    const svg = draw.svg().replace("&nbsp;", "&#160;");
    downloadBlob(svg, name + ".svg", "image/svg+xml;charset=utf-8");
});

downloadParams.on("click", () => {
    const json = JSON.stringify(params);
    console.log(json);
    downloadBlob(json, params.name + ".json", "text/json;charset=utf-8");
});

// Adapted from https://lospec.com/palette-list/japanese-woodblock
const colors = [
    "#b03a48",
    "#d4804d",
    "#d6b74b",
    "#3e7a4c",
    "#3266A3",
    "#915394",
    "#d980a0"
];

const bgcolor = "#f1e7da";

const c = () => params.color < 0 ? colors[random] : colors[params.color];

const b = () => params.dark ? bgcolor : "black";

function crosshairs() {
    draw.line(-100, 0, 100, 0).stroke({ color: "black", width: 0.1 });
    draw.line(0, -100, 0, 100).stroke({ color: "black", width: 0.1 });

    const radii = [6, 16, 30, 40];
    for (let i = 0; i < radii.length; ++i) {
        draw.circle(radii[i] * 2)
            .center(0, 0)
            .fill("transparent")
            .stroke({ color: c, width: 0.1 });
    }
}

function asterisk(x, y) {
    const g = draw.group();
    g.rect(2, 8).fill(c()).center(x, y).rotate(90);
    g.rect(2, 8).fill(c()).center(x, y).rotate(30);
    g.rect(2, 8).fill(c()).center(x, y).rotate(-30);
    return g;
}

function beam(offset, length, branch, black) {
    const angle = -60 + 60 * branch;
    let dasharray = `0 ${offset + 1}`;
    let current_length = 0;

    let dash = 2 * Math.floor(rng() * 2);
    let gap = 4 + 2 * Math.floor(rng() * 2);

    while (current_length + dash + 2 < length) {
        dasharray += ` ${dash + 0.000001} ${gap}`;
        current_length += dash + 2 + gap + 2;
        dash = 2 * Math.floor(rng() * 2);
        gap = 4 + 2 * Math.floor(rng() * 2);
    }
    dasharray += " 0.000001 1000";
    // also randomly choose round or square
    return draw
        .line(0, 0, 100, 0)
        .stroke({ color: black ? b() : c(), width: 2 })
        .rotate(angle, 0, 0)
        .attr({
            "stroke-dasharray": dasharray.trim(),
            "stroke-linecap": rng() < params.ion_probability ? "round" : "square"
        });
}

const slot_buckets = [
    [8, 24],
    [12, 36],
    [16, 48],
    [18, 60],
    [26, 72],
    [30, 84],
    [34, 96],
    [36, 108]
];

function get_slots(radius) {
    for (const [r, s] of slot_buckets) {
        if (radius <= r) return s;
    }
    return 1000;
}

function circle(radius, black) {
    const diameter = radius * 2 - 2;
    const circum = Math.PI * diameter;

    const slots = get_slots(radius);
    const slack = (circum - slots * 2) / slots;
    const section = 4 + 2 * slack;
    const linecap = rng() < params.ion_probability ? "round" : "butt";

    let dasharray = "";
    let cant_skip = false;
    for (let i = 0; i < slots / 2; ++i) {
        if (rng() < (1 - params.arc_probability) || cant_skip) {
            if (linecap == "butt") {
                const dash = rng() < params.particle_density ? 2 : 0;
                const gap = section - dash;
                dasharray += ` ${dash} ${gap}`;
            } else {
                const dash = rng() < params.particle_density;
                if (dash || i == 0) {
                    dasharray += ` 0.000001 ${section}`;
                } else {
                    const previous = dasharray.trim().split(" ").map(Number);
                    previous[previous.length - 1] += section;
                    dasharray = previous.join(" ");
                }
            }
        } else {
            dasharray += ` ${section} 0`;
            cant_skip = true; //
        }
        cant_skip = false;
    }

    return draw
        .circle(diameter)
        .center(0, 0)
        .fill("transparent")
        .attr({ "style": "fill:none"})
        .stroke({
            color: black ? b() : c(),
            width: 2
        })
        .attr({
            "stroke-dasharray": dasharray.trim(),
            "stroke-dashoffset": linecap == "butt" ? 1 : 0,
            "stroke-linecap": linecap
        });
}

function logo(tagline) {
    const g = draw.group();
    g.text("c  de.star")
        .font({ family: "Righteous", size: 14 })
        .fill({ color: b() })
        .center(0, 44);
    if (tagline) {
        g.text("a sopra steria team")
            .font({ family: "Conduit ITC Medium", size: 4.3 })
            .fill({ color: b() })
            .center(16, 52);        
    }
    return g;
}

function animate(g) {
    if (!params.animate) return g;
    g.animate({
        duration: 1000,
        delay: 1000 + Math.floor(animateRng() * 20) * 1000,
        swing: true,
        times: Infinity,
        when: "now",
        wait: 1000 + Math.floor(animateRng() * 20) * 1000
    }).rotate(60 * (animateRng() < 0.5 ? -1 : 1));
}

function sign(r, text) {
    const g = draw.group();
    g
        .path(
            `M 0, 0
             m -${r}, 0
             a ${r},${r} 0 1,0 ${r*2},0
             a ${r},${r} 0 1,0 -${r*2},0`
        )
        .fill("transparent")
        .attr({ "style": "fill:none"})
        //.stroke({ color: c(), width: 0.2 })
        .text(text)
        .font({
            family: "Conduit ITC Medium",
            size: 2
        })
        .fill(c())
        .attr({
            "side": "left",
            "startOffset": "2"
        });
    return g;
}

const setups = [
    { beams: [[6, 10], [30, 10]], circles: [20, 24, 28] },
    { beams: [[32, 10]], circles: [10, 14, 18, 26, 30] },
    { beams: [[6, 16]], circles: [26, 30, 34] },
    { beams: [[18, 32]], circles: [8, 12, 16] },
    { beams: [[30, 10]], circles: [8, 12, 16, 20, 24, 28] }
];

function codestar() {
    rng = mulberry32(params.seed);

    if (params.dark) {    
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
    
    random = Math.floor(rng() * colors.length);
    let random2 = Math.floor(rng() * setups.length);

    const { beams, circles } = params.star_type < 0 ? setups[random2] : setups[params.star_type];
    
    const black_beam = Math.floor(rng() * 6);

    for (let i = 0; i < 6; ++i) {
        for (let j = 0; j < beams.length; ++j) {
            beam(beams[j][0], beams[j][1], i, i == black_beam);
        }
    }

    const black_circle = Math.floor(rng() * circles.length);

    for (let i = 0; i < circles.length; ++i) {
        animate(circle(circles[i], i == black_circle));
    }

    asterisk(0, 0);
    logo(params.tagline);
    // crosshairs();
    animate(asterisk(-20.3, 45.5));
    
    const r = circles[circles.length - 1] + 3;
    
    const color_index = params.color < 0 ? random : params.color
    const color_name = Object.keys(color_names).find(k => color_names[k] === color_index);
    
    const star_name = Object.keys(star_names).find(k => star_names[k] === (params.star_type < 0 ? random2 : params.star_type));
    
    const text1 = `${color_name.toLowerCase()}-${star_name.toLowerCase().replace(" ", "-")}`;
    
    const text2 = `i${Math.floor(params.ion_probability * 100)}-d${Math.floor(params.particle_density * 100)}-a${Math.floor(params.arc_probability * 100)}`;

    const text3 = "cs-t2xh-2024";
    
    name = text1 + "-" + text2;
    
    const a = ((random * random2) % 6) * 60;
    
    if (star_name === "Neutron star") {
        sign(r, text1).rotate(a);
        sign(r + 0.5, text2).rotate(-120 + a);
        sign(r + 0.5, text3).rotate(-240 + a);
    } else if (star_name === "Supernova") {
        sign(r, text1 + "-" + text2 + "-" + text3).rotate(a);
    } else {
        sign(r, text1 + "-" + text2).rotate(a);
        sign(r + 0.5, text3).rotate(180 + a);
    }
}

codestar();

pane.on('change', (ev) => {
    draw.clear();
    codestar();
});
