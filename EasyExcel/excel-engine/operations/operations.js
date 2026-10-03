const fs = require("fs");
const path = require("path");
const Excel = require("xlsx");

// Supported spreadsheet extensions
const SUPPORTED_EXTENSIONS = new Set([
  ".xlsx",
  ".xls",
  ".xlsm",
  ".xlsb",
  ".csv",
  ".tsv",
  ".ods",
]);

/**
 * Standard response format generator
 * @param {boolean} success - Indicates whether the operation succeeded
 * @param {number} code - Status / Error code (e.g. 200, 400, 403, 404, 415, 422, 500)
 * @param {string} message - Descriptive message explaining the outcome
 * @param {any} [data=null] - The resulting data payload, or null on error
 * @returns {{ success: boolean, code: number, message: string, data: any }}
 */
const formatResponse = (success, code, message, data = []) => ({
  success,
  code,
  message,
  data,
});

/**
 * Reads an Excel/spreadsheet file and converts the sheet to JSON data.
 * Handles all bad cases gracefully without throwing exceptions.
 * Logs all errors and returns a standardized response object.
 *
 * @param {string} filePath - Absolute or relative path to the Excel file
 * @param {Object|string|number} [options={}] - Optional options or sheet name/index:
 *   - sheetName {string}: Specific sheet to read
 *   - sheetIndex {number}: Zero-based index of sheet to read (default: 0)
 *   - raw {boolean}: If true, returns raw values instead of formatted strings
 *   - header {string[]|number}: Sheet header options for sheet_to_json
 *   - defval {any}: Default value for empty cells
 * @returns {{ success: boolean, code: number, message: string, data: any }}
 */
