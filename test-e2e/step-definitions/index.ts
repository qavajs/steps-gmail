import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { MemoryValue } from '@qavajs/core';

Then('I expect {value} memory value to be equal {value}', async function (actual: MemoryValue, expected: MemoryValue) {
  const actualValue = await this.getValue(actual);
  const expectedValue = await this.getValue(expected);
  expect(actualValue).to.eql(expectedValue);
});

Then('I expect {value} memory value to contain {value}', async function (actual: MemoryValue, expected: MemoryValue) {
  const actualValue = await this.getValue(actual);
  const expectedValue = await this.getValue(expected);
  expect(actualValue).contains(expectedValue);
});
