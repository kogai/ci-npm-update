import * as program from "commander";
import * as main from "./index";

const list = (x: string): string[] => x.split(",");

const {GITHUB_ACCESS_TOKEN, GIT_USER_NAME, GIT_USER_EMAIL} = process.env;

program
  .version("0.0.1")
  .usage("[options] <file ...>")
  .option("-t, --token <n>", "GitHubToken", GITHUB_ACCESS_TOKEN)
  .option("-n, --user-name <n>", "GitHubUserName", GIT_USER_NAME)
  .option("-e, --user-email <n>", "GitHubUserName", GIT_USER_EMAIL)
  .option("-E, --execute", "should execute", false)
  .option("-x, --exclude <items>", "packages that ignore update", list)
  .parse(process.argv);

function die(message: string) {
    console.error(message);
    process.exit(1);
}

["token", "userName", "userEmail"].forEach(x => {
    if (!program[x]) {
        die(`No value for ${x}`);
    }
});

const options: main.Options = {
    githubAccessToken: program.token,
    gitUserName: program.userName,
    gitUserEmail: program.userEmail,
    execute: program.execute,
    exclude: program.exclude,
};

main.start(options).then((pullRequestUrl) => {
    console.log("Successfully creqted a pull-request: %s", pullRequestUrl);
}).catch((reason) => {
    // handle expected reasons
    if (reason instanceof main.AllDependenciesAreUpToDate) {
        console.log("All the dependencies are up to date.");
        return;
    } else if (reason instanceof main.SkipToCreatePullRequest) {
        console.log("Skiped to create a pull-request because --execute is not specified.");
        return;
    }
    console.error(`Unexpected errors caught: ${reason.stack}`);
    process.exit(1);
});
