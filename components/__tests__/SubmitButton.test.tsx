import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubmitButton } from '../SubmitButton';
import React from 'react';

// Mock useFormStatus
const mockUseFormStatus = vi.fn();
vi.mock('react-dom', async () => {
  const original = await vi.importActual('react-dom');
  return {
    ...original,
    useFormStatus: () => mockUseFormStatus(),
  };
});

describe('SubmitButton', () => {
  it('renders correctly with default state (not pending)', () => {
    mockUseFormStatus.mockReturnValue({ pending: false });
    
    render(<SubmitButton label="Submit" loadingLabel="Submitting..." />);
    
    const button = screen.getByRole('button', { name: /Submit/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.queryByText('Submitting...')).not.toBeInTheDocument();
  });

  it('renders loading state correctly (pending)', () => {
    mockUseFormStatus.mockReturnValue({ pending: true });
    
    render(<SubmitButton label="Submit" loadingLabel="Submitting..." />);
    
    const button = screen.getByRole('button', { name: /Submitting/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    
    // Check for spinner svg
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
  });
});
