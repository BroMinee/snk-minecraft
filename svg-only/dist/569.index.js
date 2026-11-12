"use strict";
exports.id = 569;
exports.ids = [569];
exports.modules = {

/***/ 6569:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createTextSvg: () => (/* binding */ createTextSvg)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8490);
/* harmony import */ var _xml_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8871);
/* harmony import */ var _css_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5973);
/* harmony import */ var _pattern_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(868);




// 5-wide x 7-tall pixel font glyphs
const font = {
    B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
    r: [".....", ".....", "#.##.", "##..#", "#....", "#....", "#...."],
    o: [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
    M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
    i: ["..#..", ".....", ".##..", "..#..", "..#..", "..#..", ".###."],
    n: [".....", ".....", "#.##.", "##..#", "#...#", "#...#", "#...#"],
    e: [".....", ".....", ".###.", "#...#", "#####", "#....", ".###."],
};
const getTextPixels = (text) => {
    const pixels = [];
    let offsetX = 0;
    for (const ch of text) {
        const glyph = font[ch];
        if (!glyph) {
            offsetX += 3;
            continue;
        }
        for (let row = 0; row < glyph.length; row++)
            for (let col = 0; col < glyph[row].length; col++)
                if (glyph[row][col] === "#")
                    pixels.push({ x: offsetX + col, y: row });
        offsetX += 6;
    }
    return pixels;
};
const getColoredCells = (grid) => {
    const cells = [];
    for (let x = 0; x < grid.width; x++)
        for (let y = 0; y < grid.height; y++) {
            const c = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__/* .getColor */ .oU)(grid, x, y);
            if (!(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__/* .isEmpty */ .Im)(c))
                cells.push({ x, y, color: c });
        }
    return cells;
};
const assignCellsToTargets = (coloredCells, textPixels, gridWidth) => {
    const textMaxX = Math.max(0, ...textPixels.map((p) => p.x));
    const textOffsetX = Math.max(0, Math.floor((gridWidth - textMaxX - 1) / 2));
    const centeredTargets = textPixels.map((p) => ({ x: p.x + textOffsetX, y: p.y }));
    const sorted = [...coloredCells].sort((a, b) => a.x * 100 + a.y - (b.x * 100 + b.y));
    const sortedTargets = centeredTargets.map((t, i) => ({ ...t, i })).sort((a, b) => a.x * 100 + a.y - (b.x * 100 + b.y));
    const assignments = [];
    const usedCells = new Set();
    for (const target of sortedTargets) {
        let bestIdx = -1;
        let bestDist = Infinity;
        for (let i = 0; i < sorted.length; i++) {
            if (usedCells.has(i))
                continue;
            const dx = sorted[i].x - target.x;
            const dy = sorted[i].y - target.y;
            const dist = dx * dx + dy * dy;
            if (dist < bestDist) {
                bestDist = dist;
                bestIdx = i;
            }
        }
        if (bestIdx >= 0) {
            usedCells.add(bestIdx);
            assignments.push({
                from: { x: sorted[bestIdx].x, y: sorted[bestIdx].y },
                to: { x: target.x, y: target.y },
                color: sorted[bestIdx].color,
                targetIndex: target.i,
            });
        }
    }
    const extras = [];
    for (let i = 0; i < sorted.length; i++)
        if (!usedCells.has(i))
            extras.push(sorted[i]);
    const assignedTargetIndices = new Set(assignments.map((a) => a.targetIndex));
    const ghosts = [];
    for (let i = 0; i < centeredTargets.length; i++)
        if (!assignedTargetIndices.has(i))
            ghosts.push(centeredTargets[i]);
    return { assignments, extras, ghosts };
};
const mostCommonColor = (colors) => {
    const counts = {};
    for (const c of colors)
        counts[c] = (counts[c] ?? 0) + 1;
    let best = colors[0];
    let bestCount = 0;
    for (const key of Object.keys(counts)) {
        const color = Number(key);
        if (counts[color] > bestCount) {
            bestCount = counts[color];
            best = color;
        }
    }
    return best;
};
const oreNames = {
    1: "lapis_ore",
    2: "redstone_ore",
    3: "gold_ore",
    4: "diamond_ore",
};
const getOreGroups = (assignments, ghosts, ghostColor, contributionCounts) => {
    const colorCounts = {};
    for (const a of assignments) {
        const cc = contributionCounts?.[`${a.from.x},${a.from.y}`] ?? 1;
        colorCounts[a.color] = (colorCounts[a.color] ?? 0) + cc;
    }
    if (ghosts.length > 0)
        colorCounts[ghostColor] = (colorCounts[ghostColor] ?? 0) + ghosts.length;
    const groups = [];
    for (const c of [1, 2, 3, 4]) {
        if (colorCounts[c] && colorCounts[c] > 0 && oreNames[c]) {
            groups.push({ color: c, oreName: oreNames[c], count: colorCounts[c] });
        }
    }
    return groups;
};
const createTextSvg = (grid, _cells, text, drawOptions, options) => {
    const sizeCell = drawOptions.sizeCell;
    const holdDuration = options?.holdDuration ?? 1000;
    const moveDuration = options?.moveDuration ?? 2000;
    const variant = options?.variant ?? "normal";
    const isDeepslate = variant === "deepslate";
    const dateFrom = options?.dateFrom ?? "2025-01-01";
    const dateTo = options?.dateTo ?? "2025-12-31";
    const fmtDate = (d) => {
        const [y, m, day] = d.split("-");
        return `${day} ${m} ${y}`;
    };
    const dateFromFmt = fmtDate(dateFrom);
    const dateToFmt = fmtDate(dateTo);
    const textPixels = getTextPixels(text);
    const coloredCells = getColoredCells(grid);
    const { assignments, extras, ghosts } = assignCellsToTargets(coloredCells, textPixels, grid.width);
    const ghostColor = assignments.length > 0
        ? mostCommonColor(assignments.map((a) => a.color))
        : 1;
    const oreGroups = getOreGroups(assignments, ghosts, ghostColor, options?.contributionCounts);
    const textHoldDuration = 1000;
    const steveWalkDuration = 1000;
    const cmdDuration = 2000;
    const commandBlockX = grid.width - 2;
    const commandBlockY = grid.height - 1;
    // p1: hold grid, p2: move to text, p3: hold text, p4: steve walks,
    // p5: commands, p6: hold mined (steve+cb disappear at end), p7: move back
    const p1End = holdDuration;
    const p2End = p1End + moveDuration;
    const p3End = p2End + textHoldDuration;
    const p4End = p3End + steveWalkDuration;
    const commandsStart = p4End;
    const totalCommandDuration = oreGroups.length * cmdDuration;
    const p5End = commandsStart + totalCommandDuration;
    const p6End = p5End + holdDuration;
    const p7End = p6End + moveDuration;
    const totalDuration = p7End;
    const tFrac = (ms) => ms / totalDuration;
    const pct = (frac) => parseFloat((frac * 100).toFixed(3)).toString() + "%";
    const cmdConvertTimes = [];
    for (let gi = 0; gi < oreGroups.length; gi++) {
        const cmdStart = commandsStart + gi * cmdDuration;
        const convertT = cmdStart + cmdDuration * 0.4;
        const outputT = cmdStart + cmdDuration * 0.5;
        const cmdEndT = cmdStart + cmdDuration;
        cmdConvertTimes.push({
            color: oreGroups[gi].color,
            convertT,
            outputT,
            cmdEndT,
        });
    }
    const colorConvertT = {};
    for (const ct of cmdConvertTimes) {
        colorConvertT[ct.color] = tFrac(ct.convertT);
    }
    const width = (grid.width + 2) * sizeCell;
    const chatLineCount = oreGroups.length * 2;
    const chatExtraRows = Math.max(5, Math.ceil(chatLineCount * 0.7) + 3);
    const height = (grid.height + chatExtraRows) * sizeCell;
    const chatAreaY = grid.height * sizeCell + sizeCell;
    const svgElements = [];
    const styles = [];
    svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", { x: 0, y: 0, width: grid.width * sizeCell, height: grid.height * sizeCell, fill: "var(--ce)", style: "shape-rendering:crispEdges" }));
    styles.push(`.c{shape-rendering:geometricPrecision;width:${drawOptions.sizeDot}px;height:${drawOptions.sizeDot}px;}`);
    for (let i = 0; i < assignments.length; i++) {
        const { from, to, color } = assignments[i];
        const id = `m${i.toString(36)}`;
        const fromX = from.x * sizeCell;
        const fromY = from.y * sizeCell;
        const toX = to.x * sizeCell;
        const toY = to.y * sizeCell;
        const convertT = colorConvertT[color];
        styles.push(`@keyframes ${id}{` +
            `${pct(0)}{transform:translate(${fromX}px,${fromY}px)}` +
            `${pct(tFrac(p1End))}{transform:translate(${fromX}px,${fromY}px)}` +
            `${pct(tFrac(p2End))}{transform:translate(${toX}px,${toY}px)}` +
            `${pct(tFrac(p6End))}{transform:translate(${toX}px,${toY}px)}` +
            `${pct(tFrac(p7End))}{transform:translate(${fromX}px,${fromY}px)}` +
            `${pct(1)}{transform:translate(${fromX}px,${fromY}px)}` +
            `}`);
        const fillId = `f${i.toString(36)}`;
        styles.push(`@keyframes ${fillId}{` +
            `${pct(0)}{fill:var(--c${color})}` +
            `${pct(convertT)}{fill:var(--c${color})}` +
            `${pct(convertT + 0.0001)}{fill:url(#cobblestone)}` +
            `${pct(tFrac(p6End))}{fill:url(#cobblestone)}` +
            `${pct(tFrac(p6End) + 0.0001)}{fill:var(--c${color})}` +
            `${pct(1)}{fill:var(--c${color})}` +
            `}`);
        styles.push(`.m.${id}{fill:var(--c${color});transform:translate(${fromX}px,${fromY}px);animation:${id} ${totalDuration}ms ease-in-out infinite,${fillId} ${totalDuration}ms linear infinite;}`);
        svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", { class: `m ${id}`, x: 0, y: 0, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));
    }
    for (let i = 0; i < extras.length; i++) {
        const { x, y, color } = extras[i];
        const id = `e${i.toString(36)}`;
        styles.push(`@keyframes ${id}{${pct(0)}{opacity:1}${pct(tFrac(p1End))}{opacity:1}${pct(tFrac(p2End))}{opacity:0}${pct(tFrac(p6End))}{opacity:0}${pct(tFrac(p7End))}{opacity:1}${pct(1)}{opacity:1}}`);
        styles.push(`.e.${id}{fill:var(--c${color});animation:${id} ${totalDuration}ms ease-in-out infinite;}`);
        svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", { class: `e ${id}`, x: x * sizeCell, y: y * sizeCell, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));
    }
    for (let i = 0; i < ghosts.length; i++) {
        const { x, y } = ghosts[i];
        const id = `g${i.toString(36)}`;
        const convertT = colorConvertT[ghostColor];
        styles.push(`@keyframes ${id}{${pct(0)}{opacity:0}${pct(tFrac(p1End))}{opacity:0}${pct(tFrac(p2End))}{opacity:1}${pct(tFrac(p6End))}{opacity:1}${pct(tFrac(p7End))}{opacity:0}${pct(1)}{opacity:0}}`);
        const fillId = `gf${i.toString(36)}`;
        styles.push(`@keyframes ${fillId}{${pct(0)}{fill:var(--c${ghostColor})}${pct(convertT)}{fill:var(--c${ghostColor})}${pct(convertT + 0.0001)}{fill:url(#cobblestone)}${pct(1)}{fill:url(#cobblestone)}}`);
        styles.push(`.g.${id}{fill:var(--c${ghostColor});opacity:0;animation:${id} ${totalDuration}ms ease-in-out infinite,${fillId} ${totalDuration}ms linear infinite;}`);
        svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", { class: `g ${id}`, x: x * sizeCell, y: y * sizeCell, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));
    }
    const cbX = commandBlockX * sizeCell;
    const cbY = commandBlockY * sizeCell;
    const cbId = "cb";
    styles.push(`@keyframes ${cbId}{${pct(0)}{opacity:0}${pct(tFrac(p4End) - 0.001)}{opacity:0}${pct(tFrac(p4End))}{opacity:1}${pct(tFrac(p6End))}{opacity:1}${pct(tFrac(p6End) + 0.001)}{opacity:0}${pct(1)}{opacity:0}}`);
    styles.push(`.${cbId}{opacity:0;fill:url(#command_block);shape-rendering:geometricPrecision;animation:${cbId} ${totalDuration}ms linear infinite;}`);
    svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", { class: cbId, x: cbX, y: cbY, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));
    const steveStartX = (grid.width - 1) * sizeCell;
    const steveStartY = 0;
    const steveEndX = (commandBlockX + 1) * sizeCell;
    const steveEndY = commandBlockY * sizeCell;
    const steveKf = [];
    steveKf.push(`${pct(0)}{opacity:0;transform:translate(${steveStartX}px,${steveStartY}px)}`);
    steveKf.push(`${pct(tFrac(p3End) - 0.001)}{opacity:0;transform:translate(${steveStartX}px,${steveStartY}px)}`);
    steveKf.push(`${pct(tFrac(p3End))}{opacity:1;transform:translate(${steveStartX}px,${steveStartY}px)}`);
    steveKf.push(`${pct(tFrac(p4End))}{opacity:1;transform:translate(${steveEndX}px,${steveEndY}px)}`);
    steveKf.push(`${pct(tFrac(p6End) - 0.001)}{opacity:1;transform:translate(${steveEndX}px,${steveEndY}px)}`);
    steveKf.push(`${pct(tFrac(p6End))}{opacity:0;transform:translate(${steveEndX}px,${steveEndY}px)}`);
    steveKf.push(`${pct(1)}{opacity:0;transform:translate(${steveEndX}px,${steveEndY}px)}`);
    styles.push(`@keyframes steve{${steveKf.join("")}}`);
    styles.push(`.steve{fill:var(--cs);opacity:0;shape-rendering:geometricPrecision;animation:steve ${totalDuration}ms linear infinite;}`);
    svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", { class: "steve", x: 0, y: 0, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));
    const chatFontSize = Math.max(7, Math.floor(sizeCell * 0.55));
    const chatLineHeight = chatFontSize + 3;
    const chatX = 4;
    styles.push(`.chat{font-family:"Courier New",monospace;font-size:${chatFontSize}px;fill:#fff;opacity:0;}`);
    styles.push(`.chat-bg{fill:rgba(0,0,0,0.6);opacity:0;}`);
    const chatLines = [];
    for (let gi = 0; gi < oreGroups.length; gi++) {
        const { oreName, count } = oreGroups[gi];
        const ct = cmdConvertTimes[gi];
        const cmdStartT = tFrac(commandsStart + gi * cmdDuration);
        const outputT = tFrac(ct.outputT);
        const cmdText = `> /fill ${dateFromFmt} ${dateToFmt} cobblestone replace #minecraft:${oreName} destroy`;
        const outputText = `Successfully filled ${count} commit(s)`;
        chatLines.push({ text: cmdText, appearT: cmdStartT });
        chatLines.push({ text: outputText, appearT: outputT, color: "#55ff55" });
    }
    const chatDisappearT = tFrac(p6End);
    if (chatLines.length > 0) {
        const maxTextLen = Math.max(...chatLines.map((l) => l.text.length));
        const bgWidth = maxTextLen * chatFontSize * 0.6 + 8;
        const bgHeight = chatLines.length * chatLineHeight + 6;
        const bgAppearT = chatLines[0].appearT;
        styles.push(`@keyframes chbg{${pct(0)}{opacity:0}${pct(bgAppearT - 0.001)}{opacity:0}${pct(bgAppearT)}{opacity:1}${pct(chatDisappearT)}{opacity:1}${pct(chatDisappearT + 0.001)}{opacity:0}${pct(1)}{opacity:0}}`);
        styles.push(`.chat-bg.chbg{animation:chbg ${totalDuration}ms linear infinite;}`);
        svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", {
            class: "chat-bg chbg",
            x: chatX - 4,
            y: chatAreaY - chatFontSize - 2,
            width: bgWidth,
            height: bgHeight,
            rx: 2,
        }));
    }
    for (let li = 0; li < chatLines.length; li++) {
        const { text: lineText, appearT, color } = chatLines[li];
        const lineY = chatAreaY + li * chatLineHeight;
        const id = `cl${li}`;
        styles.push(`@keyframes ${id}{${pct(0)}{opacity:0}${pct(appearT - 0.001)}{opacity:0}${pct(appearT)}{opacity:1}${pct(chatDisappearT)}{opacity:1}${pct(chatDisappearT + 0.001)}{opacity:0}${pct(1)}{opacity:0}}`);
        const fillStyle = color ? `fill:${color};` : "";
        styles.push(`.chat.${id}{${fillStyle}animation:${id} ${totalDuration}ms linear infinite;}`);
        svgElements.push(`<text class="chat ${id}" x="${chatX}" y="${lineY}">${escXml(lineText)}</text>`);
    }
    const viewBox = [
        -sizeCell,
        -sizeCell * 2,
        width,
        height,
    ].join(" ");
    const colorVarCss = generateColorVar(drawOptions);
    const svg = [
        (0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("svg", {
            viewBox,
            width,
            height,
            xmlns: "http://www.w3.org/2000/svg",
        }).replace("/>", ">"),
        "<desc>Generated with https://github.com/Platane/snk</desc>",
        "<defs>",
        (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateStevePattern */ .NU)(sizeCell),
        isDeepslate ? (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateDeepslatePattern */ .xA)(sizeCell) : (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateStonePattern */ .xH)(sizeCell),
        isDeepslate ? (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateCobbledDeepslatePattern */ .Gz)(sizeCell) : (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateCobbleStonePattern */ .O5)(sizeCell),
        isDeepslate ? (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateDeepslateLapisPattern */ .s$)(sizeCell) : (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateLapisPattern */ .zY)(sizeCell),
        isDeepslate ? (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateDeepslateRedstonePattern */ .bz)(sizeCell) : (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateRedstonePattern */ .gD)(sizeCell),
        isDeepslate ? (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateDeepslateGoldPattern */ .ln)(sizeCell) : (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateGoldPattern */ .eh)(sizeCell),
        isDeepslate ? (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateDeepslateDiamondPattern */ .DG)(sizeCell) : (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateDiamondPattern */ .OO)(sizeCell),
        (0,_pattern_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateCommandBlockPattern */ .S9)(sizeCell),
        "</defs>",
        "<style>",
        (0,_css_utils__WEBPACK_IMPORTED_MODULE_3__/* .minifyCss */ ._)(colorVarCss + styles.join("\n")),
        "</style>",
        ...svgElements,
        "</svg>",
    ].join("");
    return svg;
};
const escXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const generateColorVar = (drawOptions) => `:root{--cb:${drawOptions.colorDotBorder};--cs:${drawOptions.colorSnake};--ce:${drawOptions.colorEmpty};${Object.entries(drawOptions.colorDots).map(([i, color]) => `--c${i}:${color};`).join("")}}` +
    (drawOptions.dark
        ? `@media(prefers-color-scheme:dark){:root{--cb:${drawOptions.dark.colorDotBorder || drawOptions.colorDotBorder};--cs:${drawOptions.dark.colorSnake || drawOptions.colorSnake};--ce:${drawOptions.dark.colorEmpty};${Object.entries(drawOptions.dark.colorDots).map(([i, color]) => `--c${i}:${color};`).join("")}}}`
        : "");


/***/ }),

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