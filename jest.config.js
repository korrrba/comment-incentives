// ES modules which need to be transformed by babel for use in jest.
const esModules = [
  'p-retry',
].join('|');

module.exports = {
  transform: {
    '^.+\\.ts?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Don't transform any module in `node_modules`, except for the ES
    // modules. We need to transform ESM because jest expects CJS.
    `node_modules/(?!${esModules})`,
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};