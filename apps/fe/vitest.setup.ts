import '@testing-library/jest-dom';

// Mock environment variables for tests — must cover every key required by the
// env schema (configs/env.config.ts) or importing `Env` throws during tests.
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.CLERK_SECRET_KEY = 'sk_test_mock';
process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = '/auth/sign-in';
process.env.NEXT_PUBLIC_REDIRECT_URL = '/auth/sign-in/sso-callback';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
