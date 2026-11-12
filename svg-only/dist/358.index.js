"use strict";
exports.id = 358;
exports.ids = [358];
exports.modules = {

/***/ 5973:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   J: () => (/* binding */ createAnimation),
/* harmony export */   _: () => (/* binding */ minifyCss)
/* harmony export */ });
const percent = (x) => parseFloat((x * 100).toFixed(2)).toString() + "%";
const mergeKeyFrames = (keyframes) => {
    const s = new Map();
    for (const { t, style } of keyframes) {
        s.set(style, [...(s.get(style) ?? []), t]);
    }
    return Array.from(s.entries())
        .map(([style, ts]) => ({ style, ts }))
        .sort((a, b) => a.ts[0] - b.ts[0]);
};
/**
 * generate the keyframe animation from a list of keyframe
 */
const createAnimation = (name, keyframes) => `@keyframes ${name}{` +
    mergeKeyFrames(keyframes)
        .map(({ style, ts }) => ts.map(percent).join(",") + `{${style}}`)
        .join("") +
    "}";
/**
 * remove white spaces
 */
const minifyCss = (css) => css
    .replace(/\s+/g, " ")
    .replace(/.\s+[,;:{}()]/g, (a) => a.replace(/\s+/g, ""))
    .replace(/[,;:{}()]\s+./g, (a) => a.replace(/\s+/g, ""))
    .replace(/.\s+[,;:{}()]/g, (a) => a.replace(/\s+/g, ""))
    .replace(/[,;:{}()]\s+./g, (a) => a.replace(/\s+/g, ""))
    .replace(/\;\s*\}/g, "}")
    .trim();


/***/ }),

/***/ 7358:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  createSvg: () => (/* binding */ createSvg)
});

// EXTERNAL MODULE: ./packages/types/grid.ts
var types_grid = __webpack_require__(8490);
// EXTERNAL MODULE: ./packages/types/snake.ts
var types_snake = __webpack_require__(3388);
// EXTERNAL MODULE: ./packages/svg-creator/xml-utils.ts
var xml_utils = __webpack_require__(8871);
// EXTERNAL MODULE: ./packages/svg-creator/css-utils.ts
var css_utils = __webpack_require__(5973);
;// CONCATENATED MODULE: ./packages/svg-creator/snake.ts



const createSnake = (chain, { sizeCell }, duration) => {
    const snakeN = chain[0] ? (0,types_snake/* getSnakeLength */.T$)(chain[0]) : 0;
    const snakeParts = Array.from({ length: snakeN }, () => []);
    for (const snake of chain) {
        const cells = (0,types_snake/* snakeToCells */.HU)(snake);
        for (let i = cells.length; i--;)
            snakeParts[i].push(cells[i]);
    }
    const svgElements = snakeParts.map((_, i, {}) => {
        return (0,xml_utils.h)("rect", {
            class: `s s${i}`,
            x: 0,
            y: 0,
            width: 16,
            height: 16,
        });
    });
    const transform = ({ x, y }) => `transform:translate(${x * sizeCell}px,${y * sizeCell}px)`;
    const styles = [
        `.s{ 
      shape-rendering: geometricPrecision;
      fill: var(--cs);
      animation: none linear ${duration}ms infinite
    }`,
        ...snakeParts.map((positions, i) => {
            const id = `s${i}`;
            const animationName = id;
            const keyframes = removeInterpolatedPositions(positions.map((tr, i, { length }) => ({ ...tr, t: i / length }))).map(({ t, ...p }) => ({ t, style: transform(p) }));
            return [
                (0,css_utils/* createAnimation */.J)(animationName, keyframes),
                `.s.${id}{
          ${transform(positions[0])};
          animation-name: ${animationName}
        }`,
            ];
        }),
    ].flat();
    return { svgElements, styles };
};
const removeInterpolatedPositions = (arr) => arr.filter((u, i, arr) => {
    if (i - 1 < 0 || i + 1 >= arr.length)
        return true;
    const a = arr[i - 1];
    const b = arr[i + 1];
    const ex = (a.x + b.x) / 2;
    const ey = (a.y + b.y) / 2;
    // return true;
    return !(Math.abs(ex - u.x) < 0.01 && Math.abs(ey - u.y) < 0.01);
});

