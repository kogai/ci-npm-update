declare module "npm-check-updates" {
  export interface Diff {
    [key: string]: string,
  }

  export function run(options: {
    packageFile: 'package.json',
    silent?: boolean,
    upgrade?: boolean,
    jsonUpgraded?: boolean,
    reject?: string[],
  }): Promise<Diff>;
}
