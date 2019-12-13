'use strict';

if (!process.env.ARTIFACTORY_URL) {
  throw new Error('ARTIFACTORY_URL environment variable must be set');
}

const path = require('path');
const execSync = require('child_process').execSync;
const branch = execSync(`git branch --show-current`).toString().trim();
const CI = process.env.BRANCH && branch === process.env.BRANCH;
const isTopicBranch = branch !== 'master';

let versionSuffix = '';
if (isTopicBranch) {
  const sha = execSync(`git log ${branch} | head -1`).toString().trim().split(' ')[1];
  versionSuffix = '-beta.' + sha.substring(sha.length - 8);
  console.log(`Using version suffix "${versionSuffix}"`);
}

const registry=`${process.env.ARTIFACTORY_URL}/api/npm/npm-okta`;
const workspacesInfo = JSON.parse(execSync(`yarn workspaces info --json`).toString());
const workspaces = JSON.parse(workspacesInfo.data);

let hasPublishedAPackage = false;
Object.keys(workspaces).forEach(name => {
  const moduleDir = path.resolve(__dirname, '..', workspaces[name].location);
  const pkg = require(`${moduleDir}/package`);

  // Skip private packages
  if (pkg.private) {
    console.log(`Skipping private package ${name}`);
    return;
  }

  let pkgVersion = pkg.version + versionSuffix;
  if (versionSuffix && CI) {
    // Update package.json with the beta version
    execSync(`npm version ${pkgVersion}`);
  }

  const moduleWithVersion = `${pkg.name}@${pkgVersion}`;

  console.log(`Checking if ${moduleWithVersion} exists`);

  let isInPublicNpm = false;
  try {
    isInPublicNpm = !!execSync(`npm view ${moduleWithVersion} --registry ${registry}`).toString();
  } catch (err) {
    // We expect packages that do not exist to throw a 404 error
    console.log(`${pkg.name} does not have any published versions`);
  }

  if (isInPublicNpm) {
    console.log(`${moduleWithVersion} exists`);
  } else if (CI) {
    console.log(`Publishing ${moduleWithVersion}`);
    execSync(`npm publish --registry ${registry}`, {
      cwd: moduleDir
    });
    hasPublishedAPackage = true;
  } else {
    console.log(`Not publishing ${moduleWithVersion} because not running in a CI environment`);
  }
});

if (hasPublishedAPackage && !isTopicBranch) {
  execSync('git tag -f last-published && git push -f origin last-published');
}

console.log(`Finished syncing latest packages to npm registry: ${registry}`);