;// CONCATENATED MODULE: ./packages/svg-creator/grid.ts


const createGrid = (cells, { sizeDot, sizeCell }, duration) => {
    const svgElements = [];
    const styles = [
        `.c{
      shape-rendering: geometricPrecision;
      fill: var(--ce);
      stroke-width: 1px;
      stroke: var(--cb);
      animation: none ${duration}ms linear infinite;
      width: ${sizeDot}px;
      height: ${sizeDot}px;
    }`,
    ];
    let i = 0;
    for (const { x, y, color, t } of cells) {
        const id = t && "c" + (i++).toString(36);
        if (t !== null && id) {
            const animationName = id;
            styles.push((0,css_utils/* createAnimation */.J)(animationName, [
                { t: t - 0.0001, style: `fill:var(--c${color})` },
                { t: t + 0.0001, style: `fill:url(#cobblestone)` },
                { t: 1, style: `fill:url(#cobblestone)` },
            ]), `.c.${id}{
          fill: var(--c${color});
          animation-name: ${animationName}
        }`);
        }
        svgElements.push((0,xml_utils.h)("rect", {
            class: ["c", id].filter(Boolean).join(" "),
            x: x * sizeCell,
            y: y * sizeCell,
        }));
    }
    return { svgElements, styles };
};

// EXTERNAL MODULE: ./packages/svg-creator/pattern-utils.ts
var pattern_utils = __webpack_require__(868);
;// CONCATENATED MODULE: ./packages/svg-creator/index.ts







const getCellsFromGrid = ({ width, height }) => Array.from({ length: width }, (_, x) => Array.from({ length: height }, (_, y) => ({ x, y }))).flat();
const createLivingCells = (grid0, chain, cells) => {
    const livingCells = (cells ?? getCellsFromGrid(grid0)).map(({ x, y }) => ({
        x,
        y,
        t: null,
        color: (0,types_grid/* getColor */.oU)(grid0, x, y),
    }));
    const grid = (0,types_grid/* copyGrid */.mi)(grid0);
    for (let i = 0; i < chain.length; i++) {
        const snake = chain[i];
        const x = (0,types_snake/* getHeadX */.tN)(snake);
        const y = (0,types_snake/* getHeadY */.Ap)(snake);
        if ((0,types_grid/* isInside */.FK)(grid, x, y) && !(0,types_grid/* isEmpty */.Im)((0,types_grid/* getColor */.oU)(grid, x, y))) {
            (0,types_grid/* setColorEmpty */.l$)(grid, x, y);
            const cell = livingCells.find((c) => c.x === x && c.y === y);
            cell.t = i / chain.length;
        }
    }
    return livingCells;
};
const createSvg = (grid, cells, chain, drawOptions, animationOptions) => {
    const width = (grid.width + 2) * drawOptions.sizeCell;
    const height = (grid.height + 5) * drawOptions.sizeCell;
    const duration = animationOptions.frameDuration * chain.length;
    const livingCells = createLivingCells(grid, chain, cells);
    const elements = [
        createGrid(livingCells, drawOptions, duration),
        createSnake(chain, drawOptions, duration),
    ];
    const viewBox = [
        -drawOptions.sizeCell,
        -drawOptions.sizeCell * 2,
        width,
        height,
    ].join(" ");
    const style = generateColorVar(drawOptions) +
        elements
            .map((e) => e.styles)
            .flat()
            .join("\n");
    const svg = [
        (0,xml_utils.h)("svg", {
            viewBox,
            width,
            height,
            xmlns: "http://www.w3.org/2000/svg",
        }).replace("/>", ">"),
        "<desc>",
        "Generated with https://github.com/Platane/snk",
        "</desc>",
        "<defs>",
        (0,pattern_utils/* generateStevePattern */.NU)(drawOptions.sizeCell),
        (0,pattern_utils/* generateStonePattern */.xH)(drawOptions.sizeCell),
        (0,pattern_utils/* generateCobbleStonePattern */.O5)(drawOptions.sizeCell),
        (0,pattern_utils/* generateLapisPattern */.zY)(drawOptions.sizeCell),
        (0,pattern_utils/* generateRedstonePattern */.gD)(drawOptions.sizeCell),
        (0,pattern_utils/* generateGoldPattern */.eh)(drawOptions.sizeCell),
        (0,pattern_utils/* generateDiamondPattern */.OO)(drawOptions.sizeCell),
        "</defs>",
        "<style>",
        optimizeCss(style),
        "</style>",
        ...elements.map((e) => e.svgElements).flat(),
        "</svg>",
    ].join("");
    return optimizeSvg(svg);
};
const optimizeCss = (css) => (0,css_utils/* minifyCss */._)(css);
const optimizeSvg = (svg) => svg;
const generateColorVar = (drawOptions) => `
    :root {
    --cb: ${drawOptions.colorDotBorder};
    --cs: ${drawOptions.colorSnake};
    --ce: ${drawOptions.colorEmpty};
    ${Object.entries(drawOptions.colorDots)
    .map(([i, color]) => `--c${i}:${color};`)
    .join("")}
    }
    ` +
    (drawOptions.dark
        ? `
    @media (prefers-color-scheme: dark) {
      :root {
        --cb: ${drawOptions.dark.colorDotBorder || drawOptions.colorDotBorder};
        --cs: ${drawOptions.dark.colorSnake || drawOptions.colorSnake};
        --ce: ${drawOptions.dark.colorEmpty};
        ${Object.entries(drawOptions.dark.colorDots)
            .map(([i, color]) => `--c${i}:${color};`)
            .join("")}
      }
    }
`
        : "");


