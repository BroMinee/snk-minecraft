import { getGithubUserContribution } from "@snk/github-user-contribution";
import { userContributionToGrid } from "./userContributionToGrid";
import type { DrawOptions } from "@snk/svg-creator";
import type { AnimationOptions } from "@snk/gif-creator";

export const generateContributionText = async (
  userName: string,
  text: string,
  outputs: ({
    format: "svg" | "gif";
    drawOptions: DrawOptions;
    animationOptions: AnimationOptions;
    variant?: string;
  } | null)[],
  options: { githubToken: string },
) => {
  console.log("fetching github user contribution");
  const cells = await getGithubUserContribution(userName, options);

  const grid = userContributionToGrid(cells);

  const dates = cells.map((c) => c.date).filter(Boolean).sort();
  const dateFrom = dates[0] ?? "2025-01-01";
  const dateTo = dates[dates.length - 1] ?? "2025-12-31";

  const contributionCounts: Record<string, number> = {};
  for (const c of cells) contributionCounts[`${c.x},${c.y}`] = c.count;

  return Promise.all(
    outputs.map(async (out, i) => {
      if (!out) return;
      const { drawOptions } = out;
      const variant = out.variant === "deepslate" ? "deepslate" : "normal";

      console.log(`creating text svg [${variant}] (outputs[${i}])`);
      const { createTextSvg } = await import("@snk/svg-creator/createTextSvg");
      return createTextSvg(grid, null, text, drawOptions, {
        dateFrom,
        dateTo,
        contributionCounts,
        variant: variant as "normal" | "deepslate",
      });
    }),
  );
};
