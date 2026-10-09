---
description: Run the full verification suite and fix any failures
allowed-tools: Bash(npm test:*), Bash(npx jest:*), Read, Edit, Grep, Glob
---

Run the full verification suite for this project. Use it after any significant change. Extra instructions from the user: $ARGUMENTS

The test suite uses supertest and exercises all API endpoints directly against an in-memory SQLite database. If the tests pass, the server and endpoints are OK.

## Steps

1. Run `npm test -- --runInBand` to run the whole suite serially.
2. If every test passes, go to the report.
3. If any test fails:
   1. Read the failing test and the code it exercises, following the layers (route → service → query).
   2. Fix the **implementation**. Don't weaken, skip or delete tests to get a pass. If a test itself is wrong, stop and tell me why.
   3. Run `npm test -- --runInBand` again.
   4. Repeat until all tests pass. If the same failure survives three attempts, stop and report what you tried instead of continuing.

## Report

Finish with a short, clear report:

- **Result:** PASS or FAIL
- **Counts:** test suites and tests passed / failed / total, from the Jest summary
- **Fixes:** each failure you fixed, with the file changed and what was wrong (or "none needed")
- **Remaining failures:** test names and error messages, if any
