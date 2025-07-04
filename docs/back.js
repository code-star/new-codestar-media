import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';

const draw = SVG().addTo("#back");
draw.viewbox("-50 -50 100 115");

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

const default_params = { color: 0, name: "tenchi", dark: false, tagline: false };

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

function logo(tagline) {
    const g = draw.group();
    g.text("c  de.star")
        .font({ family: "Righteous", size: 19 })
        .fill({ color: fg })
        .center(0, -42);
    if (tagline) {
        g.text("a sopra steria team")
            .font({ family: "Conduit ITC Medium", size: 8 })
            .fill({ color: fg })
            .center(14.3, -31);
    }
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


function dots(dx, dy) {
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
    g.x(-50 + w + dx).y(-20 + dy);
}

const caveatText = `
warning: may cause excessive productivity, decreased tolerance for spaghetti code, occasional bouts of imposter
syndrome, heightened appreciation for elegant algorithms, increased propensity for late-night coding sessions. in case of
syntax errors or unexpected behavior, consult your nearest large language model. not suitable for waterfall developers. do
not deploy without proper version control. may contain traces of monads. please code responsibly. clinically unit-tested.
`.trim()

const spacing = [0.025, 0, 0, 0.007];

function caveat(dx, dy) {
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
        .x(-7 + dy)
        .y(-70.1 + dx);
    asterisk(-30.7 + dx, -6.2 + dy, 1 / 5, fg);
}

function prescription(dx, dy) {
    draw.text(function (add) {
        add.tspan("one ").attr({ "white-space": "pre" });
        add.tspan("byte").attr({ "font-weight": "bold"});
        add.tspan(" daily,").attr({ "white-space": "pre" });
    })
        .font({ family: "Conduit", size: 12.5 })
        .fill(fg)
        .x(-19 + dx)
        .y(-8.5 + dy);

    draw.text(function (add) {
        add.tspan("no ").attr({ "white-space": "pre" });
        add.tspan("side effects!").attr({ "font-weight": "bold"});
    })
        .font({ family: "Conduit", size: 10 })
        .fill(c)
        .x(-19 + dx)
        .y(3.5 + dy);
    asterisk(41.5 + dx, 7.7 + dy, 0.4, fg);
}

function poweredBy(x, y) {
    draw.text("powered by")
        .font({ family: "Conduit", size: 4.5 })
        .fill({ color: fg })
        .x(x).y(y);
}

function s2(x, y) {
    draw.svg(`
        <g transform="scale(0.2) translate(${x - 167}, ${y - 172})">
            <path id="path248" d="m 93.93555,3.87305 c -2.05603,-0.034 -3.66537,0.52567 -4.10937,1.98047 -0.9184,3.00608 5.02226,6.23193 7.82226,7.76953 0.6016,0.32864 0.85932,0.12359 0.47852,-0.31641 -1.7696,-2.03647 -4.28638,-6.04679 -0.73438,-8.40039 0.1728,-0.11392 0.38347,-0.24343 0.57227,-0.35351 l 0.0566,-0.0312 -0.0566,-0.01 C 96.56445,4.12766 95.16917,3.89327 93.93555,3.87287 Z m 19.10352,8.90625 c -0.30825,-0.0604 -0.38371,0.1368 -0.0957,0.4668 1.7664,2.03616 4.28762,6.04551 0.73243,8.40039 v -0.002 c -0.1696,0.11392 -0.37636,0.2441 -0.56836,0.35546 l -0.0586,0.0332 0.0586,0.008 c 3.73115,1.02368 7.42435,0.98521 8.13475,-1.34375 0.9184,-3.00608 -5.0191,-6.23126 -7.82225,-7.76758 -0.1496,-0.0822 -0.27811,-0.13025 -0.38086,-0.15039 z" style="fill:${fg};fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.31999999"/>
            <path id="path250" d="m 187.91019,0 c -1.1296,0 -2.045,0.91561 -2.045,2.04297 0,1.12768 0.9154,2.04297 2.045,2.04297 1.1264,0 2.039,-0.91529 2.039,-2.04297 0,-1.12736 -0.9126,-2.04297 -2.039,-2.04297 z m -42.0606,1.92383 v 3.90625 h -3.1426 V 8.4629 h 3.1426 V 16.75 c 0,1.8976 0.3738,5.35743 5.1738,5.35743 1.2032,0 1.974,-0.0829 3.0332,-0.22657 v -2.74414 c 0,0 -1.0936,0.2793 -2.0664,0.2793 -2.5376,0 -3.0918,-1.04072 -3.0918,-3.02344 V 8.4629 h 5.0176 V 5.83008 h -5.0176 V 1.92383 Z M 163.48439,5.5 c -5.0432,0 -8.8184,3.27988 -8.8184,8.38868 v 0.1289 c 0,4.98272 3.7956,8.19922 9.3028,8.19922 2.6464,0 5.1198,-0.66157 7.3886,-2.83789 l -2.2383,-1.96484 c 0,0 -1.919,2.0039 -5.1542,2.0039 -3.0048,0 -5.9171,-1.90322 -6.0547,-4.42578 l 13.9589,-0.0586 c 0.07,-0.63136 0.07,-1.32617 0.07,-1.32617 0,-4.44608 -3.4438,-8.10743 -8.455,-8.10743 z m 36.7402,0.0996 c -3.4464,0 -8.414,2.08513 -8.414,8.22657 0,6.08352 4.4685,8.35742 8.3789,8.35742 3.8976,0 5.8515,-2.16602 5.8515,-2.16602 l 0.1582,2.16211 h 2.8574 V 5.8164 h -2.8515 l -0.1641,2.0293 c 0,0 -1.8964,-2.2461 -5.8164,-2.2461 z m -66.9551,0.0117 c -3.2928,0 -6.8281,1.24571 -6.8281,4.58203 0,2.88864 2.6269,3.7872 6.9629,4.60352 2.896,0.54368 5.5684,0.82025 5.5684,2.38281 0,0.98496 -1.3152,2.24805 -4.6016,2.24805 -2.3328,0 -4.6882,-0.48995 -5.4082,-2.15234 l -2.8086,1.17968 c 1.152,2.56608 4.2076,3.89453 7.75,3.89453 7.0752,0 8.4414,-3.36335 8.4414,-5.27343 0,-3.18112 -3.1658,-4.09437 -6.3242,-4.65821 -3.1424,-0.56128 -6.2324,-0.95301 -6.2324,-2.41797 0,-0.95392 0.9504,-1.79687 3.6992,-1.79687 2.0448,0 4.403,0.47519 5.043,1.92383 l 2.8964,-1.21875 c -1.1072,-2.22624 -4.3886,-3.29688 -8.1582,-3.29688 z m 49.6836,0.1875 c -2.5015,-0.023 -4.3419,0.73427 -5.8203,2.27539 l -0.164,-2.25195 h -2.959 V 22.1699 h 3.123 v -8.47266 c 0,-2.36224 1.9032,-5.35745 6.9336,-5.07617 V 5.85544 c -0.3852,-0.0352 -0.7559,-0.0533 -1.1133,-0.0566 z m 3.3926,0.0137 v 16.33399 h 3.1231 V 5.8125 Z m 14.0098,2.51758 c 3.0272,0 5.6855,1.71672 5.6855,5.4668 0,3.74752 -2.3391,5.62109 -5.6543,5.62109 -1.7376,0 -5.4004,-1.108 -5.4004,-5.55664 0,-4.52 3.654,-5.53125 5.3692,-5.53125 z m -36.8301,0.0859 c 2.7456,0 4.9824,1.85115 4.9824,4.07227 h -10.5469 c 0.1952,-2.2576 2.6237,-4.07227 5.5645,-4.07227 z" style="fill:${fg};fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.31999999"/>
            <path id="path264" d="m 26.56055,5.59766 c -4.176,0 -9.12109,2.08775 -9.12109,8.23047 0,6.08224 4.44909,8.44531 9.12109,8.44531 4.6752,0 9.12305,-2.36307 9.12305,-8.44531 0,-6.14272 -4.94385,-8.23047 -9.12305,-8.23047 z m 19.62109,0.002 c -3.92,0 -5.8164,2.2461 -5.8164,2.2461 l -0.16406,-2.0293 h -2.85157 v 20.76367 h 3.01563 v -6.88281 c 0,0 1.93921,2.48633 5.84961,2.48633 3.9136,0 8.38086,-1.88638 8.38086,-8.35742 0,-6.4688 -4.96767,-8.22657 -8.41407,-8.22657 z m 28.57422,0 c -3.4496,0 -8.41406,2.08513 -8.41406,8.22657 0,6.08352 4.46851,8.35742 8.37891,8.35742 3.8976,0 5.85156,-2.16602 5.85156,-2.16602 l 0.16602,2.16211 h 2.8457 V 5.81646 h -2.85156 l -0.16016,2.0293 c 0,0 -1.89961,-2.2461 -5.81641,-2.2461 z M 7.11719,5.61136 c -3.296,0 -6.83203,1.24571 -6.83203,4.58203 0,2.88864 2.6276,3.7872 6.9668,4.60352 2.896,0.54368 5.5664,0.82025 5.5664,2.38281 0,0.98496 -1.31516,2.24805 -4.60156,2.24805 -2.3328,0 -4.69016,-0.48995 -5.41016,-2.15234 L 0,18.45511 c 1.1488,2.56608 4.2076,3.89453 7.75,3.89453 7.072,0 8.43946,-3.36335 8.43946,-5.27343 0,-3.18112 -3.16512,-4.09437 -6.32032,-4.65821 -3.1456,-0.56128 -6.23437,-0.95301 -6.23437,-2.41797 0,-0.95392 0.94847,-1.79687 3.69726,-1.79687 2.048,0 4.40493,0.47519 5.04493,1.92383 L 15.27735,8.90824 C 14.16695,6.682 10.88679,5.61136 7.11719,5.61136 Z m 58.33789,0.1875 c -2.50215,-0.023 -4.34471,0.73427 -5.82031,2.27539 L 59.47266,5.8223 h -2.96484 v 16.34766 h 3.12695 V 13.6973 c 0,-2.36224 1.90515,-5.35745 6.93555,-5.07617 V 5.8555 C 66.18512,5.8203 65.81253,5.8022 65.45508,5.7989 Z m 9.43164,2.53125 c 3.0272,0 5.68555,1.71672 5.68555,5.4668 0,3.74752 -2.3391,5.62109 -5.6543,5.62109 -1.7408,0 -5.40039,-1.108 -5.40039,-5.55664 0,-4.52 3.65074,-5.53125 5.36914,-5.53125 z m -28.83593,0.002 c 1.71519,0 5.37304,0.67425 5.37304,5.52929 0,4.85376 -3.6667,5.55664 -5.4043,5.55664 -3.31519,0 -5.65429,-1.87357 -5.65429,-5.62109 0,-3.75008 2.65835,-5.46484 5.68555,-5.46484 z m -19.49024,0.0918 c 2.1984,0 5.94531,0.91622 5.94531,5.4375 0,4.44864 -3.37891,5.55664 -5.94531,5.55664 -2.5632,0 -5.94922,-1.108 -5.94922,-5.55664 0,-4.52128 3.75402,-5.4375 5.94922,-5.4375 z" style="fill:${fg};fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.31999999"/>
            <path id="path274" d="m 111.01172,1.56836 c -8.2944,0 -12.99219,2.95313 -12.99219,2.95313 5.5072,1.03616 16.39889,6.57422 19.89646,6.57422 1.36,0 2.0137,-1.32205 2.0137,-2.89453 0,-1.8352 -0.653,-3.83195 -1.8594,-5.01563 -1.1424,-1.1264 -3.84577,-1.61719 -7.05857,-1.61719 z M 93.1543,15.45508 c -1.36,0 -2.01172,1.32273 -2.01172,2.89649 0,1.8352 0.65227,3.83066 1.85547,5.01562 1.1456,1.12512 3.8497,1.61914 7.0625,1.61914 8.2912,0 12.99219,-2.95508 12.99219,-2.95508 -5.5072,-1.03616 -16.40084,-6.57617 -19.89844,-6.57617 z" style="fill:${fg};fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.31999999"/>
        </g>
    `);
}

// function sopra() {
//     const g = draw.group();
//     g.text("sopra steria")
//         .font({ family: "Righteous", size: 12 })
//         .fill({ color: fg })
//         .center(15, 65);
//     return g;
// }

function codestar() {
    logo(params.tagline);
    asterisk(-27.5, -40.1, 1.26);
    dots(0, -10);
    caveat(0, -10);
    prescription(0, -7);
    s2(200, 460);
    poweredBy(29.3, 52.5);
}

codestar();
