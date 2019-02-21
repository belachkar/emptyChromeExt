const { removeDistDir } = require('./fsUtils');
const { distDirPath } = require('./config');

const handleErr = err => console.error(err.message);

removeDistDir(distDirPath).then().catch(handleErr);
