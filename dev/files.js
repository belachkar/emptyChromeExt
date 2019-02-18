const fs = require('fs');
const path = require('path');
const { systemFiles , distDirPath } = require('./config');
const fsPromises = fs.promises;

const FILE = systemFiles.FILE;
const DIR = systemFiles.DIR;

const files = {};

files.removeDistDir = () => {
  isDirOrFile(distDirPath)
    .then((isDir) => {
      if (isDir === FILE) {
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

files.copyDirs = (directories, dirsPathSrc, dirsPathDest) => {
  return new Promise((resolved, rejected) => {
    const errors = [];
    let count = 0;

    const opCompleted = () => {
      console.log(count);
      if (errors.length < 1) {
        console.log('Success: Copying folder successfully\n', distDirPath);
        resolved();
      } else {
        console.error('Failed: Copying folder, with ', errors.length, ' errors\n', distDirPath);
        errors.forEach(err => console.error(err));
        rejected();
      }
    };

    directories.forEach((dirName) => {
      const dirPathSrc = path.join(dirsPathSrc, dirName);
      const dirPathDest = path.join(dirsPathDest, dirName);
      
      console.log(dirPathSrc);
      console.log(dirPathDest);
  
      files.copyDir(dirPathSrc, dirPathDest)
        .then(() => {
          count++;
          console.log('Success: Folder copied successfully\n', dirPathDest);
        })
        .catch(err => {
          count++;
          errors.push(err.message);
        })
        // .catch(err => console.error(err.message))
        .finally(() => {
          if (count >= directories.length) opCompleted();
        });
    });
  });
};

files.copyDir = (srcDirPath, destDirPath) => {
  return new Promise((resolved) => {
    isDirOrFile(srcDirPath)
      .then((isDir) => {
        if (isDir === FILE) {
          createDirectory(destDirPath)
            .then(() => {
              getFilesList(srcDirPath)
                .then((filesPath) => {
                  console.log(filesPath);
                  console.log(destDirPath);
                  files.copyFiles(filesPath, destDirPath)
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

files.copyFiles = (listFiles, destDirPath) => {
  return new Promise((resolved, rejected) => {
    const errors = [];
    let count = 0;

    const opCompleted = () => {
      console.log(count);
      if (errors.length < 1) {
        console.log('Success: Copying folder successfully\n', distDirPath);
        resolved();
      } else {
        console.error('Failed: Copying folder, with ', errors.length, ' errors\n', distDirPath);
        errors.forEach(err => console.error(err));
        rejected();
      }
    };

    if (Array.isArray(listFiles)) {
      listFiles.forEach((item) => {
        isDirOrFile(item)
          .then(isFileDir => {
            count++;
            if (isFileDir === FILE) {
              files.copyFile(item, destDirPath)
                .then()
                .catch(err => errors.push(err.message));
            } else if (isFileDir === DIR) {
              files.copyDir(item, destDirPath)
                .then()
                .catch(err => errors.push(err.message));
            } else {
              console.error('Error: Could not copy, must be (file | directory)\n', item);
            }
          })
          .catch(err => {
            count++;
            console.error(err.message);
          })
          .finally(() => {
            if (count >= listFiles.length) opCompleted();
          });
      });
    } else {
      console.error('Error: It is not an Array of list files\n', listFiles);
    }
  });
};

files.copyFile = (srcFilePath, destDirPath) => {
  return new Promise((resolved) => {
    const dirName = path.dirname(srcFilePath);
    const baseName = path.basename(srcFilePath);
    const destFilePath = path.join(destDirPath, baseName);

    const copyIt = () => {
      fsPromises.copyFile(srcFilePath, destFilePath)
        .then(resolved())
        .catch(err => console.error(err.message));
    };
    isDirOrFile(dirName)
      .then(isFileDir => {
        if (isFileDir === DIR) {
          copyIt();
        } else {
          createDirectory(dirName)
            .then(copyIt())
            .catch(err => console.error(err.message));
        }
      })
      .catch(err => console.error(err.message));
  });
};

const isDirOrFile = (DirName) => {
  return new Promise((resolved, rejected) => {
    fsPromises.stat(DirName)
      .then(dir => {
        if (dir.isDirectory) {
          resolved(FILE);
        } else if (dir.isFile) {
          resolved(DIR);
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
    fsPromises.mkdir(dirPath, { recursive: true })
      .then(() => resolved())
      .catch(err => console.error(err.message));
  });
};

const getFilesList = (dirPath) => {
  return new Promise((resolved) => {
    fsPromises.readdir(dirPath)
      .then(filesName => {
        const filesList = filesName.map(fileName => {
          return path.join(dirPath, fileName);
        });
        resolved(filesList);
      })
      .catch(err => console.error(err.message));
  });
};

module.exports = files;
