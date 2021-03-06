import * as assert from "power-assert";
import { GitHubApi } from "../src/github";

const githubDataSet = {
    "github git url": "git://github.com/foo/something.useful.git",
    "github git+https url": "git+https://github.com/foo/something.useful.git",
    "github git+ssh url": "git+ssh://git@github.com/foo/something.useful.git",
    "github http url": "http://github.com/foo/something.useful",
    "github https url": "https://github.com/foo/something.useful",
    "github https with git extension url": "https://github.com/foo/something.useful.git",
    "github ssh url": "git@github.com:foo/something.useful.git",
};
const gheDataSet = {
    "ghe ssh url": "git@ghe.example.com:foo/something.useful.git",
    "ghe https url": "https://ghe.example.com/foo/something.useful",
    "ghe https+git url": "https://ghe.example.com/foo/something.useful.git",
};
describe("GitHubApi", () => {
    context(".parseUrl(reading github.com URLs)", () => {
        Object.keys(githubDataSet).forEach((name) => {
            const url = <string>(<any>githubDataSet)[name];

            it(`extracts "endpoint" from ${name}`, () => {
                assert(GitHubApi.extractEndpoint(url) === "https://api.github.com");
            });

            it(`extracts "owner" from ${name}`, () => {
                assert(GitHubApi.extractOwner(url) === "foo");
            });

            it(`extracts "repository" from ${name}`, () => {
                assert(GitHubApi.extractRepository(url) === "something.useful");
            });
        });
    });

    context(".parseUrl(ghe URLs)", () => {
        Object.keys(gheDataSet).forEach((name) => {
            const url = <string>(<any>gheDataSet)[name];

            it(`extracts "endpoint" from ${name}`, () => {
                assert(GitHubApi.extractEndpoint(url) === "https://ghe.example.com/api/v3");
            });

            it(`extracts "owner" from ${name}`, () => {
                assert(GitHubApi.extractOwner(url) === "foo");
            });

            it(`extracts "repository" from ${name}`, () => {
                assert(GitHubApi.extractRepository(url) === "something.useful");
            });
        });
    });
});

