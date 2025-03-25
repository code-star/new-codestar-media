import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';

const draw = SVG().addTo("#back");
draw.viewbox("-50 -50 100 125");

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function sumAsciiValues(str) {
    return [...str].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

const default_params = { color: 0, name: "tenchi", dark: false };

const params = { ...default_params };

const rng = mulberry32(sumAsciiValues(params.name));

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

const c = colors[params.color];
const fg = params.dark ? bgcolor : "black";

function asterisk(x, y, f, fill) {
    f = f === undefined ? 1 : f;
    const g = draw.group();
    g.rect(f * 2, f * 8).fill(fill ? fill : c).center(x, y).rotate(90);
    g.rect(f * 2, f * 8).fill(fill ? fill : c).center(x, y).rotate(30);
    g.rect(f * 2, f * 8).fill(fill ? fill : c).center(x, y).rotate(-30);
    return g;
}

function logo() {
    const g = draw.group();
    g.text("c  de.star")
        .font({ family: "Righteous", size: 19 })
        .fill({ color: fg })
        .center(0, -42);
    // g.text("a sopra steria team")
    //     .font({ family: "Conduit ITC Medium", size: 8 })
    //     .fill({ color: fg })
    //     .center(14.3, -31);
    return g;
}

function dot(g, x, y, w, options) {
    options = { fill: fg, accent: false, round: false, ...options };
    const { fill, accent, round } = options;
    const stroke = w * 0.3
    if (!round) {
        g.rect(w + 0.03, w + 0.03).fill(accent ? c : fill).center(w * x, w * y);
    } else {
        g
            .circle(fill === "transparent" ? w - stroke: w)
            .fill(accent ? c : fill)
            .stroke({ color: accent ? c : fg, width: fill === "transparent" ? stroke: 0 })
            .center(w * x, w * y);
    }
}

function binarize(s) {
    // Max total length: 16 characters
    const lower = "thisis" + params.name;
    const result = [];
    
    for (let char of lower) {
        if (char === " ") {
            result.push([false, false, false, false, false]);
            continue;
        }

        const charCode = char.charCodeAt(0);
        const binaryString = (charCode >>> 0).toString(2).padStart(8, '0');
        const lastFiveBits = binaryString.slice(3);
        
        const binChar = [];
        for (let bit of lastFiveBits) {
            binChar.push(bit === "1");
        }
        result.push(binChar);
    }
    
    return result;
}


function dots() {
    const bin = binarize(params.name).flat()
    const g = draw.group();
    const w = 1.8;
    for (let i = 0; i < bin.length; ++i) {
        const accent = rng() < 0.1;
        const x = Math.floor(i / 3);
        const y = i % 3;
        const offset = y === 1 ? 1 : 0;
        dot(g, x * 2 + offset, y * 2, w, {
            fill: bin[i] ? fg : "transparent",
            accent,
            round: i % 5 === 0,
        });
    }

    let prevEmpty = false;
    let prevRed = false;
    for (let i = 0; i < 40; ++i) {
        if (rng() < 0.6 && !prevRed) {
            prevRed = prevEmpty && rng () < 0.3;
            dot(g, 6 * 2, i + 6, w, {
                accent: prevRed,
            })
            prevEmpty = false;
        } else {
            prevRed = false;
            prevEmpty = true;
        }
    }
    g.x(-50 + w).y(-20);
}

const caveatText = `
warning: may cause excessive productivity, decreased tolerance for spaghetti code, occasional bouts of imposter
syndrome, heightened appreciation for elegant algorithms, increased propensity for late-night coding sessions. in case of
syntax errors or unexpected behavior, consult your nearest large language model. not suitable for waterfall developers. do
not deploy without proper version control. may contain traces of monads. please code responsibly. clinically unit-tested.
`.trim()

const spacing = [0.025, 0, 0, 0.007];

function caveat() {
    const g = draw.group();
    const fs = 1.8;
    const lines = caveatText.split("\n")
    for (let i = 0; i < lines.length; ++i) {
        const space = i === 0 ? 2.5 : 0
        g.text(lines[i])
            .font({ family: "Conduit", size: fs })
            .fill({ color: fg })
            .x(-50 + space).y(-50 + i * fs * 1.1)
            .attr({ "letter-spacing": spacing[i] });
    }
    g
        .transform({ rotate: 90, origin: {x: -50, y: -50}})
        .x(-7)
        .y(-70.1);
    asterisk(-31, -6.2, 1 / 5, fg);
}

function prescription() {
    draw.text(function (add) {
        add.tspan("one ");
        add.tspan("byte").attr({ "font-weight": "bold "});
        add.tspan(" daily,");
    })
        .font({ family: "Conduit", size: 12.5 })
        .fill(fg)
        .x(-19)
        .y(-8.5)

    draw.text(function (add) {
        add.tspan("no ");
        add.tspan("side effects!").attr({ "font-weight": "bold "});
    })
        .font({ family: "Conduit", size: 10 })
        .fill(c)
        .x(-19)
        .y(3.5)
    asterisk(41.5, 7.7, 0.4, fg)
}

function sopra() {
    const g = draw.group();
    g.text("sopra steria")
        .font({ family: "Righteous", size: 12 })
        .fill({ color: fg })
        .center(15, 65);
    return g;
}

function codestar() {
    logo();
    asterisk(-27.5, -40.1, 1.26);
    dots();
    caveat();
    prescription();
    sopra();
}

codestar();
