#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const P = require('promalom');
const glob = require('glob');
const exec = P.promisify(require('child_process').exec);

const packageJSON = require(path.join(process.cwd(), 'package.json'));
const fileBumpConfig = packageJSON['file-version-bump'];

function runGitAdd(file) {
  return exec(`git add ${file}`, {
    cwd: process.cwd()
  });
}

// eslint-disable-next-line max-len
const semverRegex = /(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?/ig;

function processGlobString(globString) {
  return P.promisify(glob)(globString, {}).then(files => {
    if (files.length === 0) {
      return null;
    }

    return P.series(files.map(filePath => {
      console.log(`found file ${filePath}`);

      return () => P.promisify(fs.readFile)(
        path.join(process.cwd(), filePath),
        'utf8'
      ).then(fileContents => {
        fileContents.match(semverRegex).forEach(match => {
          console.log(`${match} ==> ${packageJSON.version}`);
        });

        return P.promisify(fs.writeFile)(
          path.join(process.cwd(), filePath),
          fileContents.replace(semverRegex, packageJSON.version)
        ).then(() => runGitAdd(filePath));
      }).catch(err => {
        console.log(err);
      });
    }));
  });
}

if (!Array.isArray(fileBumpConfig)) {
  console.log(`
    No file-version-bump config found.
    Please add to your package.json.
    See https://github.com/rosswarren/file-version-bump#configuration for examples.
  `);
} else {
  P.series(fileBumpConfig.map(globString => () => {
    console.log(`- Glob is ${globString}`);
    return processGlobString(globString);
  }));
}
