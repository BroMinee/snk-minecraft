import type { Color, Empty, Grid } from "@snk/types/grid";
import { copyGrid, getColor, isEmpty, isInside, setColorEmpty, } from "@snk/types/grid";
import type { Snake } from "@snk/types/snake";
import { getHeadX, getHeadY } from "@snk/types/snake";
import type { Point } from "@snk/types/point";
import type { AnimationOptions } from "@snk/gif-creator";
import { createSnake } from "./snake";
import { createGrid } from "./grid";
import { h } from "./xml-utils";
import { minifyCss } from "./css-utils";

export type DrawOptions = {
  colorDots: Record<Color, string>;
  colorEmpty: string;
  colorDotBorder: string;
  colorSnake: string;
  sizeCell: number;
  sizeDot: number;
  sizeDotBorderRadius: number;
  dark?: {
    colorDots: Record<Color, string>;
    colorEmpty: string;
    colorDotBorder?: string;
    colorSnake?: string;
  };
};

const getCellsFromGrid = ({ width, height }: Grid) =>
  Array.from({ length: width }, (_, x) =>
    Array.from({ length: height }, (_, y) => ({ x, y })),
  ).flat();

const createLivingCells = (
  grid0: Grid,
  chain: Snake[],
  cells: Point[] | null,
) => {
  const livingCells: (Point & {
    t: number | null;
    color: Color | Empty;
  })[] = (cells ?? getCellsFromGrid(grid0)).map(({ x, y }) => ({
    x,
    y,
    t: null,
    color: getColor(grid0, x, y),
  }));

  const grid = copyGrid(grid0);
  for (let i = 0; i < chain.length; i++) {
    const snake = chain[i];
    const x = getHeadX(snake);
    const y = getHeadY(snake);

    if (isInside(grid, x, y) && !isEmpty(getColor(grid, x, y))) {
      setColorEmpty(grid, x, y);
      const cell = livingCells.find((c) => c.x === x && c.y === y)!;
      cell.t = i / chain.length;
    }
  }

  return livingCells;
};

