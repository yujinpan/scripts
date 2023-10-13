module.exports = {
  banner:
    '/**\n' +
    ` * scripts ${require('./package.json').version}\n` +
    ` * (c) 2023-${new Date().getFullYear()}\n` +
    ` * Rep: https://github.com/yujinpan/scripts\n` +
    ' */\n',

  aliasConfig: {
    '@': 'src',
  },

  outputDir: 'lib',

  formats: [
    {
      format: 'cjs',
      inputFiles: ['**/*'],
      outputDir: 'lib',
      outputFile: '[name][ext]',
    },
  ],

  typesOutputDir: 'types',

  node: true,
};
