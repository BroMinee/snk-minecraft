"use strict";
exports.id = 369;
exports.ids = [369];
exports.modules = {

/***/ 5369:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateContributionText: () => (/* binding */ generateContributionText)
/* harmony export */ });
/* harmony import */ var _snk_github_user_contribution__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4770);
/* harmony import */ var _userContributionToGrid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2043);


const generateContributionText = async (userName, text, outputs, options) => {
    console.log("fetching github user contribution");
    const cells = await (0,_snk_github_user_contribution__WEBPACK_IMPORTED_MODULE_0__/* .getGithubUserContribution */ .b)(userName, options);
    const grid = (0,_userContributionToGrid__WEBPACK_IMPORTED_MODULE_1__/* .userContributionToGrid */ .L)(cells);
    const dates = cells.map((c) => c.date).filter(Boolean).sort();
    const dateFrom = dates[0] ?? "2025-01-01";
    const dateTo = dates[dates.length - 1] ?? "2025-12-31";
    const contributionCounts = {};
    for (const c of cells)
        contributionCounts[`${c.x},${c.y}`] = c.count;
    return Promise.all(outputs.map(async (out, i) => {
        if (!out)
            return;
        const { drawOptions } = out;
        const variant = out.variant === "deepslate" ? "deepslate" : "normal";
        console.log(`creating text svg [${variant}] (outputs[${i}])`);
        const { createTextSvg } = await Promise.all(/* import() */[__webpack_require__.e(51), __webpack_require__.e(400)]).then(__webpack_require__.bind(__webpack_require__, 5400));
        return createTextSvg(grid, null, text, drawOptions, {
            dateFrom,
            dateTo,
            contributionCounts,
            variant: variant,
        });
    }));
};


/***/ }),

/***/ 2043:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   L: () => (/* binding */ userContributionToGrid)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(105);

const userContributionToGrid = (cells) => {
    const width = Math.max(0, ...cells.map((c) => c.x)) + 1;
    const height = Math.max(0, ...cells.map((c) => c.y)) + 1;
    const grid = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__/* .createEmptyGrid */ .Kb)(width, height);
    for (const c of cells) {
        if (c.level > 0)
            (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__/* .setColor */ .wW)(grid, c.x, c.y, c.level);
        else
            (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__/* .setColorEmpty */ .l$)(grid, c.x, c.y);
    }
    return grid;
};


/***/ }),

/***/ 4770:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   b: () => (/* binding */ getGithubUserContribution)
/* harmony export */ });
/**
 * get the contribution grid from a github user page
 *
 * use options.from=YYYY-MM-DD options.to=YYYY-MM-DD to get the contribution grid for a specific time range
 * or year=2019 as an alias for from=2019-01-01 to=2019-12-31
 *
 * otherwise return use the time range from today minus one year to today ( as seen in github profile page )
 *
 * @param userName github user name
 * @param options
 *
 * @example
 *  getGithubUserContribution("platane", { from: "2019-01-01", to: "2019-12-31" })
 *  getGithubUserContribution("platane", { year: 2019 })
 *
 */
const getGithubUserContribution = async (userName, o) => {
    const query = /* GraphQL */ `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                contributionLevel
                weekday
                date
              }
            }
          }
        }
      }
    }
  `;
    const variables = { login: userName };
    const res = await fetch("https://api.github.com/graphql", {
        headers: {
            Authorization: `bearer ${o.githubToken}`,
            "Content-Type": "application/json",
            "User-Agent": "me@platane.me",
        },
        method: "POST",
        body: JSON.stringify({ variables, query }),
    });
    if (!res.ok)
        throw new Error(await res.text().catch(() => res.statusText));
    const { data, errors } = (await res.json());
    if (errors?.[0])
        throw errors[0];
    return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(({ contributionDays }, x) => contributionDays.map((d) => ({
        x,
        y: d.weekday,
        date: d.date,
        count: d.contributionCount,
        level: (d.contributionLevel === "FOURTH_QUARTILE" && 4) ||
            (d.contributionLevel === "THIRD_QUARTILE" && 3) ||
            (d.contributionLevel === "SECOND_QUARTILE" && 2) ||
            (d.contributionLevel === "FIRST_QUARTILE" && 1) ||
            0,
    })));
};


/***/ }),

/***/ 105:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FK: () => (/* binding */ isInside),
/* harmony export */   Im: () => (/* binding */ isEmpty),
/* harmony export */   Kb: () => (/* binding */ createEmptyGrid),
/* harmony export */   Yd: () => (/* binding */ isInsideLarge),
/* harmony export */   l$: () => (/* binding */ setColorEmpty),
/* harmony export */   mi: () => (/* binding */ copyGrid),
/* harmony export */   oU: () => (/* binding */ getColor),
/* harmony export */   wW: () => (/* binding */ setColor)
/* harmony export */ });
/* unused harmony exports isGridEmpty, gridEquals */
const isInside = (grid, x, y) => x >= 0 && y >= 0 && x < grid.width && y < grid.height;
const isInsideLarge = (grid, m, x, y) => x >= -m && y >= -m && x < grid.width + m && y < grid.height + m;
const copyGrid = ({ width, height, data }) => ({
    width,
    height,
    data: Uint8Array.from(data),
});
const getIndex = (grid, x, y) => x * grid.height + y;
const getColor = (grid, x, y) => grid.data[getIndex(grid, x, y)];
const isEmpty = (color) => color === 0;
const setColor = (grid, x, y, color) => {
    grid.data[getIndex(grid, x, y)] = color || 0;
};
const setColorEmpty = (grid, x, y) => {
    setColor(grid, x, y, 0);
};
/**
 * return true if the grid is empty
 */
const isGridEmpty = (grid) => grid.data.every((x) => x === 0);
const gridEquals = (a, b) => a.data.every((_, i) => a.data[i] === b.data[i]);
const createEmptyGrid = (width, height) => ({
    width,
    height,
    data: new Uint8Array(width * height),
});


/***/ })

};
;