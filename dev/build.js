const path = require('path');

const zipFolder = require('./zipFolder');
const { fixDependecies } = require('./utils');
const { copyDirs, copyFiles, removeDistDir } = require('./fsUtils');
const { getProjectName } = require('./utils');
const { directories, files, options, paths, prj } = require('./config');

let projectName = '';
let makeZip = options.makeZip;
const dirsPathSrc = path.join(__dirname, '..');
const filesPaths = files.map(fileName => path.join(dirsPathSrc, fileName));
const makeAppDir = options.createAppDir ? 'app' : '';
let DestProjectDirPath = path.join(paths.distDir(), prj.defaultName, makeAppDir);
let destJsDirPath = path.join(DestProjectDirPath, paths.jsExt());
const handleErr = (err) => console.error(err.message);

const build = {};

build.prjDir = () => {

  const init = () => {
    process.argv.forEach((arg) => {
      makeZip = arg === '-zip' || arg === '-z' || arg === '-Z' ? true : makeZip;
    });
    const editProjectNameDependencies = () => {
      DestProjectDirPath = path.join(paths.distDir(), projectName, makeAppDir);
      destJsDirPath = path.join(DestProjectDirPath, paths.jsExt());
    };
    getProjectName((err, prjName) => {
      projectName = prjName;
      if (!projectName) {
        console.error(`
          Unable to define the project name, make sure the project name is defined on:
          config.js or manifest.json
        `);
        process.exit(1);
      } else if (err) {
        console.error(err.message);
        console.log('Project Name to default:', projectName);
      } 
      editProjectNameDependencies();
      makeBuild();
    });
  };

  const makeBuild = () => {
    console.log('\n\n### Building project \t"', projectName, '"\n');
    console.log('## Removing the distribution directory\n->', paths.distDir(), '\n');
    removeDistDir(paths.distDir())
      .then(() => {
        console.log('\tDistribution directory removed\n\n');
        console.log('## Creating the new folder project\n->', DestProjectDirPath, '\n');
        console.log('\n# Copying the directories\n', directories, '\n');
        copyDirs(directories, dirsPathSrc, DestProjectDirPath)
          .then(() => {
            console.log('\tDirectories copied\n');
            if (filesPaths.length > 0) console.log('# Copying the files\n', filesPaths, '\n');
            copyFiles(filesPaths, DestProjectDirPath)
              .then(() => {
                if (filesPaths.length > 0) console.log('# Files copied\n');
              })
              .catch(handleErr)
              .finally(() => {
                console.log('\n# Fixing manifest file dependencies\n');
                fixDependecies(destJsDirPath, DestProjectDirPath)
                  .then(() => {
                    console.log('\tFixation complete');
                    console.log('\n==> Building Operation succeed.');
                  })
                  .catch(handleErr)
                  .finally(() => {
                    if(makeZip) {
                      console.log('\n# Creating zip file for Firefox browser compatibility');
                      zipFolder(DestProjectDirPath)
                        .then(() => console.log('==> Generating Zip file succeed\n'))
                        .catch(handleErr);
                    }
                  });
              });
          })
          .catch(handleErr);
      })
      .catch(handleErr);
  };

  init();
};

build.prjDir();

module.exports = build;
