/**
 * CodeTest - Real Terminal Jest Runner & Coverage JSON Parser
 * Executes Jest test runner and parses coverage-final.json to identify uncovered lines & branches.
 */
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

export async function runJestAndGetCoverage(targetDirectory) {
  const coverageDir = path.join(targetDirectory, 'coverage');
  const coverageJsonPath = path.join(coverageDir, 'coverage-final.json');

  try {
    // Run Jest with JSON coverage reporter
    await execPromise(`npx jest --coverage --coverageReporters="json"`, { cwd: targetDirectory });
  } catch (error) {
    // Jest exits with code 1 if tests fail or assertions fail, but coverage.json is written
  }

  if (!fs.existsSync(coverageJsonPath)) {
    return {
      overallCoverage: 0,
      uncoveredLines: [],
      hasCoverageFile: false
    };
  }

  try {
    const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf-8'));
    let totalStatements = 0;
    let coveredStatements = 0;
    const uncoveredLines = [];

    Object.keys(coverageData).forEach(filePath => {
      const fileCoverage = coverageData[filePath];
      const statementMap = fileCoverage.s || {};
      const statementsInfo = fileCoverage.statementMap || {};

      Object.keys(statementMap).forEach(statementId => {
        totalStatements++;
        const count = statementMap[statementId];
        if (count > 0) {
          coveredStatements++;
        } else if (statementsInfo[statementId]) {
          uncoveredLines.push(statementsInfo[statementId].start.line);
        }
      });
    });

    const overallCoverage = totalStatements > 0 
      ? Math.round((coveredStatements / totalStatements) * 100) 
      : 0;

    return {
      overallCoverage,
      uncoveredLines: [...new Set(uncoveredLines)].sort((a, b) => a - b),
      hasCoverageFile: true
    };
  } catch (err) {
    return {
      overallCoverage: 0,
      uncoveredLines: [],
      hasCoverageFile: false
    };
  }
}
