
module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: "@happy-dom/jest-environment",
    moduleNameMapper: {
      'xt-components': '<rootDir>/../xt-components/src/public-api.ts'
    }

};
