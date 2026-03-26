const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../..');
const sharedRoot = path.resolve(projectRoot, '../../shared');

const config = getDefaultConfig(projectRoot);

// Allow Metro to resolve files from the shared directory
config.watchFolders = [sharedRoot];

// Ensure Metro can resolve node_modules from both locations
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
