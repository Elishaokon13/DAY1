"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/analytics/Dashboard";

// Import the AnalyticsData type from Dashboard component
import type { AnalyticsData } from "@/components/analytics/Dashboard";

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
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Creator Analytics</h1>
          <p className="text-center text-[var(--app-foreground-muted)]">
            Track your earnings across platforms
          </p>
        </header>

        {!analyticsData ? (
          <div className="space-y-6 max-w-md mx-auto">
            {/* Input Form */}
            <div className="bg-[var(--app-card-background)] p-6 rounded-lg shadow-sm border border-[var(--app-border)]">
              <h2 className="text-xl font-semibold mb-4">Enter Your Platforms</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="zora-handle" className="block text-sm font-medium mb-1">
                    Zora Handle
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--app-foreground-muted)]">
                      @
                    </div>
                    <input
                      id="zora-handle"
                      type="text"
                      value={zoraHandle}
                      onChange={(e) => setZoraHandle(e.target.value)}
                      placeholder="username"
                      className="bg-[var(--app-input-background)] border border-[var(--app-border)] rounded-md w-full py-2 pl-8 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="rodeo-username" className="block text-sm font-medium mb-1">
                    Rodeo Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--app-foreground-muted)]">
                      @
                    </div>
                    <input
                      id="rodeo-username"
                      type="text"
                      value={rodeoUsername}
                      onChange={(e) => setRodeoUsername(e.target.value)}
                      placeholder="username"
                      className="bg-[var(--app-input-background)] border border-[var(--app-border)] rounded-md w-full py-2 pl-8 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm mt-2">
                    {error}
                  </div>
                )}
                
                <Button
                  onClick={fetchAnalytics}
                  disabled={isLoading || (!zoraHandle && !rodeoUsername)}
                  className="w-full"
                >
                  {isLoading ? 'Loading...' : 'Get Analytics'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setAnalyticsData(null)}
                className="text-sm"
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