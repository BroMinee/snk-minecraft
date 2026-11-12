import type { Color, Grid } from "@snk/types/grid";
import { getColor, isEmpty } from "@snk/types/grid";
import type { Point } from "@snk/types/point";
import { h } from "./xml-utils";
import { minifyCss } from "./css-utils";
import type { DrawOptions } from "./index";
import {
  generateCobbleStonePattern,
  generateCobbledDeepslatePattern,
  generateCommandBlockPattern,
  generateDeepslateDiamondPattern,
  generateDeepslateGoldPattern,
  generateDeepslateLapisPattern,
  generateDeepslatePattern,
  generateDeepslateRedstonePattern,
  generateDiamondPattern,
  generateGoldPattern,
  generateLapisPattern,
  generateRedstonePattern,
  generateStevePattern,
  generateStonePattern,
} from "./pattern-utils";

// 5-wide x 7-tall pixel font glyphs
const font: Record<string, string[]> = {
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  r: [".....", ".....", "#.##.", "##..#", "#....", "#....", "#...."],
  o: [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  i: ["..#..", ".....", ".##..", "..#..", "..#..", "..#..", ".###."],
  n: [".....", ".....", "#.##.", "##..#", "#...#", "#...#", "#...#"],
  e: [".....", ".....", ".###.", "#...#", "#####", "#....", ".###."],
};

const getTextPixels = (text: string): Point[] => {
  const pixels: Point[] = [];
  let offsetX = 0;
  for (const ch of text) {
    const glyph = font[ch];
    if (!glyph) { offsetX += 3; continue; }
    for (let row = 0; row < glyph.length; row++)
      for (let col = 0; col < glyph[row].length; col++)
        if (glyph[row][col] === "#") pixels.push({ x: offsetX + col, y: row });
    offsetX += 6;
  }
  return pixels;
};

const getColoredCells = (grid: Grid): (Point & { color: Color })[] => {
  const cells: (Point & { color: Color })[] = [];
  for (let x = 0; x < grid.width; x++)
    for (let y = 0; y < grid.height; y++) {
      const c = getColor(grid, x, y);
      if (!isEmpty(c)) cells.push({ x, y, color: c });
    }
  return cells;
};

const assignCellsToTargets = (
  coloredCells: (Point & { color: Color })[],
  textPixels: Point[],
  gridWidth: number,
) => {
  const textMaxX = Math.max(0, ...textPixels.map((p) => p.x));
  const textOffsetX = Math.max(0, Math.floor((gridWidth - textMaxX - 1) / 2));
  const centeredTargets = textPixels.map((p) => ({ x: p.x + textOffsetX, y: p.y }));

  const sorted = [...coloredCells].sort((a, b) => a.x * 100 + a.y - (b.x * 100 + b.y));
  const sortedTargets = centeredTargets.map((t, i) => ({ ...t, i })).sort((a, b) => a.x * 100 + a.y - (b.x * 100 + b.y));

  const assignments: { from: Point; to: Point; color: Color; targetIndex: number }[] = [];
  const usedCells = new Set<number>();

  for (const target of sortedTargets) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < sorted.length; i++) {
      if (usedCells.has(i)) continue;
      const dx = sorted[i].x - target.x;
      const dy = sorted[i].y - target.y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
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

  const extras: (Point & { color: Color })[] = [];
  for (let i = 0; i < sorted.length; i++)
    if (!usedCells.has(i)) extras.push(sorted[i]);

  const assignedTargetIndices = new Set(assignments.map((a) => a.targetIndex));
  const ghosts: Point[] = [];
  for (let i = 0; i < centeredTargets.length; i++)
    if (!assignedTargetIndices.has(i)) ghosts.push(centeredTargets[i]);

  return { assignments, extras, ghosts };
};

const mostCommonColor = (colors: Color[]): Color => {
  const counts: Record<number, number> = {};
  for (const c of colors) counts[c] = (counts[c] ?? 0) + 1;
  let best = colors[0];
  let bestCount = 0;
  for (const key of Object.keys(counts)) {
    const color = Number(key);
    if (counts[color] > bestCount) { bestCount = counts[color]; best = color as Color; }
  }
  return best;
};

const oreNames: Record<number, string> = {
  1: "lapis_ore",
  2: "redstone_ore",
  3: "gold_ore",
  4: "diamond_ore",
};

const getOreGroups = (
  assignments: { from: Point; to: Point; color: Color }[],
  ghosts: Point[],
  ghostColor: Color,
  contributionCounts?: Record<string, number>,
) => {
  const colorCounts: Record<number, number> = {};
  for (const a of assignments) {
    const cc = contributionCounts?.[`${a.from.x},${a.from.y}`] ?? 1;
    colorCounts[a.color] = (colorCounts[a.color] ?? 0) + cc;
  }
  if (ghosts.length > 0) colorCounts[ghostColor] = (colorCounts[ghostColor] ?? 0) + ghosts.length;

  const groups: { color: number; oreName: string; count: number }[] = [];
  for (const c of [1, 2, 3, 4]) {
    if (colorCounts[c] && colorCounts[c] > 0 && oreNames[c]) {
      groups.push({ color: c, oreName: oreNames[c], count: colorCounts[c] });
    }
  }
  return groups;
};

export type TextSvgOptions = {
  holdDuration?: number;
  moveDuration?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  contributionCounts?: Record<string, number>; // "x,y" → contribution count
  variant?: "normal" | "deepslate"; // texture variant
};

export const createTextSvg = (
  grid: Grid,
  _cells: Point[] | null,
  text: string,
  drawOptions: DrawOptions,
  options?: TextSvgOptions,
) => {
  const sizeCell = drawOptions.sizeCell;
  const holdDuration = options?.holdDuration ?? 1000;
  const moveDuration = options?.moveDuration ?? 2000;
  const variant = options?.variant ?? "normal";
  const isDeepslate = variant === "deepslate";

  const dateFrom = options?.dateFrom ?? "2025-01-01";
  const dateTo = options?.dateTo ?? "2025-12-31";

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day} ${m} ${y}`;
  };
  const dateFromFmt = fmtDate(dateFrom);
  const dateToFmt = fmtDate(dateTo);

  const textPixels = getTextPixels(text);
  const coloredCells = getColoredCells(grid);
  const { assignments, extras, ghosts } =
    assignCellsToTargets(coloredCells, textPixels, grid.width);

  const ghostColor =
    assignments.length > 0
      ? mostCommonColor(assignments.map((a) => a.color))
      : (1 as Color);

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

  const tFrac = (ms: number) => ms / totalDuration;
  const pct = (frac: number) =>
    parseFloat((frac * 100).toFixed(3)).toString() + "%";

  const cmdConvertTimes: { color: number; convertT: number; outputT: number; cmdEndT: number }[] = [];
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

  const colorConvertT: Record<number, number> = {};
  for (const ct of cmdConvertTimes) {
    colorConvertT[ct.color] = tFrac(ct.convertT);
  }

  const width = (grid.width + 2) * sizeCell;
  const chatLineCount = oreGroups.length * 2;
  const chatExtraRows = Math.max(5, Math.ceil(chatLineCount * 0.7) + 3);
  const height = (grid.height + chatExtraRows) * sizeCell;
  const chatAreaY = grid.height * sizeCell + sizeCell;

  const svgElements: string[] = [];
  const styles: string[] = [];

  svgElements.push(h("rect", { x: 0, y: 0, width: grid.width * sizeCell, height: grid.height * sizeCell, fill: "var(--ce)", style: "shape-rendering:crispEdges" }));

  styles.push(
    `.c{shape-rendering:geometricPrecision;width:${drawOptions.sizeDot}px;height:${drawOptions.sizeDot}px;}`,
  );

  for (let i = 0; i < assignments.length; i++) {
    const { from, to, color } = assignments[i];
    const id = `m${i.toString(36)}`;
    const fromX = from.x * sizeCell;
    const fromY = from.y * sizeCell;
    const toX = to.x * sizeCell;
    const toY = to.y * sizeCell;
    const convertT = colorConvertT[color];

    styles.push(
      `@keyframes ${id}{` +
        `${pct(0)}{transform:translate(${fromX}px,${fromY}px)}` +
        `${pct(tFrac(p1End))}{transform:translate(${fromX}px,${fromY}px)}` +
        `${pct(tFrac(p2End))}{transform:translate(${toX}px,${toY}px)}` +
        `${pct(tFrac(p6End))}{transform:translate(${toX}px,${toY}px)}` +
        `${pct(tFrac(p7End))}{transform:translate(${fromX}px,${fromY}px)}` +
        `${pct(1)}{transform:translate(${fromX}px,${fromY}px)}` +
        `}`,
    );

    const fillId = `f${i.toString(36)}`;
    styles.push(
      `@keyframes ${fillId}{` +
        `${pct(0)}{fill:var(--c${color})}` +
        `${pct(convertT)}{fill:var(--c${color})}` +
        `${pct(convertT + 0.0001)}{fill:url(#cobblestone)}` +
        `${pct(tFrac(p6End))}{fill:url(#cobblestone)}` +
        `${pct(tFrac(p6End) + 0.0001)}{fill:var(--c${color})}` +
        `${pct(1)}{fill:var(--c${color})}` +
        `}`,
    );

    styles.push(
      `.m.${id}{fill:var(--c${color});transform:translate(${fromX}px,${fromY}px);animation:${id} ${totalDuration}ms ease-in-out infinite,${fillId} ${totalDuration}ms linear infinite;}`,
    );

    svgElements.push(h("rect", { class: `m ${id}`, x: 0, y: 0, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));
  }

  for (let i = 0; i < extras.length; i++) {
    const { x, y, color } = extras[i];
    const id = `e${i.toString(36)}`;
    styles.push(
      `@keyframes ${id}{${pct(0)}{opacity:1}${pct(tFrac(p1End))}{opacity:1}${pct(tFrac(p2End))}{opacity:0}${pct(tFrac(p6End))}{opacity:0}${pct(tFrac(p7End))}{opacity:1}${pct(1)}{opacity:1}}`,
    );
    styles.push(`.e.${id}{fill:var(--c${color});animation:${id} ${totalDuration}ms ease-in-out infinite;}`);
    svgElements.push(h("rect", { class: `e ${id}`, x: x * sizeCell, y: y * sizeCell, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));
  }

  for (let i = 0; i < ghosts.length; i++) {
    const { x, y } = ghosts[i];
    const id = `g${i.toString(36)}`;
    const convertT = colorConvertT[ghostColor];

    styles.push(
      `@keyframes ${id}{${pct(0)}{opacity:0}${pct(tFrac(p1End))}{opacity:0}${pct(tFrac(p2End))}{opacity:1}${pct(tFrac(p6End))}{opacity:1}${pct(tFrac(p7End))}{opacity:0}${pct(1)}{opacity:0}}`,
    );
    const fillId = `gf${i.toString(36)}`;
    styles.push(
      `@keyframes ${fillId}{${pct(0)}{fill:var(--c${ghostColor})}${pct(convertT)}{fill:var(--c${ghostColor})}${pct(convertT + 0.0001)}{fill:url(#cobblestone)}${pct(1)}{fill:url(#cobblestone)}}`,
    );
    styles.push(`.g.${id}{fill:var(--c${ghostColor});opacity:0;animation:${id} ${totalDuration}ms ease-in-out infinite,${fillId} ${totalDuration}ms linear infinite;}`);
    svgElements.push(h("rect", { class: `g ${id}`, x: x * sizeCell, y: y * sizeCell, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));
  }

  const cbX = commandBlockX * sizeCell;
  const cbY = commandBlockY * sizeCell;
  const cbId = "cb";
  styles.push(
    `@keyframes ${cbId}{${pct(0)}{opacity:0}${pct(tFrac(p4End) - 0.001)}{opacity:0}${pct(tFrac(p4End))}{opacity:1}${pct(tFrac(p6End))}{opacity:1}${pct(tFrac(p6End) + 0.001)}{opacity:0}${pct(1)}{opacity:0}}`,
  );
  styles.push(`.${cbId}{opacity:0;fill:url(#command_block);shape-rendering:geometricPrecision;animation:${cbId} ${totalDuration}ms linear infinite;}`);
  svgElements.push(h("rect", { class: cbId, x: cbX, y: cbY, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));

  const steveStartX = (grid.width - 1) * sizeCell;
  const steveStartY = 0;
  const steveEndX = (commandBlockX + 1) * sizeCell;
  const steveEndY = commandBlockY * sizeCell;

  const steveKf: string[] = [];
  steveKf.push(`${pct(0)}{opacity:0;transform:translate(${steveStartX}px,${steveStartY}px)}`);
  steveKf.push(`${pct(tFrac(p3End) - 0.001)}{opacity:0;transform:translate(${steveStartX}px,${steveStartY}px)}`);
  steveKf.push(`${pct(tFrac(p3End))}{opacity:1;transform:translate(${steveStartX}px,${steveStartY}px)}`);
  steveKf.push(`${pct(tFrac(p4End))}{opacity:1;transform:translate(${steveEndX}px,${steveEndY}px)}`);
  steveKf.push(`${pct(tFrac(p6End) - 0.001)}{opacity:1;transform:translate(${steveEndX}px,${steveEndY}px)}`);
  steveKf.push(`${pct(tFrac(p6End))}{opacity:0;transform:translate(${steveEndX}px,${steveEndY}px)}`);
  steveKf.push(`${pct(1)}{opacity:0;transform:translate(${steveEndX}px,${steveEndY}px)}`);

  styles.push(`@keyframes steve{${steveKf.join("")}}`);
  styles.push(`.steve{fill:var(--cs);opacity:0;shape-rendering:geometricPrecision;animation:steve ${totalDuration}ms linear infinite;}`);
  svgElements.push(h("rect", { class: "steve", x: 0, y: 0, width: drawOptions.sizeDot, height: drawOptions.sizeDot }));

  const chatFontSize = Math.max(7, Math.floor(sizeCell * 0.55));
  const chatLineHeight = chatFontSize + 3;
  const chatX = 4;

  styles.push(
    `.chat{font-family:"Courier New",monospace;font-size:${chatFontSize}px;fill:#fff;opacity:0;}`,
  );
  styles.push(
    `.chat-bg{fill:rgba(0,0,0,0.6);opacity:0;}`,
  );

  const chatLines: { text: string; appearT: number; color?: string }[] = [];
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

    styles.push(
      `@keyframes chbg{${pct(0)}{opacity:0}${pct(bgAppearT - 0.001)}{opacity:0}${pct(bgAppearT)}{opacity:1}${pct(chatDisappearT)}{opacity:1}${pct(chatDisappearT + 0.001)}{opacity:0}${pct(1)}{opacity:0}}`,
    );
    styles.push(`.chat-bg.chbg{animation:chbg ${totalDuration}ms linear infinite;}`);
    svgElements.push(h("rect", {
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

    styles.push(
      `@keyframes ${id}{${pct(0)}{opacity:0}${pct(appearT - 0.001)}{opacity:0}${pct(appearT)}{opacity:1}${pct(chatDisappearT)}{opacity:1}${pct(chatDisappearT + 0.001)}{opacity:0}${pct(1)}{opacity:0}}`,
    );
    const fillStyle = color ? `fill:${color};` : "";
    styles.push(`.chat.${id}{${fillStyle}animation:${id} ${totalDuration}ms linear infinite;}`);
    svgElements.push(
      `<text class="chat ${id}" x="${chatX}" y="${lineY}">${escXml(lineText)}</text>`,
    );
  }

  const viewBox = [
    -sizeCell,
    -sizeCell * 2,
    width,
    height,
  ].join(" ");

  const colorVarCss = generateColorVar(drawOptions);

  const svg = [
    h("svg", {
      viewBox,
      width,
      height,
      xmlns: "http://www.w3.org/2000/svg",
    }).replace("/>", ">"),

    "<desc>Generated with https://github.com/Platane/snk</desc>",

    "<defs>",
    generateStevePattern(sizeCell),
    isDeepslate ? generateDeepslatePattern(sizeCell) : generateStonePattern(sizeCell),
    isDeepslate ? generateCobbledDeepslatePattern(sizeCell) : generateCobbleStonePattern(sizeCell),
    isDeepslate ? generateDeepslateLapisPattern(sizeCell) : generateLapisPattern(sizeCell),
    isDeepslate ? generateDeepslateRedstonePattern(sizeCell) : generateRedstonePattern(sizeCell),
    isDeepslate ? generateDeepslateGoldPattern(sizeCell) : generateGoldPattern(sizeCell),
    isDeepslate ? generateDeepslateDiamondPattern(sizeCell) : generateDiamondPattern(sizeCell),
    generateCommandBlockPattern(sizeCell),
    "</defs>",

    "<style>",
    minifyCss(colorVarCss + styles.join("\n")),
    "</style>",

    ...svgElements,

    "</svg>",
  ].join("");

  return svg;
};

const escXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const generateColorVar = (drawOptions: DrawOptions) =>
  `:root{--cb:${drawOptions.colorDotBorder};--cs:${drawOptions.colorSnake};--ce:${drawOptions.colorEmpty};${Object.entries(drawOptions.colorDots).map(([i, color]) => `--c${i}:${color};`).join("")}}` +
  (drawOptions.dark
    ? `@media(prefers-color-scheme:dark){:root{--cb:${drawOptions.dark.colorDotBorder || drawOptions.colorDotBorder};--cs:${drawOptions.dark.colorSnake || drawOptions.colorSnake};--ce:${drawOptions.dark.colorEmpty};${Object.entries(drawOptions.dark.colorDots).map(([i, color]) => `--c${i}:${color};`).join("")}}}`
    : "");
