/**
 * CodeTest - AI Test Generation Client
 * Connects to Google Gemini / OpenAI to synthesize Jest test suites with standalone mocks.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateTestsWithAI(astReport, logicAudit) {
  if (!ai) {
    console.log(`ℹ️  [CodeTest AI] No GEMINI_API_KEY set in .env. Using smart offline test generator template.`);
    return getTemplateTestCode(astReport);
  }

  const coreContext = astReport.importedDependencies.map(dep => `
IMPORTED CORE FILE (${dep.importPath}):
\`\`\`javascript
${dep.coreContent}
\`\`\`
`).join('\n');

  const prompt = `
You are a Senior Test Automation Engineer building Jest unit tests for Enterprise Cloud Migration & Discovery tools.

TARGET SOURCE FILE (${astReport.fileName}):
\`\`\`javascript
${astReport.rawContent}
\`\`\`
${coreContext}

DETECTED FLAWS & EDGE CASES TO TEST:
${JSON.stringify(logicAudit.flawsFound, null, 2)}

REQUIREMENTS:
1. Write a complete, executable Jest unit test file for ${astReport.fileName}.
2. Use standalone jest.fn() mocks for all external Cloud APIs (Google Drive, Microsoft Graph, Slack).
3. Cover normal success, HTTP 429 Rate Limits, HTTP 401 Auth Expirations, and Chunk Drops.
4. Output ONLY raw executable JavaScript code inside a \`\`\`javascript ... \`\`\` block. No extra markdown commentary.
`;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const response = await model.generateContent(prompt);

    const text = response.response.text() || '';
    const match = text.match(/```javascript([\s\S]*?)```/) || text.match(/```js([\s\S]*?)```/);
    return match ? match[1].trim() : text.trim();
  } catch (error) {
    console.error(`⚠️ CodeTest AI Error: ${error.message}. Falling back to template test suite.`);
    return getTemplateTestCode(astReport);
  }
}

function getTemplateTestCode(astReport) {
  const className = astReport.classes[0] || 'MigrationTool';
  const fileNameNoExt = astReport.fileName.replace('.js', '');

  return `/**
 * CODETEST AUTO-GENERATED JEST TEST SUITE
 * Target File: ${astReport.fileName}
 * Coverage Target: 95%+
 */

import { ${className} } from './${astReport.fileName}';

describe('${className} Automated Edge Case Suite', () => {
  let instance;
  let mockAuthClient;
  let mockDestinationClient;

  beforeEach(() => {
    mockAuthClient = {
      files: {
        list: jest.fn(),
        get: jest.fn()
      },
      executeRequest: jest.fn()
    };
    mockDestinationClient = {
      uploadChunk: jest.fn()
    };
    instance = new ${className}(mockAuthClient);
  });

  test('scanFolder should successfully retrieve files and map permissions', async () => {
    mockAuthClient.files.list.mockResolvedValueOnce({
      data: {
        files: [{ id: 'doc_1', name: 'MigrationPlan.pdf', size: '51200' }],
        nextPageToken: 'PAGE_TOKEN_2'
      }
    });

    const result = await instance.scanFolder('folder_root');
    expect(result.files).toHaveLength(1);
    expect(result.files[0].name).toBe('MigrationPlan.pdf');
  });

  test('scanFolder should handle OAuth Token Expiration (HTTP 401)', async () => {
    const err401 = new Error('Unauthorized');
    err401.code = 401;
    mockAuthClient.files.list.mockRejectedValueOnce(err401);

    await expect(instance.scanFolder('folder_root')).rejects.toThrow();
  });

  test('scanFolder should handle Rate Limit Throttling (HTTP 429)', async () => {
    const err429 = new Error('User Rate Limit Exceeded');
    err429.code = 429;
    mockAuthClient.files.list.mockRejectedValueOnce(err429);

    await expect(instance.scanFolder('folder_root')).rejects.toThrow();
  });
});
`;
}
