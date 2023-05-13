import { jest, test, expect } from '@jest/globals';

jest.mock('@cucumber/cucumber', () => ({
  google: jest.fn(),
}));

test('import steps', () => {
  const importer = () => {
    return import('../index.js');
  };
  expect(importer).not.toThrow();
});
