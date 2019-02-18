const path = require('path');
const { copyDir, copyFile } = require('./files');
const { directories, files, distDirPath } = require('./config');

const build = {};

build.prjDir = () => {
  const errors = [];
  let copyDirCompleted = false;
  let copyFilesCompleted = false;

  directories.forEach(dirName => {
    const dirPathSrc = path.join(__dirname, '..', dirName);
    const dirPathDest = path.join(distDirPath, dirName);

    // console.log(dirPathSrc);
    // console.log(dirPathDest);

    copyDir(dirPathSrc, dirPathDest)
      .then(() => console.log('Success: Folders copyied successfully\n', directories))
      .catch(err => errors.push(err.message))
      .finally(() => {
        copyDirCompleted = true;
        opCompleted();
      });
  });

  files.forEach(fileName => {    
    const filePathSrc = path.join(__dirname, '..', fileName);
    const filePathDest = path.join(distDirPath, fileName);

    copyFile(filePathSrc, filePathDest)
      .then(() => console.log('Success: Copiyng files successfully\n', filePathDest))
      .catch(err => errors.push(err.message))
      .finally(() => {
        copyFilesCompleted = true;
        opCompleted();
      });
  });

  const opCompleted = () => {
    if(copyDirCompleted && copyFilesCompleted) {
      if (errors.length < 1) {
        console.log('Success: build folder created successfully\n', distDirPath);
      } else {
        console.error('Failed: building dist folder, with ', errors.length, ' errors\n', distDirPath);
        errors.forEach(err => {
          console.error(err);
        });
      }
    }
  };
};

build.prjDir();

module.exports = build;
