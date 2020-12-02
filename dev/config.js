const path = require('path');

const cfg = {};

cfg.jsonWhiteSpacesCfg = null;
cfg.distDirName = 'dist';
cfg.manifestFileName = 'manifest.json';
cfg.directories = ['app'];
cfg.files = [];
cfg.prj = {
  defaultName: 'myChromeExtProject',
  name: '',
};
cfg.options = {
  createAppDir: false,
  makeZip: true,
};
cfg.paths = {
  distDir: () => path.join(__dirname, '..', cfg.distDirName),
  jsExt: () => path.join('ext', 'js'),
  nodeModules: () => path.join(__dirname, '..', 'node_modules'),
  manifestFile: () => path.join(__dirname, '..', 'app', cfg.manifestFileName),
};
cfg.systemFiles = {
  DIR: 'DIRECTORY',
  FILE: 'FILE',
};

module.exports = cfg;
