# Testing Guide for Mathslk.online

This document explains the automated testing setup introduced to ensure reliability without risking the production database.

## Tools Chosen
- **Vitest**: Selected for ultra-fast execution of Unit and Component tests.
- **React Testing Library**: Allows testing React components exactly as a user interacts with them, promoting accessibility.
- **Playwright**: The modern standard for cross-browser End-to-End (E2E) testing. Selected for its excellent auto-waiting and built-in accessibility (Axe) support.

## Test Types
### 1. Unit Tests (`*.test.ts`)
Test pure business logic, input validation, date formatting, and utilities.
- **Run**: `npm run test:unit`

### 2. Component Tests (`*.test.tsx`)
Test individual UI components (e.g., buttons, navbars, forms) independently of the full application context.
- **Run**: `npm run test:unit`

### 3. End-to-End Tests (Playwright - `tests/e2e/`)
Test complete user journeys (e.g., Login -> Dashboard -> Logout).
- **Important**: Tests are configured NOT to run against the production database unless explicitly overridden, preventing destructive modifications.
- **Run**: `npm run test:e2e` (All browsers) or `npm run test:e2e:chromium` (Fast, local testing).
- **UI Mode**: `npm run test:e2e:ui` (Excellent for debugging and writing new tests).

## Environment Setup
1. Copy `.env.test.example` to `.env.test`.
2. Fill in the required variables. **DO NOT USE REAL PRODUCTION CREDENTIALS.**
3. Create a dedicated `test_student@example.com` and `test_admin@example.com` in your Supabase project (preferably a staging/test project).

## Best Practices
- **Never mutate production data.** If an E2E test creates records (e.g., admin creating a user), it must run against a non-production Supabase instance.
- Avoid using `setTimeout` in E2E tests. Rely on Playwright's auto-waiting (e.g., `expect(locator).toBeVisible()`).
- Always try to select elements by accessible roles (e.g., `getByRole('button', { name: /login/i })`) instead of `data-testid` or CSS classes.

## GitHub Actions
Automated tests are run on pushes and pull requests to `main`.
- You must set the following **GitHub Secrets** for the tests to pass in CI:
  - `E2E_STUDENT_EMAIL`, `E2E_STUDENT_PASSWORD`
  - `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
