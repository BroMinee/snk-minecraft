"use strict";
exports.id = 309;
exports.ids = [309];
exports.modules = {

/***/ 4309:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  createSvg: () => (/* binding */ createSvg)
});

// EXTERNAL MODULE: ../types/grid.ts
var types_grid = __webpack_require__(105);
// EXTERNAL MODULE: ../types/snake.ts
var types_snake = __webpack_require__(777);
;// CONCATENATED MODULE: ../svg-creator/xml-utils.ts
const h = (element, attributes) => `<${element} ${toAttribute(attributes)}/>`;
const toAttribute = (o) => Object.entries(o)
    .filter(([, value]) => value !== null)
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ");

;// CONCATENATED MODULE: ../svg-creator/css-utils.ts
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

;// CONCATENATED MODULE: ../svg-creator/snake.ts



const lerp = (k, a, b) => (1 - k) * a + k * b;
const createSnake = (chain, { sizeCell, sizeDot }, duration) => {
    const snakeN = chain[0] ? (0,types_snake/* getSnakeLength */.T$)(chain[0]) : 0;
    const snakeParts = Array.from({ length: snakeN }, () => []);
    for (const snake of chain) {
        const cells = (0,types_snake/* snakeToCells */.HU)(snake);
        for (let i = cells.length; i--;)
            snakeParts[i].push(cells[i]);
    }
    const svgElements = snakeParts.map((_, i, { length }) => {
        // compute snake part size
        const dMin = sizeDot * 0.8;
        const dMax = sizeCell * 0.9;
        const iMax = Math.min(4, length);
        const u = (1 - Math.min(i, iMax) / iMax) ** 2;
        const s = lerp(u, dMin, dMax);
        const m = (sizeCell - s) / 2;
        const r = Math.min(4.5, (4 * s) / sizeDot);
        return h("rect", {
            class: `s s${i}`,
            x: m.toFixed(1),
            y: m.toFixed(1),
            width: s.toFixed(1),
            height: s.toFixed(1),
            rx: r.toFixed(1),
            ry: r.toFixed(1),
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
                createAnimation(animationName, keyframes),
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

;// CONCATENATED MODULE: ../svg-creator/grid.ts


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
            styles.push(createAnimation(animationName, [
                { t: t - 0.0001, style: `fill:var(--c${color})` },
                { t: t + 0.0001, style: `fill:url(#cobblestone)` },
                { t: 1, style: `fill:url(#cobblestone)` },
            ]), `.c.${id}{
          fill: var(--c${color});
          animation-name: ${animationName}
        }`);
        }
        svgElements.push(h("rect", {
            class: ["c", id].filter(Boolean).join(" "),
            x: x * sizeCell,
            y: y * sizeCell,
        }));
    }
    return { svgElements, styles };
};

;// CONCATENATED MODULE: ../svg-creator/index.ts






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
        h("svg", {
            viewBox,
            width,
            height,
            xmlns: "http://www.w3.org/2000/svg",
        }).replace("/>", ">"),
        "<desc>",
        "Generated with https://github.com/Platane/snk",
        "</desc>",
        "<defs>",
        generateStevePattern(),
        generateStonePattern(),
        generateCobbleStonePattern(),
        generateLapisPattern(),
        generateRedstonePattern(),
        generateGoldPattern(),
        generateDiamondPattern(),
        "</defs>",
        "<style>",
        optimizeCss(style),
        "</style>",
        ...elements.map((e) => e.svgElements).flat(),
        "</svg>",
    ].join("");
    return optimizeSvg(svg);
};
const optimizeCss = (css) => minifyCss(css);
const optimizeSvg = (svg) => svg;
const generateStevePattern = () => {
    return "<pattern id=\"steve\" viewBox=\"0,0,30,30\" width=\"100%\" height=\"100%\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+PHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj48dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPjwvcmRmOkRlc2NyaXB0aW9uPjwvcmRmOlJERj48L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9J3cnPz4slJgLAAACtUlEQVRIS+2WPW/UQBCGn5m1z2cISIg2AgmBIlHyWYCgDSUNNUKiSEPPL6CHIh2i5g8ADQWCAoEokaIgBCihS3MkOTnnnaHwne/OdxeQ4EjDK01he3afnZ13bcvN6+edA5A2b/wr/Qf/Mx0YWAauFozgPRRr5vwVGUqUFO/XWoMTL7h96waJF80xf0WlZDx5+oxSMhjdasVIvCD17lwi8WJsNw+sx9ryLq3+imRO/aXvocQLBjx58ehebS61PVTm8wY1F0xbtbl0rAdzggKo+JiHDqzH8vLhXQcwAj3JMNHKc54i8Qh4Cq6I7pDKFird5hwAmOf0/DjuObiCFqA/cC0QV4SS1AuUCKPgQg6xvHIfJK/AcYHlSytQHgOUTL+xcuc0mW40mQAUtsjq408UtliNT7Z4/nYVkk61EHZ4vvqAzHdh9Di5KHAY9CiuCwB07STduEQ3nqGwRdwOD0kNuecUdqLO79pJEECPQlgAyTFJ6nwF0IanZPzyjzXNsnXFwQ18B6wDcRsccv1KHtbIwzpp+I5rj1KyqeESScNGnZ/r14poHcS2wbuolzW47jGSUNDCRBGvzIUNzeXa4+2HV8Bw8LgSLp+7hniYMBco6iUt9pA+fHicvCTzXXLbpu0d2mzR1i+0wzrtZI00bALlRKWDgJI0bNb5bf1Cmy1y2ya3Dpnv1tBx8BykPumfgWaCHcVIhz30lOBKKzI1givuw3wjxWZPP9LjhoyUN+8/EkmBauKlxVMkcbrny+CsbXwmSvWhCfS4cuEsSq+ZCvtVbKLERsVJlIlKB5FEGas4kvbfgtM1+8mc9dtgE4hB2AtMjRgEm96FqZrZ41IyXr9b6x8VEIewj0tNIAp4H554wdWLSzP/4X5ZsUg1kwuUOlnpIEodQn9HvwS7ew0fXDc1em80dz/9BEOciZlLH9d7AAAAAElFTkSuQmCC\"/>" +
        "</pattern>";
};
const generateStonePattern = () => {
    return "<pattern id=\"stone\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAZElEQVR42jWNsQ0AMQjEGJcB3HsEr/xSkncBOgkfUyXIguoo4mEXGdkFFvBdlGmpwKCAWIWOeYFladCK4n2BXZZn6vR3dsXRfLnKWfFoXmtUrX81AiboaZ9u4I1G8KdqPICl6AdyLn2NfcJFIAAAAABJRU5ErkJggg==\"/>" +
        "</pattern>";
};
const generateCobbleStonePattern = () => {
    return "<pattern id=\"cobblestone\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEW1tbWmpqaIh4hubW1hYWFSUlLm8qFQAAAAcUlEQVR42gVAARGDMAz8MAMjh4CSLwIWIgDSIGAD/1p2iPk5pTfFOW3QLR3nGrrGQxSLTL1wp2TJ3PF6W/yaOjSV9eEB2y3a4omQPSerG4f6biMXkP0a8X2DMdpytQkuIWuY49CuziJmclhoIcsjUvgH41gVHD61kt4AAAAASUVORK5CYII=\"/>" +
        "</pattern>";
};
const generateLapisPattern = () => {
    return "<pattern id=\"lapis\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAKlBMVEWioqJplfSPj49/f390dHREb9xoaGhcXFwYVb0gWYsQRKwWRI0QNL0QNJzXKVyZAAAAmUlEQVR42mNQNjJxdnMxUmIwTi9zUjYrN2Ew6exOL3E6bcygrKDlHWTM5MLgbOJeolyuYsxgZFax2GyOmxODc01gtHKgkjGDVwCDepqBkzKDqoByVsVu8xIGA+bkrNborDSG5LQlbkeFXCczGO+9bMSgrBjMYMKgm7Y1jCeIQckksDnwgAMzg4lz6wYDZhdnBmNjBWZjY2MlAIucJW0/DfyqAAAAAElFTkSuQmCC\"/>" +
        "</pattern>";
};
const generateRedstonePattern = () => {
    return "<pattern id=\"redstone\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAKlBMVEX/iYm/k5OTjIz9Xl5/f390dHRoaGhpXFz3HBz/AADKBwfGBASWBgaXAwM5vTG5AAAAj0lEQVR42g3LMRLBUBQF0FtSJmwgf346hQWo3tyXwmhk3kuMUUo0SqQ3NEZnCRqFDShswFgUpz8IQa1yEjQji0ahbdW5kaBuv62rw5af21v3hJSvfspHCWOW5CpEffjnuiMWkyij5/2M2YkhDnpDrM1bmycOFpuODAJdXa676bFBkHHqkpdQyyIZAki6ROUPkAQnR+iE5aoAAAAASUVORK5CYII=\"/>" +
        "</pattern>";
};
const generateGoldPattern = () => {
    return "<pattern id=\"gold\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAHlBMVEX//7X87kvrnQ6ioqKPj49/f3+ccCB0dHRoaGhcXFxcSQIKAAAAjklEQVR42hXLzQ2CMBgG4JcNjLpA0QTPIGEAWmWAfrZeS/g5C03hjlIWILqt+twfcO7s4IhAttKkFwXli3Ue1wpSLKa5mwZWr6zlYQqp2SYakh5Wxtvyv5zvDql7VChMXnJ6/jpLz+LzFpiSqx/r0wzyk3iFQQtVR7eO7TJcWJBbk/VQ8Z4o4UeQTJ0Uir7gZysnxZjc/QAAAABJRU5ErkJggg==\"/>" +
        "</pattern>";
};
const generateDiamondPattern = () => {
    return "<pattern id=\"diamond\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
        "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAHlBMVEXV//Z359GNrbGioqIe0NaPj49/f390dHQjlphnZ2fHnuD/AAAAiElEQVR42gVAMQrCMBR93sChg45WmgsI4lwQM4qShK5C3sdRoT9kLTi42SEtva3AR9GcogO1OC+LQpbzc84bwvlmHHyToMzFaCCi/Layyj3StbLGkujKvl5u8YCx9XmlDHiY6WWH+xGTXkrdzQlkdGH8eEg3hXVlA9zuq6e2IeTtfDRJQbIn6f6qxS+NaJn2aQAAAABJRU5ErkJggg==\"/>" +
        "</pattern>";
};
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


/***/ })

};
;