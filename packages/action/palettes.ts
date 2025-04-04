import { DrawOptions as DrawOptions } from "@snk/svg-creator";

export const basePalettes: Record<
  string,
  Pick<
    DrawOptions,
    "colorDotBorder" | "colorEmpty" | "colorSnake" | "colorDots" | "dark"
  >
> = {
  "github-light": {
    colorDotBorder: "none",
    colorDots: ["red", "url(#lapis)", "url(#redstone)", "url(#gold)", "url(#diamond)"],
    colorEmpty: "url(#stone)",
    colorSnake: "url(#steve)",
  },
  "github-dark": {
    colorDotBorder: "none",
    colorEmpty: "url(#stone)",
    colorDots: ["red", "url(#lapis)", "url(#redstone)", "url(#gold)", "url(#diamond)"],
    colorSnake: "url(#steve)",
  },
};

// aliases
export const palettes = { ...basePalettes };
palettes["github"] = palettes["github-light"];
palettes["default"] = palettes["github"];
