const path = require('path');

const zipFolder = require('./zipFolder');
const { fixDependecies } = require('./utils');
const { copyDirs, copyFiles, removeDistDir } = require('./fsUtils');
const { getProjectName } = require('./utils');
const { directories, files, distDirPath, cfgProjectName, defaultPrjName, jsExtPath, createAppDir, makeZipDefault } = require('./config');

const handleErr = err => console.error(err.message);
const dirsPathSrc = path.join(__dirname, '..');
const filesPath = files.map(fileName => path.join(dirsPathSrc, fileName));
const makeAppDir = createAppDir ? 'app' : '';
let DestProjectDirPath = path.join(distDirPath, defaultPrjName, makeAppDir);
let destJsDirPath = path.join(DestProjectDirPath, jsExtPath);
let makeZip = makeZipDefault;

const build = {};

build.prjDir = () => {

  const init = () => {
    process.argv.forEach((arg) => {
      makeZip = arg === '-zip' || arg === '-z' || arg === '-Z' ? true : makeZip;
    });
    const editProjectName = (newPrjName) => {
      DestProjectDirPath = path.join(distDirPath, newPrjName, makeAppDir);
      destJsDirPath = path.join(DestProjectDirPath, jsExtPath);
    };
    if (cfgProjectName) {
      editProjectName(cfgProjectName);
      makeBuild();
    } else {
      getProjectName((err, prjName) => {
        if (!err && prjName) {
          editProjectName(prjName);
          makeBuild();
        } else {
          console.error(err.message);
          console.log('Project Name to default:', defaultPrjName);
          makeBuild();
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
              fixDependecies(destJsDirPath, DestProjectDirPath);
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
