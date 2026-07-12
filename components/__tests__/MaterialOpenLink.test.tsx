import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MaterialOpenLink } from '../materials/MaterialOpenLink';

describe('MaterialOpenLink', () => {
  it('renders a link with the correct view URL by default', () => {
    render(
      <MaterialOpenLink materialId="123" className="test-class">
        Open Material
      </MaterialOpenLink>
    );

    const link = screen.getByRole('link', { name: 'Open Material' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/api/student/materials/123/download?action=view');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveClass('test-class');
  });

  it('renders a link with the correct download URL when action is download', () => {
    render(
      <MaterialOpenLink materialId="123" action="download">
        Download Material
      </MaterialOpenLink>
    );

    const link = screen.getByRole('link', { name: 'Download Material' });
    expect(link).toHaveAttribute('href', '/api/student/materials/123/download?action=download');
  });
});
