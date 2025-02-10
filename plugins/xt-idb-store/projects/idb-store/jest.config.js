module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: "@happy-dom/jest-environment",
    moduleNameMapper: {
      'xt-type': '<rootDir>/../../node_modules/xt-type/src/index.ts',
      'xt-store': '<rootDir>/../../node_modules/xt-store/src/index.ts',
        'tslib': '<rootDir>/../../node_modules/tslib/tslib.js'
    }

};
