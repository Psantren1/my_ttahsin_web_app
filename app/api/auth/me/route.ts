import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let levelProgram: string | null = null;
    try {
      const { queryOne } = await import('@/lib/db/client');
      const user = await queryOne<{ level_program: string | null }>(
        'SELECT level_program FROM users WHERE id = $1', [session.userId]
      );
      levelProgram = user?.level_program ?? null;
    } catch {}

    return NextResponse.json({
      data: {
        id: session.userId,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
        levelProgram,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
