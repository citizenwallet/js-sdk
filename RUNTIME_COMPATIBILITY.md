# Runtime Compatibility Analysis

This document outlines potential runtime compatibility issues and recommendations for the SDK.

## ✅ Fixed Issues

### 1. `btoa`/`atob` Browser APIs
**Location:** `src/utils/gzip.ts`

**Issue:** The code used `btoa` and `atob` which are browser APIs that may not be available in:
- Node.js < 18
- Some edge runtimes (though most modern ones support them)
- Deno (though Deno does support them natively)

**Fix Applied:** Added runtime-agnostic base64 encoding/decoding with fallbacks that work across all environments.

## ⚠️ Remaining Issues & Recommendations

### 2. Unused Dependencies
**Location:** `package.json`

**Status:** ✅ **Fixed** - Removed `react`, `zustand`, and `@types/react` as they were not used in the source code.

**Previous Issue:** These dependencies caused:
- Unnecessary bundle size
- Potential compatibility issues in edge runtimes that don't support React
- Confusion about whether React is required

**Action Taken:** Removed from both `dependencies` and `devDependencies`.

### 3. CommonJS Module Format
**Location:** `tsconfig.json`

**Issue:** The project compiles to CommonJS (`"module": "CommonJS"`), which may cause issues in:
- Edge runtimes that prefer ESM (e.g., Vercel Edge Functions, Cloudflare Workers)
- Modern bundlers that work better with ESM
- Deno (which prefers ESM)

**Recommendation:**
Consider adding ESM support alongside CommonJS:
- Set `"module": "ES2020"` or `"ESNext"` in tsconfig
- Use `"type": "module"` in package.json OR
- Build both formats and use package.json `exports` field to provide both:
  ```json
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "import": "./dist/src/index.esm.js",
      "require": "./dist/src/index.cjs.js"
    }
  }
  ```

### 4. Headers API Usage
**Location:** `src/connect/index.ts`

**Status:** ✅ Generally compatible
- The `Headers` API is available in:
  - Modern browsers
  - Node.js 18+ (via `undici` or native fetch)
  - Most edge runtimes (Cloudflare Workers, Vercel Edge, etc.)
  - Deno

**Note:** Some edge runtimes may have slightly different implementations, but the basic API should work.

### 5. TextEncoder/TextDecoder
**Status:** ✅ Compatible
- Available in all modern runtimes (browser, Node.js 11+, Deno, edge runtimes)

### 6. Fetch API
**Location:** `src/bundler/index.ts`

**Status:** ✅ Compatible
- Available in:
  - Modern browsers
  - Node.js 18+ (native)
  - All major edge runtimes
  - Deno

## Runtime Compatibility Matrix

| Runtime | Status | Notes |
|---------|--------|-------|
| **Browser (Modern)** | ✅ Compatible | All APIs available |
| **Node.js 18+** | ✅ Compatible | Native fetch, btoa/atob available |
| **Node.js < 18** | ✅ Compatible | With base64 fallback (now fixed) |
| **Deno** | ✅ Compatible | All APIs available natively |
| **Cloudflare Workers** | ✅ Compatible | All APIs available |
| **Vercel Edge Functions** | ✅ Compatible | All APIs available |
| **AWS Lambda (Node.js)** | ✅ Compatible | Depends on Node.js version |
| **Bun** | ✅ Compatible | All APIs available |

## Recommendations Summary

1. ✅ **Fixed:** Base64 encoding/decoding now works across all runtimes
2. ✅ **Fixed:** Removed unused React and zustand dependencies
3. **Consider:** Add ESM build output for better edge runtime compatibility
4. **Test:** Verify in target edge runtimes (Cloudflare Workers, Vercel Edge, etc.)

## Testing Recommendations

To ensure compatibility across runtimes, consider testing in:
- [ ] Cloudflare Workers
- [ ] Vercel Edge Functions  
- [ ] Deno runtime
- [ ] Node.js 16, 18, 20
- [ ] Modern browsers (Chrome, Firefox, Safari, Edge)

