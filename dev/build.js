const path = require('path');
const { copyDirs, copyFiles, removeDistDir } = require('./fsUtils');
const { getProjectName } = require('./utils');
const { directories, files, distDirPath, cfgProjectName, defaultPrjName } = require('./config');

const handleErr = err => console.error(err.message);
const build = {};

build.prjDir = () => {
  const dirsPathSrc = path.join(__dirname, '..');
  const filesPath = files.map(fileName => path.join(dirsPathSrc, fileName));
  let DestProjectDirPath = defaultPrjName;

  const init = () => {
    if (cfgProjectName) {
      DestProjectDirPath = path.join(distDirPath, cfgProjectName);
    } else {
      getProjectName((err, prjName) => {
        if (!err && prjName) {
          DestProjectDirPath = path.join(distDirPath, prjName);
        } else {
          console.error(err.message);
        }
      });
    }
    makeBuild();
  };

  const makeBuild = () => {
    console.log('# Start building project');
    removeDistDir(distDirPath)
      .then(() => {
        console.log('## Start creating the new folder project', DestProjectDirPath);
        copyDirs(directories, dirsPathSrc, DestProjectDirPath)
          .then(() => copyFiles(filesPath, DestProjectDirPath)
            .then(() => console.log('\n=> Building Operation succeed.'))
            .catch(handleErr)
          )
          .catch(handleErr);
      }
      )
      .catch(handleErr);
  };

  init();
};

build.prjDir();

module.exports = build;
