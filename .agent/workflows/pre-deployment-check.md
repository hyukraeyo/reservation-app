---
description: Ensures code quality by running lint and build checks before deployment.
---
# Pre-deployment Checklist

This workflow should be followed before pushing to the `main` branch or triggering a deployment.

1. **Run Linting**:
   Execute the linting command to catch any code quality issues.
   ```bash
   npm run lint
   ```
   - If there are errors, FIX THEM before proceeding.

2. **Run Build**:
   Execute the build command to ensure the application compiles correctly.
   ```bash
   npm run build
   ```
   - If the build fails, DIAGNOSE and FIX the errors. Do not push broken code.

3. **Proceed with Push**:
   Only after both steps above pass successfully (exit code 0), you may proceed with git push or deployment.

// turbo-all
