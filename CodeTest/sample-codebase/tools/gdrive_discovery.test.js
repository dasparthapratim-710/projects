/**
 * CODETEST AUTO-GENERATED JEST TEST SUITE
 * Target File: gdrive_discovery.js
 * Coverage Target: 95%+
 */

import { GoogleDriveDiscoveryScanner } from './gdrive_discovery.js';

describe('GoogleDriveDiscoveryScanner Automated Edge Case Suite', () => {
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
    instance = new GoogleDriveDiscoveryScanner(mockAuthClient);
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
