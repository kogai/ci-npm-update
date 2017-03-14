import { exec } from "child_process";
import { run as runNcu, Diff } from "npm-check-updates";

export const read = (exclude: string[] = []) => runNcu({
    packageFile: "package.json",
    upgrade: true,
    exclude,
});

export const diff = (exclude: string[] = []) => runNcu({
    packageFile: "package.json",
    exclude,
});

const NPM_BASE = "https://www.npmjs.com/package";
export const createIssue = (xs: Diff) => {
    const names = Object.keys(xs).map(name => `* [${name}](${NPM_BASE}/${name})`).join("\n");
    return `## Updated packages\n\n${names}`;
};

export const run = (command: string): Promise<string> => new Promise<string>((resolve, reject) => {
    console.log(`>> ${command}`);
    exec(command, {
        encoding: "utf8",
        maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
        if (stdout.length > 0) {
            console.log(stdout);
        }
        if (stderr.length > 0) {
            console.error(stderr);
        }
        if (error) {
            reject(error);
        } else {
            resolve(stdout);
        }
    });
});
