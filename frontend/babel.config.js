module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Evita `import.meta` sin transformar en web (Metro / Zustand ESM, etc.)
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
