const fs = require('fs');
const { systemFilesList, distDirPath } = require('./config');
const fsPromises = fs.promises;

const files = {};

files.removeDistDir = () => {
  isDirOrFile(distDirPath)
    .then((isDir) => {
      if (isDir === systemFilesList[0]) {
        removeDirectory(distDirPath)
          .then(dir => console.log('Success: directory removed\n', dir))
          .catch(err => console.error('Error: Could not remove directory\n', err.message));
      } else {
        console.error('Error: Could not remove directory, probably a file\n', distDirPath);
      }
    })
    .catch(err => console.error('Error: Could not find the directory or not a directory\n', err.message));
};

files.createDistDir = () => {
  createDirectory(distDirPath)
    .then()
    .catch(err => console.error(err.message));
};

files.copyDir = (srcDirPath, destDirPath) => {
  return new Promise((resolved) => {
    isDirOrFile(srcDirPath)
      .then((isDir) => {
        if (isDir === systemFilesList[0]) {
          createDirectory(destDirPath)
            .then(() => {
              getFilesList(srcDirPath)
                .then((files) => {
                  copyFiles(files, destDirPath)
                    .then(resolved)
                    .catch(err => console.error(err.message));
                })
                .catch(err => console.error(err.message));
            })
            .catch(err => console.error(err.message));
        } else {
          console.error('Error: Could not remove directory, probably a file\n', srcDirPath);
        }
      })
      .catch(err => console.error(err.message));
  });
};

const copyFiles = (listFiles, destFilePath) => {
  const errors = [];
  return new Promise((resolved, rejected) => {
    if (Array.isArray(listFiles)) {
      listFiles.forEach((item) => {
        isDirOrFile(item)
          .then(isFile => {
            if (isFile === systemFilesList[1]) {
              files.copyFile(item, destFilePath)
                .then()
                .catch(err => errors.push(err.message));
            } else if (isFile === systemFilesList[0]) {
              files.copyDir(item, destFilePath)
                .then()
                .catch(err => errors.push(err.message));
            } else {
              console.error('Error: Could not copy, must be (file | directory)\n', item);
            }
          })
          .catch(err => console.error(err.message))
          .finally(() => {
            if (errors.length < 1) {
              console.log(listFiles);
              console.log('Success: copying files\n');
              resolved();
            } else {
              console.error('Failed: copying all the files, with ', errors.length, ' errors\n', listFiles);
              errors.forEach(err => console.error(err));
              rejected();
            }
          });
      });
    } else {
      console.error('Error: It is not an Array of list files\n', listFiles);
    }
  });
};

files.copyFile = (srcFilePath, destFilePath) => {
  return new Promise((resolved) => {
    fsPromises.copyFile(srcFilePath, destFilePath)
      .then(resolved())
      .catch(err => console.error(err.message));
  });
};

const isDirOrFile = (DirName) => {
  return new Promise((resolved, rejected) => {
    fsPromises.stat(DirName)
      .then(dir => {
        if (dir.isDirectory) {
          resolved(systemFilesList[0]);
        } else if (dir.isFile) {
          resolved(systemFilesList[1]);
        } else {
          rejected();
        }
      })
      .catch(err => console.error(err.message));
  });
};

const removeDirectory = (dirPath) => {
  return new Promise((resolved) => {
    fsPromises.rmdir(dirPath)
      .then(() => {
        resolved(dirPath);
      })
      .catch(err => console.error(err.message));
  });
};

const createDirectory = (dirPath) => {
  return new Promise((resolved) => {
    fsPromises.mkdir(dirPath)
      .then(() => {
        console.log('Success: Creating the Dir\n', dirPath);
        resolved();
      })
      .catch(err => console.error(err.message));
  });
};

const getFilesList = (dirName) => {
  return new Promise((resolved) => {
    fsPromises.readdir(dirName)
      .then(files => resolved(files))
      .catch(err => console.error(err.message));
  });
};

module.exports = files;
