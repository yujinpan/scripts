module.exports = {
  banner:
    '/*!\n' +
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
      banner: `
/**!justmysocks-to-quantumultx ${require('./package.json').version}
Rep: https://github.com/yujinpan/scripts
*/`.trim(),
      footer: `$done({ content: JMS2QUX.transform($resource.content) });`,
      format: 'iife',
      inputFiles: ['justmysocks-to-quantumultx.ts'],
      outputName: 'JMS2QUX',
      singleFile: true,
      outputDir: 'lib',
      outputFile: '[name][ext]',
    },
  ],

  typesOutputDir: 'types',

  node: true,
};