/***/ }),

/***/ 868:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DG: () => (/* binding */ generateDeepslateDiamondPattern),
/* harmony export */   Gz: () => (/* binding */ generateCobbledDeepslatePattern),
/* harmony export */   NU: () => (/* binding */ generateStevePattern),
/* harmony export */   O5: () => (/* binding */ generateCobbleStonePattern),
/* harmony export */   OO: () => (/* binding */ generateDiamondPattern),
/* harmony export */   S9: () => (/* binding */ generateCommandBlockPattern),
/* harmony export */   bz: () => (/* binding */ generateDeepslateRedstonePattern),
/* harmony export */   eh: () => (/* binding */ generateGoldPattern),
/* harmony export */   gD: () => (/* binding */ generateRedstonePattern),
/* harmony export */   ln: () => (/* binding */ generateDeepslateGoldPattern),
/* harmony export */   s$: () => (/* binding */ generateDeepslateLapisPattern),
/* harmony export */   xA: () => (/* binding */ generateDeepslatePattern),
/* harmony export */   xH: () => (/* binding */ generateStonePattern),
/* harmony export */   zY: () => (/* binding */ generateLapisPattern)
/* harmony export */ });
const generateStevePattern = (sizeCell) => {
    return "<pattern id=\"steve\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIBAMAAAA2IaO4AAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAA9QTFRFYS4UVCgPOhwLAAAAwgAANIS0AgAAAClJREFUeJxjZGD8z8jIKPheEEIICXwQYDS4+J+ZkdGI4T4jo5DhObAYALb1CZkXGM5jAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateStonePattern = (sizeCell) => {
    return "<pattern id=\"stone\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAXklEQVR42gXBMQEAMAwEocqNgNuR8JYLb9uUruCRgLv0dFddBR6bsaF6Ucm2xTNAXddebGur4NVdV1R424xtoMewjW3zTuouUT2wgc2eyhR3XW9TVFR7CsC2PaBsxAdyLn2NNWHIVAAAAABJRU5ErkJggg==\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateCobbleStonePattern = (sizeCell) => {
    return "<pattern id=\"cobblestone\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEW1tbWmpqaIh4hubW1hYWFSUlLm8qFQAAAAcUlEQVR42gVAARGDMAz8MAMjh4CSLwIWIgDSIGAD/1p2iPk5pTfFOW3QLR3nGrrGQxSLTL1wp2TJ3PF6W/yaOjSV9eEB2y3a4omQPSerG4f6biMXkP0a8X2DMdpytQkuIWuY49CuziJmclhoIcsjUvgH41gVHD61kt4AAAAASUVORK5CYII=\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateLapisPattern = (sizeCell) => {
    return "<pattern id=\"lapis\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAKlBMVEV/f3+Pj4+ioqJEb9wWRI1plfQQNL0QNJwgWYsYVb0QRKxcXFxoaGh0dHQtQBNZAAAAh0lEQVR42gXBgQEDIQwDsXMC9CH2/utWQiAS4gRJgGccCTxDIPe7yzOJzgKESi+rBaWEQDITMaMACM994O/EEWFO716itwTkdVVpbCoSqHcJv7lrMROowvjd7uVnY+yX+PRW+gNYvx+oSmg3kCr97NXtOi0k0vvS+1SqgITbq6giCQCoCgCQ/gdhBTDSbWBDAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateRedstonePattern = (sizeCell) => {
    return "<pattern id=\"redstone\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAKlBMVEV/f390dHRoaGiWBgbKBwf3HBz9Xl5pXFyXAwPGBAT/AAD/iYm/k5OTjIyWS9PFAAAAe0lEQVR42gXBgWHDIBAEMN1jTJNw+69bSdtKZBJABJiJkJnMOUkAZNZaM4kkIs96vu/nT06g6ef7+97y7FTQe28jipwzmYScc5D9rtKuZz3vDmujrfv+9mVEMhO59yYwc86BVknWfvY6PLsTrb6/20SblERvQdsCEi3hH9DmA9/D3DCFAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateGoldPattern = (sizeCell) => {
    return "<pattern id=\"gold\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAHlBMVEV/f390dHRoaGiccCDrnQ5cXFz87kv//7WioqKPj48wUnvMAAAAfklEQVR42gXBgQHAQAgCsQN9C/sv3IS2lYQsAQBiwID9EMiu31h6bwZo8Zsd8WZHCPxmb9zuBijeu28lJyqCZm8nEgCSrWyCpB2oZ5tJCwaB9kJa3nsuuEll682sLcB2i2f3uzFoZsUoe5eIzt53jZiNVFD2CpC0W4AGiRYEP65HA2+xOYABAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateCommandBlockPattern = (sizeCell) => {
    return "<pattern id=\"command_block\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAY1BMVEXHfk/Sz9rOy9bNytXFws3XtJ3orWSzsLnPpoufnafOj2bJj2uIrWTOeneRj5nChz7zYFy7bTqsaWfIVFJ3dIBihz6bbDKmYDDNOjZObDKGQ0FvSSukLiuiLiyCJSNUPCRANCAEA8JZAAAAh0lEQVR4nFWO0QrDIAxF0zmJNeAmFMIWhvn/r1wS3Wh9uTlXiQcAoHIFuGSO6ZTFproyuJSsQyMZgots6S4+ZOhMxjdE3K0hBm+cP4hNiLtt7brhPE17/DsSPvCNTzzG9NC0Xhy6PGRHfBnLz4Ok+b3Q38Oaw3l6uA+ZqXMJD/fpPQynB9Mpv8KnC7aHfEXPAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateDiamondPattern = (sizeCell) => {
    return "<pattern id=\"diamond\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAHlBMVEV/f3+Pj4+NrbEjlpge0NaioqLV//Z359FnZ2d0dHTXUAaKAAAAeElEQVR42gXBgQHAIAzDMLvAmvz/8CQEaWlaVKBEFZoUaHIlabMHUBmzZ2RsKdDEoVgAab4N/baptH577xnuAcDEeTOJg++RvSPNtwUszBC695zxPQjlNs6YtAUA1WaPAjXB7rf3HovOnpR37owA7ajg0BYAoAKA/g9mA6MdO18tAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateDeepslateLapisPattern = (sizeCell) => {
    return "<pattern id=\"lapis\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAJ1BMVEVkZGR5eXlEb9wWRI0QRKwYVb1plfQQNJwgWYsQNL0vLzc9PUNRUVF58sNiAAAAgklEQVR42gXBgQHDIBDDQPkJNMHaf97eEVRbQKvY23tb0VsL7Hcvb+/tt1Jq4MmakAS51aYJAJbEdj/A+6kQ+s2ZpXNChWdIEkio4hxbH/Za3EqTKM+eWTy3EHw035w4b4D1+yWYwBnAJj9YM/JNaHvnbOZ8MSkJ7FkxUQgJktiAwh87gQVj47Z97gAAAABJRU5ErkJggg==\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateDeepslateRedstonePattern = (sizeCell) => {
    return "<pattern id=\"redstone\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAMFBMVEVRUVFkZGR5eXmEWVn3HBz9Xl7/iYn/AADGBASXAwPKBweWBgY7LCxNNzcvLzc9PUNRsDaYAAAAiklEQVR42gXBgWHDMAzEQICUk9SS+Ptv2ztKgESFAGQmSRASgpbee2YmmYTgvXvvY5UKE979fp/fn6WEKvx9P98W39VSCt0NSXfAe09i6b0T4K5nn1Dud7/PguzVgJDnszrYTSCZSXcVyrn3FCGhRM5e79qSd6Ek6eejZDKTUKXdmZSgRZUIQynoP2YCBhKdaJ9XAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateDeepslateGoldPattern = (sizeCell) => {
    return "<pattern id=\"gold\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAG1BMVEVRUVFkZGR5eXnrnQ6cZCAvLzf87kv//7U9PUPYRpKtAAAAe0lEQVR42gXBgQHAMAjDMMdAl/8vnoQBKEmgAL1bKYHelcTI7d31dksJ3M5Gdxau0J23iTMWJfPeNyFKMMF5s7R3hdDW0VBmhe7QNYRqaOeJgbvmStCE9nYHJbmrlp353obc7piN856G7rzvRbpjWjTz7FWFEY3CYQLmB506Aw5MTqulAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateDeepslateDiamondPattern = (sizeCell) => {
    return "<pattern id=\"diamond\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAJFBMVEVRUVFkZGR5eXlkioxheXcxQEB359EUj5Ie0NbV//YvLzc9PUMT0xLSAAAAhklEQVR42gXBhwHAQAgDsTPtCd5/30iEAGxJYADftW0ENkYKLXTfeV4aI9KelxGZgjPYzpRCwkQgvkH6pkCE8pvdV+zLM4jOrKzurDPAbNnd3wjb4KoDZt8r3xkhFlyZ3UQgYUUE3fMIIdwd0nyz+0rYNS8l3maWTYQy7XMlSEGEEBwhgfQDXnAETfum3bwAAAAASUVORK5CYII=\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateCobbledDeepslatePattern = (sizeCell) => {
    return "<pattern id=\"cobblestone\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEV6enppaWlaWlpKSk8/P0U1NTnf4I6sAAAAdUlEQVR42gVAQRLCIAzc2j7AIT6AAXpXSO7WkLul4f9f6aCdeqB+Enjwn/TImG4n++jQJVUxdyA0txlXBOIrEgoC27kWYvC0I0sW4FUrSzeE0pLaTCBR5UgV2ab3VRoK23PLwjAtDxI32HsLVX4N+3e/+ojLDSfPGK0cTn8xAAAAAElFTkSuQmCC\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};
const generateDeepslatePattern = (sizeCell) => {
    return "<pattern id=\"stone\" patternUnits=\"userSpaceOnUse\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAD1BMVEVkZGR5eXlRUVE9PUMvLzdi5EnwAAAAYUlEQVR42gXBAQHEIAwEweUUgIM0qYHPoaDgX9PPMDONKqlrR7pg6r1nm1Y5FuKkm0GxIj8ig6nX6dvIHtRJqvxIbnwzsvdB6tonF9RYVT2RH+QG74861yxq/xSDJb0PyR+e6w/hsG/r7QAAAABJRU5ErkJggg==\" width=\"" + sizeCell + "\" height=\"" + sizeCell + "\" style=\"image-rendering:pixelated\"/>" +
        "</pattern>";
};


/***/ }),

/***/ 8871:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h: () => (/* binding */ h)
/* harmony export */ });
/* unused harmony export toAttribute */
const h = (element, attributes) => `<${element} ${toAttribute(attributes)}/>`;
const toAttribute = (o) => Object.entries(o)
    .filter(([, value]) => value !== null)
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ");


/***/ })

};
;