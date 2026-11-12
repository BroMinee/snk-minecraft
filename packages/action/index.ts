import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";
import { parseOutputsOption } from "./outputsOptions";

const writeResults = (
  outputs: ReturnType<typeof parseOutputsOption>,
  results: (string | Uint8Array | undefined)[],
) => {
  outputs.forEach((out, i) => {
    const result = results[i];
    if (out?.filename && result) {
      console.log(`writing to ${out.filename}`);
      fs.mkdirSync(path.dirname(out.filename), { recursive: true });
      fs.writeFileSync(out.filename, result);
    }
  });
};

(async () => {
  try {
    const userName = core.getInput("github_user_name");
    const text = core.getInput("text");
    const outputs = parseOutputsOption(
      core.getMultilineInput("outputs") ?? [
        core.getInput("gif_out_path"),
        core.getInput("svg_out_path"),
      ],
    );
    const githubToken =
      process.env.GITHUB_TOKEN ?? core.getInput("github_token");

    if (text) {
      const { generateContributionText } = await import(
        "./generateContributionText"
      );
      const results = await generateContributionText(userName, text, outputs, {
        githubToken,
      });
      writeResults(outputs, results);
    } else {
      const { generateContributionSnake } = await import(
        "./generateContributionSnake"
      );
      const results = await generateContributionSnake(userName, outputs, {
        githubToken,
      });
      writeResults(outputs, results);
    }
  } catch (e: any) {
    core.setFailed(`Action failed with "${e.message}"`);
  }
})();
