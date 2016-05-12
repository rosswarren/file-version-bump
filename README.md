# File Version Bump

[![npm version](https://img.shields.io/npm/v/file-version-bump.svg?style=flat-square)](https://www.npmjs.com/package/file-version-bump)

`file-version-bump` is an NPM module that works with the built in `npm version` command to update semver version numbers in files other than `package.json`. This all conveniently configured in your `package.json`.


## Usage
Use the standard `npm version` comands. For example:

```sh
npm version patch
```

[See here for more info](https://docs.npmjs.com/cli/version).

## Installation

It is advised to install `file-version-bump` as a `devDependencies` in your `package.json`, as you will only need this for development purposes. To install this module, simply run:

```sh
npm install --save-dev file-version-bump
```

## Configuration
```json
{
  "name": "my-amazing-module",
  "version": "0.0.0",
  "main": "index.js",
  "scripts": {
    "test": "exit 1",
    "version": "file-version-bump"
  },
  "file-version-bump": [
    "scss/_version.scss",
    "README.md"
  ]
}
```

You need to add both the `scripts` entry for `file-version-bump` and also the `file-version-bump` entry with an array of globs specifying the files that you would like to have bumped.
