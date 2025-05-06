import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../analytics/StatCard';

describe('StatCard Component', () => {
  it('renders title and value correctly', () => {
    render(<StatCard title="Test Title" value="123" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
  
  it('renders subtext when provided', () => {
    render(
      <StatCard title="Test Title" value="123" subtext="Additional info" />
    );
    
    expect(screen.getByText('Additional info')).toBeInTheDocument();
  });
  
  it('renders icon when provided', () => {
    const testIcon = <span data-testid="test-icon">Icon</span>;
    
    render(
      <StatCard title="Test Title" value="123" icon={testIcon} />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
  
  it('renders positive trend correctly', () => {
    render(
      <StatCard 
        title="Test Title" 
        value="123" 
        trend={{ value: 5, isPositive: true }} 
      />
    );
    
    const trendElement = screen.getByText('↑ 5%');
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass('text-green-500');
  });
  
  it('renders negative trend correctly', () => {
    render(
      <StatCard 
        title="Test Title" 
        value="123" 
        trend={{ value: 5, isPositive: false }} 
      />
    );
    
    const trendElement = screen.getByText('↓ 5%');
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass('text-red-500');
  });
}); 