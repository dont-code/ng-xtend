module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    moduleNameMapper: {
      'tslib': '<rootDir>/../../node_modules/tslib/tslib.js'
    },
    testEnvironment: "@happy-dom/jest-environment"
};
