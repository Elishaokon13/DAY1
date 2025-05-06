// Import jest-dom
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

// Clean up mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '',
    query: {},
  }),
}));

// Mock context for MiniKit
jest.mock('@coinbase/onchainkit/minikit', () => ({
  useMiniKit: () => ({
    setFrameReady: jest.fn(),
    isFrameReady: true,
    context: {
      client: {
        added: false,
      },
      user: {
        displayName: 'Test User',
      },
    },
  }),
  useAddFrame: () => jest.fn().mockResolvedValue(true),
  useOpenUrl: () => jest.fn(),
})); 