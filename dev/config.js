const path = require('path');

const config = {};

config.cfgProjectName = '';
config.defaultPrjName = 'myChromeExtProject';
config.directories = [ 'img', 'js', 'lib' ];
config.files = [ 'manifest.json' ];
config.distDirName = 'dist';
config.distDirPath = path.join(__dirname, '..', config.distDirName);
config.systemFiles = {
  'DIR': 'DIRECTORY',
  'FILE': 'FILE'
};

module.exports = config;
