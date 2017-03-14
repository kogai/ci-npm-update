import { exec } from "child_process";
import {readFile} from "fs";
import {merge, mergeAll} from "ramda";
import { run as runNcu, Diff } from "npm-check-updates";

export interface IVersionDiff {
  [key: string]: {
    installed: string,
    updated: string,
  };
}

export const readPackageJson = () => new Promise<Diff>((resolve, reject) => {
    readFile("package.json", "utf8", (err, data) => {
        if (err) {
            return reject(err);
        }
        const pkg = JSON.parse(data);
        resolve(merge(pkg.dependencies, pkg.devDependencies));
    });
});

export const read = (exclude: string[] = []) => runNcu({
    packageFile: "package.json",
    upgrade: true,
    exclude,
});

export const diff = (exclude: string[] = []) => Promise.all([
    runNcu({ packageFile: "package.json", exclude }),
    readPackageJson(),
])
.then(([update, installed]) => {
  return Object
    .keys(update)
    .map(key => ({
      [key]: {
        installed: installed[key],
        updated: update[key],
      },
    }));
})
.then(x => mergeAll<IVersionDiff>(x))
;

const NPM_BASE = "https://www.npmjs.com/package";

export const createIssue = (xs: IVersionDiff) => {
    const names = Object
        .keys(xs)
        .map(name => `* [x] [${name}:  ${xs[name].installed}...${xs[name].updated}](${NPM_BASE}/${name})`)
        .join("\n");
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
