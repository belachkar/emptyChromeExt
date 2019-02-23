const fs = require('fs');
const path = require('path');

const { copyFile } = require('./fsUtils');
const { jsExtPath } = require('./config');

const manifestFileName = 'manifest.json';
const manifestFilePath = path.join(__dirname, '..', 'app', manifestFileName);
const handleErr = err => console.error(err.message);

const utils = {};

utils.getProjectName = (callback) => {
  let prjName = '';

  fs.readFile(manifestFilePath, (err, file) => {
    if (!err) {
      try {
        const manifestObject = JSON.parse(file);
        prjName = manifestObject && manifestObject.name && manifestObject.name.trim() ?
          manifestObject.name.trim() :
          '';
        callback(null, prjName);
      } catch (e) {
        callback(e, null);
      }
    } else {
      callback(err, null);
    }
    return '';
  });
};

utils.fixDependecies = (destJsDirPath, DestProjectDirPath) => {
  let jsList = null;
  const newJsList = [];
  const newManifestFilePath = path.join(DestProjectDirPath, manifestFileName);
  const createNewManifestFile = (data) => {
    fs.writeFile(newManifestFilePath, {flag: 'r+'}, data, (err) => {
      if(!err) {
        console.log('Manifest file edited with success.');
      } else {
        console.error(handleErr);
      }
    });
  };

  fs.readFile(newManifestFilePath, (err, file) => {
    if (!err) {
      try {
        const manifestObject = JSON.parse(file);
        jsList = manifestObject && manifestObject['content_scripts'] && manifestObject['content_scripts'][0]['js'].length > 0 ?
          manifestObject['content_scripts'][0]['js'] :
          null;
        console.log(jsList);
        jsList.forEach(jsPath => {
          const re = /[\w/.-]*node_modules[\w/.-]*(\/{1}[\w.-]*)/gi;
          let newJsPath = jsPath.replace(re, `${jsExtPath}$1`);
          // let extJsPath = newJsPath;
          if (newJsPath !== jsPath) {
            newJsPath = newJsPath.replace(/\\\\|\\/gi, '/');
            const newPath = path.join(__dirname, jsPath);
            copyFile(newPath, destJsDirPath)
              .then()
              .catch(handleErr);
          }
          newJsList.push(newJsPath);
          manifestObject['content_scripts'][0]['js'] = [...newJsList];
          createNewManifestFile(manifestObject);
        });
        console.log(newJsList);
      } catch (e) {
        console.error(e);
      }
    } else {
      console.error(err);
    }
    return '';
  });
};

module.exports = utils;
