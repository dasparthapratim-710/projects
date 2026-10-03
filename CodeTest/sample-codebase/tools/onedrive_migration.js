/**
 * ONEDRIVE TO ONEDRIVE MIGRATION TOOL
 * Imports Shared Core Library from ../core/company_base_scanner.js
 */
import { CompanyOAuthClient } from '../core/company_base_scanner.js';

export class OneDriveMigrationEngine {
  constructor(authClient) {
    this.authClient = authClient || new CompanyOAuthClient();
  }

  /**
   * Migrates large file in 5MB chunks across OneDrive tenants
   */
  async migrateFileChunks(fileId, destinationClient) {
    if (!fileId || !destinationClient) {
      throw new Error("Missing fileId or destinationClient for OneDrive migration");
    }

    let bytesMigrated = 0;
    const chunkSize = 5 * 1024 * 1024; // 5MB

    const metadata = await this.authClient.files.get({ fileId });
    const totalSize = parseInt(metadata.data.size || "0", 10);

    while (bytesMigrated < totalSize) {
      const currentChunk = Math.min(chunkSize, totalSize - bytesMigrated);
      await destinationClient.uploadChunk(fileId, bytesMigrated, currentChunk);
      bytesMigrated += currentChunk;
    }

    return { success: true, totalBytes: bytesMigrated };
  }
}
