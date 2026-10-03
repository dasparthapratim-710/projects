/**
 * CodeTest - Migration Logic Flaw & Vulnerability Detector
 * Audits code for enterprise cloud migration risk patterns.
 */

export function auditMigrationLogic(astReport) {
  const flaws = [];
  const edgeCasesToTest = [];
  const rawContent = astReport.rawContent;

  // Rule 1: Check HTTP 429 Rate Limit Retry Logic
  const hasRateLimit = rawContent.includes('429') || rawContent.includes('rateLimit') || rawContent.includes('retry');
  if (!hasRateLimit) {
    flaws.push({
      severity: "CRITICAL",
      type: "MISSING_RATE_LIMIT_RETRY",
      message: "No exponential backoff handling detected for HTTP 429 rate limits. Heavy tenant scans will crash under cloud throttling.",
      recommendation: "Wrap cloud API calls in a jittered backoff loop when status code is 429."
    });
    edgeCasesToTest.push("Simulate HTTP 429 Rate Limit error from Cloud API");
  }

  // Rule 2: Check OAuth 401 Token Refresh Logic
  const hasTokenRefresh = rawContent.includes('401') || rawContent.includes('refreshToken') || rawContent.includes('OAuth');
  if (!hasTokenRefresh) {
    flaws.push({
      severity: "HIGH",
      type: "UNHANDLED_AUTH_EXPIRATION",
      message: "No OAuth token expiration handler detected. Long migrations lasting > 1 hour will fail mid-transfer.",
      recommendation: "Add 401 response interceptor to auto-refresh OAuth access token."
    });
    edgeCasesToTest.push("Simulate HTTP 401 Unauthorized token expiration");
  } else {
    edgeCasesToTest.push("Verify automatic token refresh on HTTP 401");
  }

  // Rule 3: Check Chunk Upload Resumability
  const hasChunking = rawContent.includes('chunkSize') || rawContent.includes('uploadChunk');
  if (hasChunking && !rawContent.includes('resume')) {
    flaws.push({
      severity: "MEDIUM",
      type: "NON_RESUMABLE_CHUNK_UPLOAD",
      message: "File chunking detected without resume offset checkpoint. Network drops mid-file force full re-upload.",
      recommendation: "Store last uploaded byte offset in persistent state to resume on failure."
    });
    edgeCasesToTest.push("Simulate network drop at 50% chunk migration offset");
  }

  const healthScore = Math.max(25, 100 - (flaws.length * 25));

  return {
    healthScore,
    flawsFound: flaws,
    edgeCasesToTest,
    hasCoreImports: astReport.importedDependencies.length > 0
  };
}
