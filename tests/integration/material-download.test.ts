import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { GET } from '@/app/api/student/materials/[id]/download/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  requireUser: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/recordings/access-logic', () => ({
  getStudentAccessContext: vi.fn(),
  isItemAccessible: vi.fn(),
}));

vi.mock('@/lib/audit/audit-log', () => ({
  createAuditLog: vi.fn(),
}));

describe('Material Download Route (Integration)', () => {
  const mockRequireUser = async (user = { id: 'user-1', email: 'test@example.com' }) => {
    const authModule = await import('@/lib/auth');
    (authModule.requireUser as Mock).mockResolvedValue({
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'mat-1',
                  class_id: 'class-1',
                  release_at: new Date().toISOString(),
                  published: true,
                  file_url: 'https://xxx.supabase.co/storage/v1/object/public/materials/folder/file.pdf'
                }
              })
            })
          })
        })
      },
      user
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    const authModule = await import('@/lib/auth');
    (authModule.requireUser as Mock).mockRejectedValue(new Error('Auth error'));

    const req = new NextRequest('http://localhost:3000/api/student/materials/123/download?action=view');
    
    // We expect the route to catch the error and return 500
    const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
    expect(res.status).toBe(500);
  });

  it('authorized student receives a valid response', async () => {
    await mockRequireUser();

    // Mock access logic to allow access
    const accessModule = await import('@/lib/recordings/access-logic');
    (accessModule.isItemAccessible as Mock).mockReturnValue(true);

    // Mock admin client for signed URL
    const adminModule = await import('@/lib/supabase/admin');
    (adminModule.createAdminClient as Mock).mockReturnValue({
      storage: {
        from: () => ({
          createSignedUrl: vi.fn().mockResolvedValue({
            data: { signedUrl: 'https://signed.url/file.pdf' },
            error: null
          })
        })
      }
    });

    const req = new NextRequest('http://localhost:3000/api/student/materials/mat-1/download?action=view');
    const res = await GET(req, { params: Promise.resolve({ id: 'mat-1' }) });
    
    // The route redirects to the signed URL
    expect(res.status).toBe(307); 
    expect(res.headers.get('location')).toBe('https://signed.url/file.pdf');
  });

  it('unauthorized student is rejected', async () => {
    await mockRequireUser();

    // Mock access logic to DENY access
    const accessModule = await import('@/lib/recordings/access-logic');
    (accessModule.isItemAccessible as Mock).mockReturnValue(false);

    const req = new NextRequest('http://localhost:3000/api/student/materials/mat-1/download?action=view');
    const res = await GET(req, { params: Promise.resolve({ id: 'mat-1' }) });
    
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Access denied');
  });
});
