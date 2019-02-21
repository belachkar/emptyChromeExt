const path = require('path');
const zip = require('zip-a-folder');
const { getProjectName } = require('./utils');

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
