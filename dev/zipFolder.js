import * as fs from 'fs';
import * as path from 'path';
import * as zip from 'zip-a-folder';

// const fsPromises = fs.promises;
const defaultPrjName = 'myProject';
const manifestFileName = 'manifest.json';
const manifestFilePath = path.join('..', manifestFileName);

const getProjectName = new Promise((resolve, reject) => {
  let errors = null;
  let prjName = defaultPrjName;

  fs.readFile(manifestFilePath, (err, file) => {
    if (!err) {
      try {
        const manifestObject = JSON.parse(file);
        prjName = manifestObject && manifestObject.name && manifestObject.name.trim() ?
          manifestObject.name.trim() :
          prjName;
        resolve(prjName);
      } catch (e) {
        errors = errors ? errors : [];
        errors.push(e);
        reject(errors);
      }
    } else {
      errors = errors ? errors : [];
      errors.push(err);
      reject(errors);
    }
  });
});

// const zipFolder = {};

// zipFolder.zip = () => {
//   fsPromises.stat(projPath)
//     .then(stats => {
//       if (stats.isDirectory) {

//       } else {

//       }
//     })
//     .catch(err =>{
//       console.error('Error: ', projPath, ' is not a directory.\n', err);
//     });
// };

const zipFolder = async () => {
  getProjectName
    .then(prjName => {
      const prjDistPath = path.join('..', 'dist', prjName);
      const prjDistPathZipped = prjDistPath + '.zip';

      await zip.zip(prjDistPath, prjDistPathZipped);
    }).catch(err => {
      
    });
};

// class ZipFolder {
//   static async main() {
//     await zip.zip(projPath, projPathZipped);
//   }
// }

module.exports = zipFolder;
