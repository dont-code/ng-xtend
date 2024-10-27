module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    moduleNameMapper: {
      'xt-components': '<rootDir>/../../dist/xt-components/fesm2022/xt-components.mjs',
    },
    testEnvironment: "@happy-dom/jest-environment"
};
