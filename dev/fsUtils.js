const fs = require('fs');
const path = require('path');
const { systemFiles , paths } = require('./config');

const fsPromises = fs.promises;
const FILE = systemFiles.FILE;
const DIR = systemFiles.DIR;
const handleErr = (err) => console.error(err.message);

const files = {};

files.removeDistDir = () => {
  return new Promise((resolve) => {
    isDirExists(paths.distDir())
      .then(isDirExists => {
        if (isDirExists) {
          files.removeDirectory(paths.distDir())
            .then(() => {
              resolve(true);
            })
            .catch(handleErr);
        } else {
          console.log('The folder doesn\'t exists', paths.distDir());
          resolve(false);
        }
      })
      .catch(handleErr);
  });
};

files.copyDirs = (directories, dirsPathSrc, dirsPathDest) => {
  return new Promise((resolve, rejecte) => {
    const errors = [];
    let count = 0;
    let dirPathSrc = '';
    let dirPathDest = '';

    const opCompleted = () => {
      if (errors.length < 1) {
        resolve();
      } else {
        errors.forEach(handleErr);
        rejecte(`Failed: Copying folder, with ${errors.length}, errors\n ${paths.distDir()}`);
      }
    };

    directories.forEach((dirName) => {
      const re = /[\\|/]+app$/gi;
      dirPathSrc = path.join(dirsPathSrc, dirName);
      dirPathDest = path.join(dirsPathDest, dirName);
      dirPathDest = dirPathDest.replace(re, '');
      
      files.copyDir(dirPathSrc, dirPathDest)
        .then()
        .catch(err => errors.push(err.message))
        .finally(() => {
          count++;
          if (count >= directories.length) opCompleted();
        });
    });
  });
};

files.copyDir = (srcDirPath, destDirPath) => {
  return new Promise((resolve, rejecte) => {
    let count = 0;
    const errors = [];

    const opCompleted = () => {
      if (errors.length < 1) {
        console.log('Folder copied\t', destDirPath);
        resolve();
      } else {
        errors.forEach(handleErr);
        rejecte(`Failed: Copying folder, with${errors.length} errors\n${paths.distDir()}`);
      }
    };

    createDirectory(destDirPath)
      .then(() => getFilesList(srcDirPath)
        .then((itemsPath) => {
          if (itemsPath.length > 0) {
            itemsPath
              .forEach((itemPath) => isDirOrFile(itemPath)
                .then(isFileDir => {
                  if (isFileDir === FILE) {
                    files.copyFile(itemPath, destDirPath)
                      .then()
                      .catch(handleErr)
                      .finally(() => {
                        count++;
                        if (count === itemsPath.length) opCompleted();
                      });
                  } else if (isFileDir === DIR) {
                    const destDirName = path.basename(itemPath);
                    const newDestDirPath = path.join(destDirPath, destDirName);
                    files.copyDir(itemPath, newDestDirPath)
                      .then()
                      .catch(handleErr)
                      .finally(() => {
                        count++;
                        if (count === itemsPath.length) opCompleted();
                      });
                  } else {
                    count++;
                  }
                })
                .catch(handleErr)
              );
          } else {
            resolve();
          }
        })
        .catch(handleErr)
      )
      .catch(handleErr);
  });
};

files.copyFiles = (listFiles, destDirPath) => {
  return new Promise((resolve, rejecte) => {
    const errors = [];
    let count = 0;

    const opCompleted = () => {
      if (errors.length < 1) {
        console.log(`Files copied ${listFiles.length} files\n`, listFiles);
        resolve();
      } else {
        console.error('Failed: Copying files, with ', errors.length, ' errors\n', errors);
        rejecte();
      }
    };

    if (Array.isArray(listFiles) && listFiles.length > 0) {
      listFiles.forEach((item) => {
        isDirOrFile(item)
          .then(isFileDir => {
            if (isFileDir === FILE) {
              files.copyFile(item, destDirPath)
                .then()
                .catch(err => errors.push(err))
                .finally(() => {
                  count++;
                  if (count >= listFiles.length) opCompleted();
                });
            } else if (isFileDir === DIR) {
              files.copyDir(item, destDirPath)
                .then()
                .catch(err => errors.push(err))
                .finally(() => {
                  count++;
                  if (count >= listFiles.length) opCompleted();
                });
            } else {
              count++;
              console.error('Error: Could not copy, must be (file | folder)\n', item);
            }
          })
          .catch(handleErr);
      });
    } else if (listFiles.length < 1) {
      resolve();
    } else {
      rejecte(`Error: It is not an Array of list files\n${listFiles}`);
    }
  });
};

