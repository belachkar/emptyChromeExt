const path = require('path');
const { copyDirs, copyFiles } = require('./files');
const { directories, files, distDirPath } = require('./config');

const build = {};

build.prjDir = () => {
  const dirsPathSrc = path.join(__dirname, '..');
  const filesPath = files.map(fileName => path.join(dirsPathSrc, fileName));

  copyDirs(directories, dirsPathSrc, distDirPath)
    .then()
    .catch(err => console.error(err.message));

  copyFiles(filesPath, distDirPath)
    .then()
    .catch(err => console.error(err.message));
};

build.prjDir();

module.exports = build;
