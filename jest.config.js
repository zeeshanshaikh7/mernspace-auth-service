// jest.config.js
const { createDefaultPreset } = require('ts-jest');

module.exports = {
    ...createDefaultPreset(),
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageProvider: 'v8', // faster than babel for TS/JS
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}', // all ts/tsx files under src
        '!src/**/*.d.ts', // ignore type definitions
        '!src/**/index.ts', // ignore barrel files
        '!tests/**', // ignore test files
        '!**/node_modules/**', // always ignore node_modules
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'json', 'html'], // multiple output formats
};
