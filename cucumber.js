require('dotenv').config();
require('dotenv').config({ path: '.env.secure' });

module.exports = {
  default: {
    require: [
      'core/setup/hooks.ts',
      'step-definitions/**/*.steps.ts',
    ],
    requireModule: [
      'ts-node/register',
    ],
    format: [
      'progress-bar', 'json:report/report.json', 'junit:report/junit.report.xml',
    ],
    publishQuiet: true,
  },
};
