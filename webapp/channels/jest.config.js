// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/** @type {import('jest').Config} */

const config = {
    snapshotSerializers: ['enzyme-to-json/serializer'],
    testPathIgnorePatterns: ['/node_modules/'],
    clearMocks: true,
    globals: {
        GIT_RELEASE: '1.0.0',
    },
    collectCoverageFrom: [
        'src/actions/**/*.{js,jsx,ts,tsx}',
        'src/client/**/*.{js,jsx,ts,tsx}',
        'src/components/**/*.{jsx,tsx}',
        'src/plugins/**/*.{js,jsx,ts,tsx}',
        'src/selectors/**/*.{js,jsx,ts,tsx}',
        'src/stores/**/*.{js,jsx,ts,tsx}',
        'src/utils/**/*.{js,jsx,ts,tsx}',
    ],
    coverageReporters: ['text', 'lcov', 'cobertura'],
    moduleNameMapper: {
        '^@mattermost/(components)$': '<rootDir>/../platform/$1/src',
        '^@mattermost/(client)$': '<rootDir>/../platform/$1/src',
        '^@mattermost/(types)/(.*)$': '<rootDir>/../platform/$1/src/$2',
        '^mattermost-redux/test/(.*)$':
            '<rootDir>/src/packages/mattermost-redux/test/$1',
        '^mattermost-redux/(.*)$': '<rootDir>/src/packages/mattermost-redux/src/$1',
        '^.+\\.(jpg|jpeg|png|apng|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            'identity-obj-proxy',
        '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
        '^.*i18n.*\\.(json)$': '<rootDir>/src/tests/i18n_mock.json',
        '^@mattermost/compass-icons/(.*)$': '<rootDir>/../../node_modules/@infomaniak/compass-icons/$1',
        '^@mattermost/compass-components/(.*)$': '<rootDir>/../../node_modules/@infomaniak/compass-components/$1',
        '^wasm-media-encoders/(.*)$': '<rootDir>/../../node_modules/wasm-media-encoders/$1',
    },
    moduleDirectories: ['src', 'node_modules'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    reporters: [
        'default',
        ['jest-junit', {outputDirectory: 'coverage', outputName: 'junit.xml'}],
    ],
    transformIgnorePatterns: [
        'node_modules/(?!react-native|react-router|p-queue|p-timeout|@infomaniak/compass-components|@infomaniak/compass-icons|cidr-regex|ip-regex|wasm-media-encoders)',
    ],
    setupFiles: ['jest-canvas-mock'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup_jest.ts'],
    testEnvironment: 'jsdom',
    testTimeout: 60000,
    testEnvironmentOptions: {
        url: 'http://localhost:8065',
    },
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],
    snapshotFormat: {
        escapeString: true,
        printBasicPrototype: true,
    },
};

module.exports = config;
