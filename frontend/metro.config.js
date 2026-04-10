const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

/**
 * Zustand v5 + `exports` de package.json puede resolver el entry ESM con
 * `import.meta`, que rompe la web. Forzamos la entrada que resuelve `require`.
 * @see https://github.com/expo/expo/issues/36384
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "zustand" || moduleName.startsWith("zustand/")) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
