module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    moduleNameMapper: {
      'xt-components': '<rootDir>/../../dist/xt-components/fesm2022/xt-components.mjs',
      'sample-plugin': '<rootDir>/../../dist/sample-plugin/fesm2022/sample-plugin.mjs'
    }
};
