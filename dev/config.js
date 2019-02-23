const path = require('path');

const config = {};

config.createAppDir = false;
config.makeZipDefault = false;
config.defaultPrjName = 'myChromeExtProject';
config.distDirName = 'dist';
config.cfgProjectName = '';
config.directories = [ 'app' ];
config.files = [];
config.distDirPath = path.join(__dirname, '..', config.distDirName);
config.jsExtPath = path.join('ext', 'js');
config.nodeModulesPath = path.join(__dirname, '..', 'node_modules');
config.systemFiles = {
  'DIR': 'DIRECTORY',
  'FILE': 'FILE'
};

module.exports = config;
