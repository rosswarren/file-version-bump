const fs = require('fs');
const path = require('path');
const P = require('promalom');
const assert = require('assert');
const rimraf = P.promisify(require('rimraf'));
const exec = P.promisify(require('child_process').exec);

describe('integration', function() {
  this.timeout(20000);

  it('shows a message if no config present', () =>
    exec('npm link', {
      cwd: process.cwd()
    })
    .then(() => rimraf('./bumptest'))
    .then(() => P.promisify(fs.mkdir)('./bumptest'))
    .then(() => P.promisify(fs.writeFile)('./bumptest/package.json',
`
{
  "name": "bumptest",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "exit 1",
    "version": "file-version-bump"
  },
  "author": "",
  "license": "ISC"
}
`
    ))
    .then(() => exec('npm link file-version-bump', {
      cwd: path.join(process.cwd(), 'bumptest')
    }))
    .then(() => exec('npm version minor', {
      cwd: path.join(process.cwd(), 'bumptest')
    }))
    .then((stdout) => {
      assert(stdout.indexOf('No file-version-bump config') !== -1);
    })
  );

  it('bumps the files specified in the package.json', () =>
    exec('npm link', {
      cwd: process.cwd()
    })
    .then(() => rimraf('./bumptest'))
    .then(() => P.promisify(fs.mkdir)('./bumptest'))
    .then(() => exec('git init', {
      cwd: path.join(process.cwd(), 'bumptest')
    }))
    .then(() => P.promisify(fs.writeFile)('./bumptest/package.json',
`
{
  "name": "bumptest",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "exit 1",
    "version": "file-version-bump"
  },
  "file-version-bump": [
    "README.md",
    "doesnotexist",
    "src/**/*.{js,json}"
  ],
  "author": "",
  "license": "ISC"
}
`
    ))
    .then(() => P.promisify(fs.mkdir)('./bumptest/src'))
    .then(() => P.promisify(fs.writeFile)('./bumptest/src/something.json',
`
{
  "version": "1.0.0"
}
`
    ))
    .then(() => P.promisify(fs.writeFile)('./bumptest/src/version.js',
`
module.exports = 'v0.2.3';
`
    ))
    .then(() => P.promisify(fs.writeFile)('./bumptest/README.md',
`
A repository for testing the file-version-bump repo v0.3.5 and 1.2.3
8.8.2
`
    ))
    .then(() => exec('git add .', {
      cwd: path.join(process.cwd(), 'bumptest')
    }))
    .then(() => exec('git commit -m "first"', {
      cwd: path.join(process.cwd(), 'bumptest')
    }))
    .then(() => exec('npm link file-version-bump', {
      cwd: path.join(process.cwd(), 'bumptest')
    }))
    .then(() => exec('npm version minor', {
      cwd: path.join(process.cwd(), 'bumptest')
    }))
    .then((stdout, stderr) => {
      console.error(stderr);

      assert.deepEqual(stdout.split('\n').slice(0, 1), [
        'v1.1.0'
      ]);

      assert.deepEqual(stdout.split('\n').slice(3), [
        '> file-version-bump',
        '',
        '- Glob is README.md',
        'found file README.md',
        '0.3.5 ==> 1.1.0',
        '1.2.3 ==> 1.1.0',
        '8.8.2 ==> 1.1.0',
        '- Glob is doesnotexist',
        '- Glob is src/**/*.{js,json}',
        'found file src/something.json',
        'found file src/version.js',
        '1.0.0 ==> 1.1.0',
        '0.2.3 ==> 1.1.0',
        ''
      ]);
    })
  );
});
