import { createDefaultPreset } from 'ts-jest';

const defaultPreset = createDefaultPreset();

/** @type {import("jest").Config} */
const config = {
    testEnvironment: 'node',
    ...defaultPreset,
};

export default config;
