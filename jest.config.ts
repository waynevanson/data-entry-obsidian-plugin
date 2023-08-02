/** @type {import('ts-jest').JestConfigWithTsJest} */

import { Config } from 'jest';

export default {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
} as Config;
