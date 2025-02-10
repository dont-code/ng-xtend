module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: "@happy-dom/jest-environment",
    moduleNameMapper: {
      'xt-type': '<rootDir>/../../node_modules/xt-type/src/index.ts',
      'xt-store': '<rootDir>/../../node_modules/xt-store/dist/store/fesm2022/xt-store.mjs',
      'tslib': '<rootDir>/../../node_modules/tslib/tslib.js'
    }

};
