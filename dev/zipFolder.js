const zip = require('zip-a-folder');

const zipFolder = async (prjDirPath) => {
  const prjDirPathZipped = `${prjDirPath}.zip`;
  await zip.zip(prjDirPath, prjDirPathZipped);
};

module.exports = zipFolder;
