"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/analytics/Dashboard";

// Import the AnalyticsData type from the types directory
import type { AnalyticsData } from "@/types/analytics";

export default function AnalyticsPage() {
  const [zoraHandle, setZoraHandle] = useState('');
  const [rodeoUsername, setRodeoUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Function to fetch analytics data
  const fetchAnalytics = async () => {
    if (!zoraHandle && !rodeoUsername) {
      setError('Please enter at least one platform username/handle');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (zoraHandle) params.append('zora', zoraHandle);
      if (rodeoUsername) params.append('rodeo', rodeoUsername);
      
      // Fetch analytics data
      const response = await fetch(`/api/analytics?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics data');
      }
      
      setAnalyticsData(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Creator Analytics</h1>
          <p className="text-lg text-[var(--app-foreground-muted)] max-w-2xl mx-auto">
            Track your earnings and community growth across Zora and Rodeo platforms
          </p>
        </header>

        {!analyticsData ? (
          <div className="space-y-8 max-w-xl mx-auto">
            {/* Input Form */}
            <div className="bg-[var(--app-card-background)] p-8 rounded-xl shadow-sm border border-[var(--app-border)]">
              <h2 className="text-2xl font-semibold tracking-tight mb-6">Enter Your Platforms</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="zoraHandle" className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-2">
                    Zora Handle
                  </label>
                  <input
                    type="text"
                    id="zoraHandle"
                    value={zoraHandle}
                    onChange={(e) => setZoraHandle(e.target.value)}
                    placeholder="Enter your Zora handle"
                    className="w-full px-4 py-2.5 bg-[var(--app-background)] border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="rodeoUsername" className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-2">
                    Rodeo Username (Temporarily Unavailable)
                  </label>
                  <input
                    type="text"
                    id="rodeoUsername"
                    value={rodeoUsername}
                    onChange={(e) => setRodeoUsername(e.target.value)}
                    placeholder="Rodeo integration coming soon"
                    disabled={true}
                    className="w-full px-4 py-2.5 bg-[var(--app-background)] border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] focus:border-transparent transition-all duration-200 opacity-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-[var(--app-foreground-muted)]">
                    Rodeo integration is currently being updated. Please check back later.
                  </p>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                
                <Button
                  onClick={fetchAnalytics}
                  disabled={isLoading || (!zoraHandle && !rodeoUsername)}
                  className="w-full py-2.5 text-base font-medium transition-all duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Get Analytics'
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setAnalyticsData(null)}
                className="text-sm text-black px-4 py-2"
              >
                Search Another Creator
              </Button>
            </div>
            
            <Dashboard analyticsData={analyticsData} />
          </div>
        )}
      </div>
    </div>
  );
} 