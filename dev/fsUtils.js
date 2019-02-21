const fs = require('fs');
const path = require('path');
const { systemFiles , distDirPath } = require('./config');

const fsPromises = fs.promises;
const FILE = systemFiles.FILE;
const DIR = systemFiles.DIR;

const files = {};

const handleErr = err => console.error(err.message);

files.removeDistDir = () => {
  return new Promise((resolve) => {
    console.log('## Removing distribution directory\n', distDirPath);
    isDirExists(distDirPath)
      .then(isDirExists => {
        if (isDirExists) {
          files.removeDirectory(distDirPath)
            .then(() => {
              console.log('## Distribution Directory Removed');
              resolve(true);
            })
            .catch(handleErr);
        } else {
          console.log('The directory doesn\'t exists', distDirPath);
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

    const opCompleted = () => {
      if (errors.length < 1) {
        console.log(`Directories copied ${directories.length} dirs\n`, directories);
        resolve();
      } else {
        errors.forEach(handleErr);
        rejecte(`Failed: Copying folder, with ${errors.length}, errors\n ${distDirPath}`);
      }
    };

    directories.forEach((dirName) => {
      const dirPathSrc = path.join(dirsPathSrc, dirName);
      const dirPathDest = path.join(dirsPathDest, dirName);
  
      files.copyDir(dirPathSrc, dirPathDest)
        .then(() => {
          count++;
        })
        .catch(err => {
          count++;
          errors.push(err.message);
        })
        .finally(() => {
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
        console.log('Folder copied', destDirPath);
        resolve();
      } else {
        console.error('Failed: Copying folder, with ', errors.length, ' errors\n', distDirPath);
        errors.forEach(handleErr);
        rejecte();
      }
    };

    createDirectory(destDirPath)
      .then(() => getFilesList(srcDirPath)
        .then((itemsPath) => itemsPath
          .forEach((itemPath) => isDirOrFile(itemPath)
            .then(isFileDir => {
              if (isFileDir === FILE) {
                files.copyFile(itemPath, destDirPath)
                  .then(() => count++)
                  .catch(handleErr)
                  .finally(() => {
                    if (count >= itemsPath.length) opCompleted();
                  });
              } else if (isFileDir === DIR) {
                files.copyDir(itemPath, destDirPath)
                  .then(() => count++)
                  .catch(handleErr)
                  .finally(() => {
                    if (count >= itemsPath.length) opCompleted();
                  });
              }
            })
            .catch(handleErr)
          ))
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
        console.error('Failed: Copying files, with ', errors.length, ' errors\n', listFiles);
        rejecte();
      }
    };

    if (Array.isArray(listFiles)) {
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
              console.error('Error: Could not copy, must be (file | directory)\n', item);
            }
          })
          .catch(handleErr)
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
  return new Promise((resolve) => {
    const dirName = path.dirname(srcFilePath);
    const baseName = path.basename(srcFilePath);
    const destFilePath = path.join(destDirPath, baseName);

    const copyIt = () => {
      fsPromises.copyFile(srcFilePath, destFilePath)
        .then(() => {
          console.log('File copied', destFilePath);
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
                  .then(() => copyIt())
                  .catch(handleErr);
              }
            })
            .catch(handleErr);
        } else {
          createDirectory(dirName).then(copyIt()).catch(handleErr);
        }
      })
      .catch(handleErr);
  });
};

files.removeFile = (srcFilePath) => {
  return new Promise((resolve) => fsPromises
    .unlink(srcFilePath)
    .then(() => {
      console.log('File removed', srcFilePath);
      resolve();
    })
    .catch(handleErr));
};

files.removeDirectory = (dirPath) => {
  return new Promise((resolve) => {
    let count = 0;

    const opCompleted = () => fsPromises.rmdir(dirPath)
      .then(() => {
        console.log('Folder removed', dirPath);
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
          rejecte('It\'s not a file or a directory', ItemPath);
        }
      })
      .catch(handleErr);
  });
};

const isFileExists = (filePath) => {
  return new Promise((resolve) => {
    fsPromises.stat(filePath)
      .then(() => {
        isDirOrFile(filePath)
          .then(isFileDir => {
            const isFile = isFileDir === FILE ? true : false;
            resolve(isFile);
          })
          .catch(handleErr);
      })
      .catch(err => {
        if (err.code ===  'ENOENT') resolve(false);
      });
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
              console.log('Directory created', dirPath);
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
      const filesList = filesName.map(fileName => {
        return path.join(dirPath, fileName);
      });
      resolve(filesList);
    })
    .catch(handleErr));
};

module.exports = files;
