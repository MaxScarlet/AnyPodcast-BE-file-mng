import fse from 'fs-extra';
import path from 'path';
import packs from "./package-lock.json";

import { Command } from 'commander';
const program = new Command();
program
  .option('-v, --verbose', 'Enable verbose logs')
  .option('-e, --externalize', 'Process for package externalization');
program.parse(process.argv);
const options = program.opts();

// Shrinker core
import * as fs from 'fs';

const activePath: string[] = [];
let distPath: string = 'dist';

const getModulePath = (realPath: string): string => realPath.slice(realPath.lastIndexOf(`${path.sep}node_modules`));
const getPkg = (realPath: string): string => {
  const modulePath = getModulePath(realPath);

  const pathSplit = modulePath.split(path.sep);
  let pkgName = pathSplit[2];
  if (pathSplit[2][0] === '@') pkgName = pathSplit.slice(2, 4).join(path.sep);

  return pkgName;
};

const entry = (request: string, basePath = '', parentIsNpm = true): string => {
  let realPath = '';

  if (request[0] !== '.') {
    try {
      realPath = require.resolve(request, { paths: [basePath] });
    } catch (e) {
      // MODULE_NOT_FOUND
      // console.error(request, e.code)
      return '';
    }
    if (realPath === request) return '';
  } else {
    realPath = require.resolve(path.resolve(basePath, '..', request));
  }

  if (!activePath.includes(realPath)) {
    activePath.push(realPath);
    changeRef(request, realPath);
  }

  const modulePath = getModulePath(realPath);
  const pkgName = getPkg(realPath);

  if (request[0] === '.' && parentIsNpm) {
    let diff = path.relative(`/node_modules/${pkgName}`, modulePath);
    if (diff[0] !== '.') diff = './' + diff;
    diff = diff.split(path.sep).join("/"); // Test if needed on both Win & *nix platforms
    return diff.replace(/\.js$/, '');
  }

  if (request[0] === '.' && !parentIsNpm && realPath === require.resolve(pkgName)) {
    let diff = path.relative(path.dirname(getModulePath(basePath)), `/node_modules/${pkgName}/index`);
    return diff;
  }

  return '';
};

const changeRef = (request: string, realPath: string): void => {
  let code = fs.readFileSync(realPath, 'utf8');
  let refCount = 0;

  const pkgName = getPkg(realPath);

  let target = getModulePath(realPath);
  const notRootDir = pkgName === request && !realPath.endsWith(`${pkgName}/index.js`);
  if (notRootDir) target = `/node_modules/${pkgName}/index.js`;

  code = code.replace(/(^|[^\.\w])require\(['"]([\w\d_\-\.\/@]+)['"]\)/ig, (match, char, lib) => {
    const diff = entry(lib, realPath, request === pkgName);
    if (diff) {
      refCount++;
      return `${char}require('${diff}')`;
    }
    return match;
  });

  if (refCount === 0 && request[0] !== '.' && pkgName === request) {
    if (realPath.endsWith('.js')) target = `/node_modules/${pkgName}.js`;
    else if (realPath.endsWith('.json')) target = `/node_modules/${pkgName}.json`;
  }

  // node v10+
  fs.mkdirSync(path.dirname(distPath + target), { recursive: true });
  fs.writeFileSync(distPath + target, code);
};

const results: {
  total: number;
  shrinked: number;
  skipped: number;
  ignored: number;
  copied: number;
} = { total: 0, shrinked: 0, skipped: 0, ignored: 0, copied: 0 };

let ignore: string[] = [ "deepmerge", 'fs-extra', 'dotenv'];
let asIs: string[] = ["call-bind", 'mongoose', 'mongodb-connection-string-url', 'argparse']; // , '@tootallnate/once', 'i18n', 'messageformat', 'agent-base', 'tsutils', "superagent", 'argparse'
const extractFromDist: string[] = []; // '@tootallnate/once'

// If we need to externalize the project to test the compiled package locally,
// we can't ignore packs of AWS Lambda container.
// We should include them as-is.
if (options.externalize) {
  asIs = [...asIs, ...ignore];
  ignore = [];
}

const rootFolder = process.cwd();
const initialFolder = path.join(rootFolder, 'node_modules');
const distrFolder = path.join(rootFolder, distPath);

console.log("::::::::::: Shrinker ::::::::::::::::::");
console.log('::: Initial Folder: ', initialFolder);
console.log('::: Distr Folder: ', distrFolder);

try {
  fse.rmdirSync(path.join(distrFolder, 'node_modules'), { recursive: true, force: true } as fs.RmDirOptions);
} catch (error) {
  console.log("node_modules folder not found:");
}

const packKeys = Object.keys(packs.packages);
packKeys.forEach((packNameFull: string) => {
  if (packNameFull) {
    results.total++;
    const d = packs.packages[packNameFull];
    const packName = packNameFull.replace("node_modules/", "");
    let pathTo;
    if (d.dev) {
      if (options.verbose) console.log(`${packName} ...dev package, skipped.`);
      results.skipped++;
    } else if (ignore.includes(packName)) {
      if (options.verbose) console.log(`${packName} ...ignored, skipped.`);
      results.ignored++;
    } else if (asIs.includes(packName)) {
      const pathFrom = path.join(initialFolder, packName);
      pathTo = path.join(distrFolder, 'node_modules', packName);
      fse.copySync(pathFrom, pathTo, { overwrite: true });
      if (options.verbose) console.log(`${packName} ...copied as-is.`);
      results.copied++;
    } else {
      if (options.verbose) console.log(`${packName} ...shrinking...`);
      entry(packName);
      if (options.verbose) console.log(`${packName} ...shrinked.`);
      results.shrinked++;
    }

    if (extractFromDist.includes(packName)) {
      fse.move(`${pathTo}\\dist\\index.js`, `${pathTo}\\index.js`);
      if (options.verbose) console.log(`${packName}... extracted from dist`);
    }
  }
});

console.log("::::::::::: Results :::::::::::::::::::");
console.log(":: Total: ", results.total);
console.log(":::::::::::::::::::::::::::::::::::::::");
console.log(":: Skipped: ", results.skipped);
console.log(":: Ignored: ", results.ignored);
console.log(":::::::::::::::::::::::::::::::::::::::");
console.log(":: Shrinked: ", results.shrinked);
console.log(":: Copied: ", results.copied);
console.log(":::::::::::::::::::::::::::::::::::::::");