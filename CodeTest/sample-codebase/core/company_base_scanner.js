/**
 * COMPANY SHARED CORE LIBRARY
 * Shared across all internal migration & discovery tools (GDrive, OneDrive, Slack, Vault)
 */

export class CompanyOAuthClient {
  constructor(credentials = {}) {
    this.accessToken = credentials.accessToken || 'default_token';
    this.refreshToken = credentials.refreshToken || 'default_refresh_token';
  }

  async executeWithRetry(apiCallFn, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        return await apiCallFn(this.accessToken);
      } catch (error) {
        attempts++;
        if (error.code === 401) {
          console.log("OAuth token expired. Refreshing token...");
          this.accessToken = "refreshed_access_token";
        } else if (error.code === 429) {
          const delay = Math.pow(2, attempts) * 1000;
          console.log(`Rate limited (429). Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw error;
        }
      }
    }
    throw new Error("API call failed after max retries.");
  }
}
