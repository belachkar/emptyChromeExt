const path = require('path');

const config = {};

config.directories = [ 'img', 'js', 'lib' ];
config.files = [ 'manifest.json' ];
config.distDirName = 'dist';
config.distDirPath = path.join(__dirname, '..', config.distDirName);
config.systemFilesList = ['DIRECTORY', 'FILE'];

module.exports = config;