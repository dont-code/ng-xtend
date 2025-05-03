module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: "@happy-dom/jest-environment",
    moduleNameMapper: {
      'tslib': '<rootDir>/../../node_modules/tslib/tslib.js'
    }
};
