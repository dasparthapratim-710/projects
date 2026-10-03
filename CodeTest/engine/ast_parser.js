/**
 * CodeTest - AST Code Structure & Recursive Import Dependency Parser
 * Parses source files, extracts methods/branches, and recursively traces multi-level imported Core dependencies.
 */
import fs from 'fs';
import path from 'path';

export function analyzeCodeStructure(filePath) {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf-8');

  // Extract Class & Method signatures
  const classMatches = [...content.matchAll(/class\s+([A-Za-z0-9_]+)/g)].map(m => m[1]);
  const methodMatches = [...content.matchAll(/async\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g)].map(m => ({
    name: m[1],
    params: m[2].split(',').map(p => p.trim()).filter(Boolean)
  }));

  // Recursively trace all imported internal modules
  const importedDependencies = traceAllImports(absolutePath);

  const tryCatchCount = (content.match(/try\s*\{/g) || []).length;
  const ifBranchCount = (content.match(/if\s*\(/g) || []).length;

  return {
    filePath: absolutePath,
    fileName: path.basename(absolutePath),
    classes: classMatches,
    methods: methodMatches,
    importedDependencies,
    complexityMetrics: {
      tryCatchBlocks: tryCatchCount,
      ifBranches: ifBranchCount,
      estimatedBranchPaths: ifBranchCount + tryCatchCount + 1
    },
    rawContent: content
  };
}

/**
 * Recursively traces multi-level relative imports across shared Core files & utility modules
 */
export function traceAllImports(filePath, visited = new Set()) {
  const absolutePath = path.resolve(filePath);
  if (visited.has(absolutePath) || !fs.existsSync(absolutePath)) {
    return [];
  }
  visited.add(absolutePath);

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const importMatches = [...content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)];
  let dependencies = [];

  for (const match of importMatches) {
    const importPath = match[1];
    
    // Check if it's a relative internal import (starts with . or ..)
    if (importPath.startsWith('.')) {
      let resolvedPath = path.resolve(path.dirname(absolutePath), importPath);
      if (!resolvedPath.endsWith('.js') && !resolvedPath.endsWith('.ts')) {
        resolvedPath += '.js';
      }

      if (fs.existsSync(resolvedPath)) {
        const coreContent = fs.readFileSync(resolvedPath, 'utf-8');
        dependencies.push({
          importPath,
          resolvedPath,
          coreContent
        });

        // Recursively trace sub-imports
        const subDeps = traceAllImports(resolvedPath, visited);
        dependencies = dependencies.concat(subDeps);
      }
    }
  }

  return dependencies;
}
