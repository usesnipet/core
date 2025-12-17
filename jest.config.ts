import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      useESM: true,
    }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!@snipet/permission/.*)',
  ],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};

export default config;
