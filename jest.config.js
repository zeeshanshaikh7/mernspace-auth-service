// jest.config.js
const { createDefaultPreset } = require('ts-jest');

module.exports = {
    ...createDefaultPreset(),
    testEnvironment: 'node',
    verbose: true,
};