files.copyFile = (srcFilePath, destDirPath) => {
  return new Promise((resolve, rejecte) => {
    const dirName = path.dirname(srcFilePath);
    const baseName = path.basename(srcFilePath);
    const destFilePath = path.join(destDirPath, baseName);

    const copyIt = () => {
      fsPromises.copyFile(srcFilePath, destFilePath)
        .then(() => {
          console.log('File copied\t', destFilePath);
          resolve();
        })
        .catch(handleErr);
    };
    isDirOrFile(dirName)
      .then(isFileDir => {
        if (isFileDir === DIR) {
          isFileDirExists(destDirPath)
            .then(isFileDir => {
              if (isFileDir === DIR) {
                copyIt();
              } else {
                createDirectory(destDirPath)
                  .then(copyIt())
                  .catch(handleErr);
              }
            })
            .catch(handleErr);
        } else {
          // createDirectory(dirName)
          //   .then(copyIt())
          //   .catch(handleErr);
          rejecte({message: `Error: unable to copythe file: ${destFilePath}\nThe directory ${srcFilePath} dosn't exists`});
        }
      })
      .catch(handleErr);
  });
};

files.removeFile = (srcFilePath) => {
  return new Promise((resolve) => fsPromises
    .unlink(srcFilePath)
    .then(() => {
      console.log('File removed\t', srcFilePath);
      resolve();
    })
    .catch(handleErr));
};

files.removeDirectory = (dirPath) => {
  return new Promise((resolve) => {
    let count = 0;

    const opCompleted = () => fsPromises.rmdir(dirPath)
      .then(() => {
        console.log('Folder removed\t', dirPath);
        resolve(dirPath);
      })
      .catch(handleErr);

    isDirExists(dirPath)
      .then(isDirExists => {
        if (isDirExists) {
          getFilesList(dirPath)
            .then((itemsPath) => {
              if (itemsPath.length < 1) {
                opCompleted();
              } else {
                itemsPath
                  .forEach((itemPath) => isDirOrFile(itemPath)
                    .then(isFileDir => {
                      if (isFileDir === FILE) {
                        files.removeFile(itemPath)
                          .then(() => count++)
                          .catch(handleErr)
                          .finally(() => {
                            if (count >= itemsPath.length) opCompleted();
                          });
                      } else if (isFileDir === DIR) {
                        files.removeDirectory(itemPath)
                          .then(() => count++)
                          .catch(handleErr)
                          .finally(() => {
                            if (count >= itemsPath.length) opCompleted();
                          });
                      }
                    })
                    .catch(handleErr)
                  );}
            })
            .catch(handleErr);
        } else {
          resolve(false);
        }
      })
      .catch(handleErr);
  });
};

const isDirOrFile = (ItemPath) => {
  return new Promise((resolve, rejecte) => {
    fsPromises.stat(ItemPath)
      .then(item => {
        if (item.isDirectory()) {
          resolve(DIR);
        } else if (item.isFile()) {
          resolve(FILE);
        } else {
          rejecte('It\'s not a file or a folder', ItemPath);
        }
      })
      .catch(handleErr);
  });
};

const isDirExists = (dirPath) => {
  return new Promise((resolve) => {
    fsPromises.stat(dirPath)
      .then(() => {
        isDirOrFile(dirPath)
          .then(isFileDir => {
            const isDir = isFileDir === DIR ? true : false;
            resolve(isDir);
          })
          .catch(handleErr);
      })
      .catch(err => {
        if (err.code ===  'ENOENT') resolve(false);
      });
  });
};

const isFileDirExists = (dirPath) => {
  return new Promise((resolve) => {
    fsPromises.stat(dirPath)
      .then(() => resolve(true))
      .catch(err => {
        if (err.code ===  'ENOENT') resolve(false);
      });
  });
};

const createDirectory = (dirPath) => {
  return new Promise((resolve) => {
    isDirExists(dirPath)
      .then(isDirExists => {
        if (!isDirExists) {
          fsPromises.mkdir(dirPath, { recursive: true })
            .then(() => {
              console.log('Folder created\t', dirPath);
              resolve();
            })
            .catch(handleErr);
        } else {
          resolve();
        }
      })
      .catch(handleErr);
  });
};

const getFilesList = (dirPath) => {
  return new Promise((resolve) => fsPromises.readdir(dirPath)
    .then(filesName => {
      let filesList = filesName.map(fileName => {
        return path.join(dirPath, fileName);
      });
      filesList = Array.isArray(filesList) && filesList.length > 0 ? filesList : [];
      resolve(filesList);
    })
    .catch(handleErr));
};

module.exports = files;
