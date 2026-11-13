// Metro: ikutkan folder ../src/core (logika bersama dengan versi web).
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

const projectRoot = __dirname
const sharedCore = path.resolve(projectRoot, '../src/core')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [...(config.watchFolders ?? []), sharedCore]
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')]

// Import paket (mis. "react") dari file di ../src/core harus memakai node_modules milik
// app mobile, bukan milik web — kalau tidak, akan ada dua salinan React.
const defaultResolve = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isBare = !moduleName.startsWith('.') && !path.isAbsolute(moduleName)
  const fromShared = context.originModulePath.startsWith(sharedCore + path.sep)
  const ctx = isBare && fromShared
    ? { ...context, originModulePath: path.join(projectRoot, 'package.json') }
    : context
  return (defaultResolve ?? context.resolveRequest)(ctx, moduleName, platform)
}

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
})
