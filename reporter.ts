import reporter from 'cucumber-html-reporter';
import fs from 'fs';

function removeAnsiEscapeCode(text: Buffer): string {
  return text.toString().replace(/(?:\\u001b)?\[\d+m/g, '');
}

fs.writeFileSync('./report/report.json', removeAnsiEscapeCode(fs.readFileSync('./report/report.json')));

reporter.generate({
  theme: 'bootstrap',
  jsonFile: 'report/report.json',
  output: 'report/report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  brandTitle: 'Fidomoney - Test Automation Report',
});

fs.writeFileSync('./report/junit.report.xml', removeAnsiEscapeCode(fs.readFileSync('./report/junit.report.xml')));