exports.readExcelSheet = (filePath, options = {}) => {
  try {
    // Normalize options
    let opts = {};
    if (typeof options === "string") {
      opts = { sheetName: options };
    } else if (typeof options === "number") {
      opts = { sheetIndex: options };
    } else if (options && typeof options === "object") {
      opts = { ...options };
    }

    // 1. Validate filePath parameter existence and type
    if (!filePath || typeof filePath !== "string" || filePath.trim() === "") {
      const errorMsg = "File path is required and must be a non-empty string.";
      console.error(`[readExcelSheet Error] Code 400: ${errorMsg}`);
      return formatResponse(false, 400, errorMsg, null);
    }

    const trimmedPath = filePath.trim();

    // 2. Validate file extension
    const ext = path.extname(trimmedPath).toLowerCase();
    if (!ext) {
      const errorMsg = `File has no extension: "${trimmedPath}". Expected one of: ${Array.from(SUPPORTED_EXTENSIONS).join(", ")}`;
      console.error(`[readExcelSheet Error] Code 400: ${errorMsg}`);
      return formatResponse(false, 400, errorMsg, null);
    }

    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      const errorMsg = `Unsupported file extension "${ext}". Supported formats: ${Array.from(SUPPORTED_EXTENSIONS).join(", ")}`;
      console.error(`[readExcelSheet Error] Code 415: ${errorMsg}`);
      return formatResponse(false, 415, errorMsg, null);
    }

    // 3. Resolve path and check file existence
    const resolvedPath = path.resolve(trimmedPath);
    if (!fs.existsSync(resolvedPath)) {
      const errorMsg = `File not found at path: "${resolvedPath}".`;
      console.error(`[readExcelSheet Error] Code 404: ${errorMsg}`);
      return formatResponse(false, 404, errorMsg, null);
    }

    // 4. Validate that path is a regular file (not a directory)
    let stats;
    try {
      stats = fs.statSync(resolvedPath);
    } catch (statErr) {
      const errorMsg = `Cannot access file metadata at "${resolvedPath}": ${statErr.message}`;
      console.error(`[readExcelSheet Error] Code 403: ${errorMsg}`);
      return formatResponse(false, 403, errorMsg, null);
    }

    if (!stats.isFile()) {
      const errorMsg = `Provided path is a directory or special file, not a regular file: "${resolvedPath}".`;
      console.error(`[readExcelSheet Error] Code 400: ${errorMsg}`);
      return formatResponse(false, 400, errorMsg, null);
    }

    // 5. Check if file is empty (0 bytes)
    if (stats.size === 0) {
      const errorMsg = `File is empty (0 bytes): "${resolvedPath}".`;
      console.error(`[readExcelSheet Error] Code 400: ${errorMsg}`);
      return formatResponse(false, 400, errorMsg, null);
    }

    // 6. Check file readability permissions
    try {
      fs.accessSync(resolvedPath, fs.constants.R_OK);
    } catch (accessErr) {
      const errorMsg = `Permission denied. File is not readable: "${resolvedPath}".`;
      console.error(`[readExcelSheet Error] Code 403: ${errorMsg}`);
      return formatResponse(false, 403, errorMsg, null);
    }

    // 7. Read and parse workbook using xlsx
    let workbook;
    try {
      workbook = Excel.readFile(resolvedPath, {
        cellDates: true,
        ...opts.readFileOptions,
      });
    } catch (readErr) {
      const errorMsg = `Failed to read or parse Excel file "${resolvedPath}": ${readErr.message}`;
      console.error(`[readExcelSheet Error] Code 422: ${errorMsg}`);
      return formatResponse(false, 422, errorMsg, null);
    }

    // 8. Validate workbook structure and sheets
    if (
      !workbook ||
      !Array.isArray(workbook.SheetNames) ||
      workbook.SheetNames.length === 0
    ) {
      const errorMsg = `The Excel file "${path.basename(resolvedPath)}" contains no readable sheets.`;
      console.error(`[readExcelSheet Error] Code 422: ${errorMsg}`);
      return formatResponse(false, 422, errorMsg, null);
    }

    // 9. Determine target sheet
    let targetSheetName;
    if (opts.sheetName) {
      if (typeof opts.sheetName !== "string") {
        const errorMsg = "Option 'sheetName' must be a string.";
        console.error(`[readExcelSheet Error] Code 400: ${errorMsg}`);
        return formatResponse(false, 400, errorMsg, null);
      }
      if (!workbook.SheetNames.includes(opts.sheetName)) {
        const errorMsg = `Sheet "${opts.sheetName}" not found in workbook. Available sheets: [${workbook.SheetNames.join(", ")}].`;
        console.error(`[readExcelSheet Error] Code 404: ${errorMsg}`);
        return formatResponse(false, 404, errorMsg, null);
      }
      targetSheetName = opts.sheetName;
    } else if (opts.sheetIndex !== undefined) {
      const index = Number(opts.sheetIndex);
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= workbook.SheetNames.length
      ) {
        const errorMsg = `Sheet index ${opts.sheetIndex} is invalid or out of bounds. Available sheet index range: 0 to ${workbook.SheetNames.length - 1}.`;
        console.error(`[readExcelSheet Error] Code 400: ${errorMsg}`);
        return formatResponse(false, 400, errorMsg, null);
      }
      targetSheetName = workbook.SheetNames[index];
    } else {
      // Default to the first sheet
      targetSheetName = workbook.SheetNames[0];
    }

    // 10. Retrieve worksheet object
    const worksheet = workbook.Sheets[targetSheetName];
    if (!worksheet) {
      const errorMsg = `Worksheet "${targetSheetName}" could not be retrieved from workbook.`;
      console.error(`[readExcelSheet Error] Code 404: ${errorMsg}`);
      return formatResponse(false, 404, errorMsg, null);
    }

    // 11. Convert sheet data to JSON
    let jsonData;
    try {
      const sheetToJsonOpts = {};
      if (opts.raw !== undefined) sheetToJsonOpts.raw = opts.raw;
      if (opts.header !== undefined) sheetToJsonOpts.header = opts.header;
      if (opts.defval !== undefined) sheetToJsonOpts.defval = opts.defval;
      if (opts.range !== undefined) sheetToJsonOpts.range = opts.range;

      jsonData = Excel.utils.sheet_to_json(worksheet, sheetToJsonOpts);
    } catch (parseErr) {
      const errorMsg = `Failed to convert sheet "${targetSheetName}" to JSON: ${parseErr.message}`;
      console.error(`[readExcelSheet Error] Code 500: ${errorMsg}`);
      return formatResponse(false, 500, errorMsg, null);
    }

    // 12. Return standardized success response
    const rowCount = Array.isArray(jsonData) ? jsonData.length : 0;
    const successMsg =
      rowCount > 0
        ? `Successfully read ${rowCount} record(s) from sheet "${targetSheetName}".`
        : `Sheet "${targetSheetName}" was read successfully, but it contains no data rows.`;

    return formatResponse(true, 200, successMsg, jsonData);
  } catch (unexpectedErr) {
    // 13. Top-level catch-all to guarantee function never throws
    const errorMsg = `Unexpected error while reading Excel file: ${unexpectedErr.message}`;
    console.error(`[readExcelSheet Error] Code 500: ${errorMsg}`);
    return formatResponse(false, 500, errorMsg, null);
  }
};

// Direct script execution demo
if (require.main === module) {
  const defaultFilePath = "/Users/partha/Downloads/bar.xlsx";
  const result = exports.readExcelSheet(defaultFilePath);
  console.log("Direct Execution Result:", JSON.stringify(result, null, 2));
}
