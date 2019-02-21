const fs = require('fs');
const path = require('path');

const manifestFileName = 'manifest.json';
const manifestFilePath = path.join(__dirname, '..', manifestFileName);

const utils = {};

utils.getProjectName = (callback) => {
  let prjName = '';

  fs.readFile(manifestFilePath, (err, file) => {
    if (!err) {
      try {
        const manifestObject = JSON.parse(file);
        // console.log(manifestObject);
        prjName = manifestObject && manifestObject.name && manifestObject.name.trim() ?
          manifestObject.name.trim() :
          '';
        // console.log('prjName', prjName);
        callback(null, prjName);
      } catch (e) {
        // console.error(e.message);
        callback(e, null);
      }
    } else {
      // console.error(err.message);
      callback(err, null);
    }
    return '';
  });
};

module.exports = utils;
