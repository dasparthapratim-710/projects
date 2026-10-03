/**
 * GOOGLE DRIVE DISCOVERY TOOL
 * Imports Shared Core Library from ../core/company_base_scanner.js
 */
import { CompanyOAuthClient } from '../core/company_base_scanner.js';

export class GoogleDriveDiscoveryScanner {
  constructor(authClient) {
    this.authClient = authClient || new CompanyOAuthClient();
  }

  /**
   * Discovers all files and permissions in a Google Drive folder
   */
  async scanFolder(folderId, pageToken = null) {
    if (!folderId) {
      throw new Error("Invalid folderId provided for GDrive discovery");
    }

    return await this.authClient.executeWithRetry(async (token) => {
      const response = await this.authClient.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, size)",
        pageToken
      });

      return {
        files: response.data.files || [],
        nextPageToken: response.data.nextPageToken
      };
    });
  }
}
