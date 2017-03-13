import { run, Diff } from "npm-check-updates";

export const read = (exclude: string[] = []) => run({
    packageFile: "package.json",
    silent: true,
    upgrade: true,
    exclude,
});

export const diff = (exclude: string[] = []) => run({
    packageFile: "package.json",
    silent: true,
    jsonUpgraded: true,
    exclude,
});

export const createIssue = (xs: Diff) => {
    const names = Object.keys(xs).map(name => `* ${name}`).join("\n");
    return `## Updated packages\n\n${names}`;
};
