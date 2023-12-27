import Memory from './memory';

export default {
  paths: ['test-e2e/features/*.feature'],
  require: ['test-e2e/step-definitions/*.ts', 'src/*.ts'],
  format: ['@qavajs/html-formatter:./report/report.html', '@qavajs/xunit-formatter:test-e2e/report.xml', '@qavajs/console-formatter'],
  memory: new Memory(),
  parallel: 5,
  defaultTimeout: 60000,
  gmail: {
    timeout: 50000,
    interval: 5000,
  },
};
