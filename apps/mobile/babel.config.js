module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@rideprompt/shared": "../../packages/shared/src",
          },
          extensions: [".ts", ".tsx", ".js", ".json"],
        },
      ],
    ],
  };
};
