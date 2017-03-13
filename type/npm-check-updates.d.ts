declare module "npm-check-updates" {
  export interface Diff {
    [key: string]: string,
  }

  export function run(options: {
    packageFile: 'package.json',
    silent?: boolean,
    upgrade?: boolean,
    jsonUpgraded?: boolean,
    exclude?: string[],
  }): Promise<Diff>;
}
