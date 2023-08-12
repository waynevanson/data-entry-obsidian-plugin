import { toMatchImageSnapshot } from 'jest-image-snapshot';
import '@testing-library/jest-dom';

jest.mock('obsidian');

expect.extend({ toMatchImageSnapshot });
