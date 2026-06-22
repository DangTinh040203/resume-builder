import "@testing-library/jest-dom";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock";
process.env.CLERK_SECRET_KEY = "sk_test_mock";
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
