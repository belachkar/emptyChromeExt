const path = require('path');

const zipFolder = require('./zipFolder');
const { copyDirs, copyFiles, removeDistDir } = require('./fsUtils');
const { getProjectName } = require('./utils');
const { directories, files, distDirPath, cfgProjectName, defaultPrjName } = require('./config');

const handleErr = err => console.error(err.message);
const dirsPathSrc = path.join(__dirname, '..');
const filesPath = files.map(fileName => path.join(dirsPathSrc, fileName));
let DestProjectDirPath = path.join(distDirPath, defaultPrjName);
let makeZip = false;

const build = {};

build.prjDir = () => {

  const init = () => {
    process.argv.forEach((arg) => {
      makeZip = arg === '-zip' || arg === '-z' || arg === '-Z' ? true : makeZip;
    });

    if (cfgProjectName) {
      DestProjectDirPath = path.join(distDirPath, cfgProjectName);
      makeBuild();
    } else {
      getProjectName((err, prjName) => {
        if (!err && prjName) {
          DestProjectDirPath = path.join(distDirPath, prjName);
          makeBuild();
        } else {
          console.error(err.message);
        }
      });
    }
  };

  const makeBuild = () => {
    console.log('# Start building project');
    removeDistDir(distDirPath)
      .then(() => {
        console.log('## Start creating the new folder project\n', DestProjectDirPath);
        copyDirs(directories, dirsPathSrc, DestProjectDirPath)
          .then(() => copyFiles(filesPath, DestProjectDirPath)
            .then(() => {
              console.log('\n=> Building Operation succeed.');
              if(makeZip) {
                zipFolder(DestProjectDirPath)
                  .then(() => console.log('=> Building Zip Operation succeed.'))
                  .catch(handleErr);
              }
            })
            .catch(handleErr)
          )
          .catch(handleErr);
      })
      .catch(handleErr);
  };

  init();
};

build.prjDir();

module.exports = build;
