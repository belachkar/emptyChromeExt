const fs = require('fs');
const path = require('path');

const { copyFile } = require('./fsUtils');
const { jsonWhiteSpacesCfg, prj, paths, manifestFileName } = require('./config');

const handleErr = (err) => console.error(err.message);
let jsonWhiteSpaces = 2;

const utils = {};

utils.getProjectName = (callback) => {
  let prjName = prj.name;
  const defaultPrjName = prj.defaultName ? prj.defaultName: 'myProject';

  if (prjName) {
    callback(null, prjName);
  } else {
    fs.readFile(paths.manifestFile(), (err, file) => {
      if (!err) {
        try {
          const manifestObject = JSON.parse(file);
          prjName =
            manifestObject && manifestObject.name && manifestObject.name.trim()
              ? manifestObject.name.trim()
              : defaultPrjName;
          callback(null, prjName);
        } catch (e) {
          callback(e, defaultPrjName);
        }
      } else {
        callback(err, defaultPrjName);
      }
    });
  }
};

utils.fixDependecies = (destJsDirPath, DestProjectDirPath) => {
  return new Promise((resolve, reject) => {
    let jsList = null;
    const newJsList = [];
    const newManifestFilePath = path.join(DestProjectDirPath, manifestFileName);
  
    const createNewManifestFile = (data) => {
      console.log('Creating new manifest file');
      const newObject = JSON.stringify(data, null, jsonWhiteSpaces);
      fs.writeFile(newManifestFilePath, newObject, 'utf8', (err) => {
        if (!err) {
          console.log('Manifest file edited with success.');
          resolve(true);
        } else {
          console.error(handleErr(err));
          reject(err);
        }
      });
    };
  
    fs.readFile(newManifestFilePath, 'utf8', (err, file) => {
      if (!err) {
        try {
          jsonWhiteSpaces = utils.getWhiteSpaces(file);
          const manifestObject = JSON.parse(file);
          jsList =
            manifestObject &&
            manifestObject['content_scripts'] &&
            manifestObject['content_scripts'][0]['js'] &&
            manifestObject['content_scripts'][0]['js'].length > 0
              ? manifestObject['content_scripts'][0]['js']
              : null;
          if (Array.isArray(jsList) && jsList.length > 0) {
            console.log('manifest file content_scripts array detected\n', jsList);
            let count = 0;
            jsList.forEach((jsPath) => {
              const re = /[\w/.-]*node_modules[\w/.-]*(\/{1}[\w.-]*)/gi;
              let newJsPath = jsPath.replace(re, `${paths.jsExt()}$1`);
              if (newJsPath !== jsPath) {
                newJsPath = newJsPath.replace(/\\\\|\\/gi, '/');
                const newPath = path.join(__dirname, jsPath);
                copyFile(newPath, destJsDirPath)
                  .then()
                  .catch(handleErr)
                  .finally(() => {
                    count++;
                    if (count === jsList.length) {
                      createNewManifestFile(manifestObject);
                    }
                  });
              } else{
                count++;
              }
              newJsList.push(newJsPath);
            });
            manifestObject['content_scripts'][0]['js'] = [ ...newJsList ];
            console.log('The new manifest file content_scripts array\n', newJsList);
          } else {
            console.log('manifest file content_scripts array not detected');
            resolve(true);
          }
        } catch (e) {
          reject(e);
        }
      } else {
        reject(err);
      }
    });
  });
};

utils.getWhiteSpaces = (file) => {
  // Returns white spaces from a json file (spaces nbr | tabulations)
  if (typeof file === 'string') {
    const re = /^{[\n\r]*([ ]*)([\t]*)["|'|{|[]/gim;
    const whitespaces = re.exec(file);
    return jsonWhiteSpacesCfg
      ? jsonWhiteSpacesCfg
      : whitespaces[1] ? whitespaces[1] : whitespaces[2] ? whitespaces[2] : jsonWhiteSpaces;
  }
};

module.exports = utils;
