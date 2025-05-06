import { NextRequest } from 'next/server';
import { GET } from '../analytics/route';

// Create a type for the mocked response
interface MockNextResponse {
  body: {
    error?: string;
    totalEarnings?: string;
    totalCollectors?: number;
    totalTraders?: number;
    platforms?: {
      zora: any;
      rodeo: any;
    };
    [key: string]: any;
  };
  status: number;
  json: () => Promise<any>;
}

// Mock global fetch
global.fetch = jest.fn();

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn().mockImplementation((body, options) => ({
        body,
        status: options?.status || 200,
        json: () => Promise.resolve(body)
      })),
    },
  };
});

describe('Analytics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error if no platform username is provided', async () => {
    // Create a mock request without any params
    const req = new NextRequest(new URL('http://localhost/api/analytics'));
    
    const response = await GET(req) as MockNextResponse;
    
    // Check that the response contains an error message
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual('At least one platform username/handle is required');
    expect(response.status).toEqual(400);
  });

  it('should fetch data from Zora API if zora handle is provided', async () => {
    // Mock the fetch implementation
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        totalEarnings: '1.5',
        collectors: [{ address: '0x123', isTrader: false }],
        traders: [],
        salesByTimeframe: {
          daily: { '2023-01-01': 1 },
          weekly: { '2023-W01': 1 },
          monthly: { '2023-01': 1 }
        },
        profileHandle: 'test-zora',
        displayName: 'Test Zora User',
      }),
    });
    
    // Mock the Rodeo API response for combined data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(null),
    });
    
    // Create a mock request with a Zora handle
    const req = new NextRequest(new URL('http://localhost/api/analytics?zora=test-zora'));
    
    const response = await GET(req) as MockNextResponse;
    
    // Check that the Zora API was called with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/creator-earnings?handle=test-zora'),
      expect.any(Object)
    );
    
    // Check that the response contains the combined data
    expect(response.body).toHaveProperty('totalEarnings');
    expect(response.body).toHaveProperty('platforms.zora');
  });

  it('should fetch data from both APIs if both handles are provided', async () => {
    // Mock the Zora API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        totalEarnings: '1.5',
        collectors: [{ address: '0x123', isTrader: false }],
        traders: [],
        salesByTimeframe: {
          daily: { '2023-01-01': 1 },
          weekly: { '2023-W01': 1 },
          monthly: { '2023-01': 1 }
        },
        profileHandle: 'test-zora',
        displayName: 'Test Zora User',
      }),
    });
    
    // Mock the Rodeo API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        totalEarnings: '0.8',
        totalPosts: 2,
        collectors: [{ address: '0x456', isTrader: true }],
        traders: [{ address: '0x456', postsCollected: 1, postsSold: 1 }],
        postsByTimeframe: {
          daily: { '2023-02-01': 1, '2023-02-15': 1 },
          weekly: { '2023-W05': 1, '2023-W07': 1 },
          monthly: { '2023-02': 2 }
        },
        username: 'test-rodeo',
      }),
    });
    
    // Create a mock request with both handles
    const req = new NextRequest(new URL('http://localhost/api/analytics?zora=test-zora&rodeo=test-rodeo'));
    
    const response = await GET(req) as MockNextResponse;
    
    // Check that both APIs were called with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/creator-earnings?handle=test-zora'),
      expect.any(Object)
    );
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/rodeo-earnings?username=test-rodeo'),
      expect.any(Object)
    );
    
    // Check that the response contains the combined data
    expect(response.body).toHaveProperty('totalEarnings');
    expect(parseFloat(response.body.totalEarnings)).toBeCloseTo(2.3); // 1.5 + 0.8
    expect(response.body).toHaveProperty('platforms.zora');
    expect(response.body).toHaveProperty('platforms.rodeo');
    expect(response.body.totalCollectors).toBe(2);
    expect(response.body.totalTraders).toBe(1);
  });

  it('should handle API errors gracefully', async () => {
    // Mock an API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    
    // Create a mock request
    const req = new NextRequest(new URL('http://localhost/api/analytics?zora=test-zora'));
    
    const response = await GET(req) as MockNextResponse;
    
    // Check that error response is correctly formatted
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toEqual('Failed to fetch analytics data');
    expect(response.body).toHaveProperty('totalEarnings');
    expect(response.body.totalEarnings).toEqual('0');
  });
}); 