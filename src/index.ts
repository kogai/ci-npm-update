import * as moment from "moment";
import {read, diff, createIssue, run} from "./utils";

export abstract class SkipRemainingTasks { }

export class AllDependenciesAreUpToDate extends SkipRemainingTasks { }

export class SkipToCreatePullRequest extends SkipRemainingTasks { }

export type Options = {
    githubAccessToken: string,
    gitUserName: string,
    gitUserEmail: string,
    execute: boolean, // default to dry-run mode
    exclude: string[],
}

export function setupGitConfig(gitUserName: string, gitUserEmail: string): Promise<any> {
    const setUserNamePromise = gitUserName ? run(`git config user.name '${gitUserName}'`) : Promise.resolve();
    const setUserEmailPromise = gitUserEmail ? run(`git config user.email '${gitUserEmail}'`) : Promise.resolve();
    return Promise.all<any>([setUserNamePromise, setUserEmailPromise]);
}

export function createGitBranch(branch: string): Promise<string> {
    console.log(`Creating a branch: ${branch}`);

    return run(`git checkout -b ${branch}`)
    .then(() => read())
    .then(() => run("git add package.json"))
    .then(() => run("git diff --cached"))
    .then(d => {
        if (d.trim()) {
            return run(`git commit -m 'update npm dependencies'`);
        } else {
            return run("git checkout -").then(() => {
                return Promise.reject(new AllDependenciesAreUpToDate());
            });
        }
    });
}

export function start({
    githubAccessToken: githubAccessToken,
    gitUserName: gitUserName,
    gitUserEmail: gitUserEmail,
    execute: execute,
}: Options): Promise<string> {
    if (execute) {
        console.assert(githubAccessToken, "Missing GITHUB_ACCESS_TOKEN or --token");
    }

    const timestamp = moment().format("YYYYMMDDhhmmss");
    const branch = `npm-update/${timestamp}`;

    return setupGitConfig(gitUserName, gitUserEmail)
    .then(() => diff())
    .then(d => createIssue(d))
    .then(async (issue) => {
        await createGitBranch(branch);

        console.log("-------");
        console.log(issue);
        console.log("--------");

        let gitPushPromise: Promise<any>;
        if (execute) {
            gitPushPromise = run(`git push origin ${branch}`);
        } else {
            console.log("Skipped `git push` because --execute is not specified.");
            gitPushPromise = Promise.resolve();
        }

        return gitPushPromise.then((_) => {
            return run("git rev-parse --abbrev-ref HEAD");
        }).then((baseBranch) => {
            return Promise.all([
                run("git remote get-url --push origin"),
                Promise.resolve({
                    title: `npm update at ${new Date()}`,
                    body: issue,
                    head: branch,
                    base: baseBranch.trim(),
                }),
            ]);
        });
    });
}
