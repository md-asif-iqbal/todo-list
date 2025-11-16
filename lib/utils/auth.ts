import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';

export async function getAuthUser(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    return payload;
  } catch {
    return null;
  }
}

