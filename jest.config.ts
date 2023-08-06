/** @type {import('ts-jest').JestConfigWithTsJest} */

import { Config } from 'jest';

export default {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	passWithNoTests: true,
} as Config;