export const createSvg = (
  grid: Grid,
  cells: Point[] | null,
  chain: Snake[],
  drawOptions: DrawOptions,
  animationOptions: Pick<AnimationOptions, "frameDuration">,
) => {
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

  const style =
    generateColorVar(drawOptions) +
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
    generateIronPattern(),
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

const optimizeCss = (css: string) => minifyCss(css);
const optimizeSvg = (svg: string) => svg;


const generateStevePattern = (): string => {
  return "<pattern id=\"steve\" viewBox=\"0,0,30,30\" width=\"100%\" height=\"100%\">" +
      "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+PHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj48dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPjwvcmRmOkRlc2NyaXB0aW9uPjwvcmRmOlJERj48L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9J3cnPz4slJgLAAACtUlEQVRIS+2WPW/UQBCGn5m1z2cISIg2AgmBIlHyWYCgDSUNNUKiSEPPL6CHIh2i5g8ADQWCAoEokaIgBCihS3MkOTnnnaHwne/OdxeQ4EjDK01he3afnZ13bcvN6+edA5A2b/wr/Qf/Mx0YWAauFozgPRRr5vwVGUqUFO/XWoMTL7h96waJF80xf0WlZDx5+oxSMhjdasVIvCD17lwi8WJsNw+sx9ryLq3+imRO/aXvocQLBjx58ehebS61PVTm8wY1F0xbtbl0rAdzggKo+JiHDqzH8vLhXQcwAj3JMNHKc54i8Qh4Cq6I7pDKFird5hwAmOf0/DjuObiCFqA/cC0QV4SS1AuUCKPgQg6xvHIfJK/AcYHlSytQHgOUTL+xcuc0mW40mQAUtsjq408UtliNT7Z4/nYVkk61EHZ4vvqAzHdh9Di5KHAY9CiuCwB07STduEQ3nqGwRdwOD0kNuecUdqLO79pJEECPQlgAyTFJ6nwF0IanZPzyjzXNsnXFwQ18B6wDcRsccv1KHtbIwzpp+I5rj1KyqeESScNGnZ/r14poHcS2wbuolzW47jGSUNDCRBGvzIUNzeXa4+2HV8Bw8LgSLp+7hniYMBco6iUt9pA+fHicvCTzXXLbpu0d2mzR1i+0wzrtZI00bALlRKWDgJI0bNb5bf1Cmy1y2ya3Dpnv1tBx8BykPumfgWaCHcVIhz30lOBKKzI1givuw3wjxWZPP9LjhoyUN+8/EkmBauKlxVMkcbrny+CsbXwmSvWhCfS4cuEsSq+ZCvtVbKLERsVJlIlKB5FEGas4kvbfgtM1+8mc9dtgE4hB2AtMjRgEm96FqZrZ41IyXr9b6x8VEIewj0tNIAp4H554wdWLSzP/4X5ZsUg1kwuUOlnpIEodQn9HvwS7ew0fXDc1em80dz/9BEOciZlLH9d7AAAAAElFTkSuQmCC\"/>" +
      "</pattern>";
}


const generateStonePattern = (): string => {
  return "<pattern id=\"stone\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
      "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAZElEQVR42jWNsQ0AMQjEGJcB3HsEr/xSkncBOgkfUyXIguoo4mEXGdkFFvBdlGmpwKCAWIWOeYFladCK4n2BXZZn6vR3dsXRfLnKWfFoXmtUrX81AiboaZ9u4I1G8KdqPICl6AdyLn2NfcJFIAAAAABJRU5ErkJggg==\"/>" +
      "</pattern>";
}

const generateCobbleStonePattern = (): string => {
  return "<pattern id=\"cobblestone\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
      "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEW1tbWmpqaIh4hubW1hYWFSUlLm8qFQAAAAcUlEQVR42gVAARGDMAz8MAMjh4CSLwIWIgDSIGAD/1p2iPk5pTfFOW3QLR3nGrrGQxSLTL1wp2TJ3PF6W/yaOjSV9eEB2y3a4omQPSerG4f6biMXkP0a8X2DMdpytQkuIWuY49CuziJmclhoIcsjUvgH41gVHD61kt4AAAAASUVORK5CYII=\"/>" +
      "</pattern>";
}

const generateLapisPattern = (): string => {
  return "<pattern id=\"lapis\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
      "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAKlBMVEWioqJplfSPj49/f390dHREb9xoaGhcXFwYVb0gWYsQRKwWRI0QNL0QNJzXKVyZAAAAmUlEQVR42mNQNjJxdnMxUmIwTi9zUjYrN2Ew6exOL3E6bcygrKDlHWTM5MLgbOJeolyuYsxgZFax2GyOmxODc01gtHKgkjGDVwCDepqBkzKDqoByVsVu8xIGA+bkrNborDSG5LQlbkeFXCczGO+9bMSgrBjMYMKgm7Y1jCeIQckksDnwgAMzg4lz6wYDZhdnBmNjBWZjY2MlAIucJW0/DfyqAAAAAElFTkSuQmCC\"/>" +
      "</pattern>";
}

const generateRedstonePattern = (): string => {
  return "<pattern id=\"redstone\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
      "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAKlBMVEX/iYm/k5OTjIz9Xl5/f390dHRoaGhpXFz3HBz/AADKBwfGBASWBgaXAwM5vTG5AAAAj0lEQVR42g3LMRLBUBQF0FtSJmwgf346hQWo3tyXwmhk3kuMUUo0SqQ3NEZnCRqFDShswFgUpz8IQa1yEjQji0ahbdW5kaBuv62rw5af21v3hJSvfspHCWOW5CpEffjnuiMWkyij5/2M2YkhDnpDrM1bmycOFpuODAJdXa676bFBkHHqkpdQyyIZAki6ROUPkAQnR+iE5aoAAAAASUVORK5CYII=\"/>" +
      "</pattern>";
}


const generateIronPattern = (): string => {
  return "<pattern id=\"iron\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
      "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAG1BMVEXiwKrYr5OvjnePj49/f3+IdFV0dHR3Z09oaGgI1kKFAAAAfklEQVR42gVAwQ2CQBAcO0Cp4AIa3+5q/O+w8D4TKMDzcm8TrAAIZRsoPZWcBSyL6Tw5PI5D7lqiC1r25BlvKWs87wnGeDy0nwbJJNRuijxsomUhZL1uffw57BtqC6JYpHom8QxSjP3L4Ft8zOE04n4xv1WNwqZEEyUozBTnH6b0JCp9JVwWAAAAAElFTkSuQmCC\"/>" +
      "</pattern>";
}

const generateGoldPattern = (): string => {
  return "<pattern id=\"gold\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
      "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAHlBMVEX//7X87kvrnQ6ioqKPj49/f3+ccCB0dHRoaGhcXFxcSQIKAAAAjklEQVR42hXLzQ2CMBgG4JcNjLpA0QTPIGEAWmWAfrZeS/g5C03hjlIWILqt+twfcO7s4IhAttKkFwXli3Ue1wpSLKa5mwZWr6zlYQqp2SYakh5Wxtvyv5zvDql7VChMXnJ6/jpLz+LzFpiSqx/r0wzyk3iFQQtVR7eO7TJcWJBbk/VQ8Z4o4UeQTJ0Uir7gZysnxZjc/QAAAABJRU5ErkJggg==\"/>" +
      "</pattern>";
}
const generateDiamondPattern = (): string => {
  return "<pattern id=\"diamond\" viewBox=\"0,0,16,16\" width=\"100%\" height=\"100%\">" +
      "<image href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAHlBMVEXV//Z359GNrbGioqIe0NaPj49/f390dHQjlphnZ2fHnuD/AAAAiElEQVR42gVAMQrCMBR93sChg45WmgsI4lwQM4qShK5C3sdRoT9kLTi42SEtva3AR9GcogO1OC+LQpbzc84bwvlmHHyToMzFaCCi/Layyj3StbLGkujKvl5u8YCx9XmlDHiY6WWH+xGTXkrdzQlkdGH8eEg3hXVlA9zuq6e2IeTtfDRJQbIn6f6qxS+NaJn2aQAAAABJRU5ErkJggg==\"/>" +
      "</pattern>";
}


const generateColorVar = (drawOptions: DrawOptions) =>
  `
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
