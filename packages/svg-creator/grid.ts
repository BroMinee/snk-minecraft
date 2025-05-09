import type { Color, Empty } from "@snk/types/grid";
import type { Point } from "@snk/types/point";
import { createAnimation } from "./css-utils";
import { h } from "./xml-utils";

export type Options = {
  colorDots: Record<Color, string>;
  colorEmpty: string;
  colorDotBorder: string;
  sizeCell: number;
  sizeDot: number;
};

export const createGrid = (
  cells: (Point & { t: number | null; color: Color | Empty })[],
  { sizeDot, sizeCell }: Options,
  duration: number,
) => {
  const svgElements: string[] = [];
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

      styles.push(
        createAnimation(animationName, [
          { t: t - 0.0001, style: `fill:var(--c${color})` },
          { t: t + 0.0001, style: `fill:url(#cobblestone)` },
          { t: 1, style: `fill:url(#cobblestone)` },
        ]),

        `.c.${id}{
          fill: var(--c${color});
          animation-name: ${animationName}
        }`,
      );
    }

    svgElements.push(
      h("rect", {
        class: ["c", id].filter(Boolean).join(" "),
        x: x * sizeCell,
        y: y * sizeCell,
      }),
    );
  }

  return { svgElements, styles };
};
