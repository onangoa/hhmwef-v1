import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Get the user ID from the request headers or cookies
    // Since we're using localStorage on the client, we need to pass the user ID
    const userId = request.headers.get('x-user-id') || 
                   request.cookies.get('user-id')?.value;

    // Debug: Log all headers
    console.log('Auth Debug - Headers:', Object.fromEntries(request.headers.entries()));
    console.log('Auth Debug - User ID from header:', request.headers.get('x-user-id'));
    console.log('Auth Debug - User ID from cookie:', request.cookies.get('user-id')?.value);

    if (!userId) {
      console.log('Auth Debug - No user ID found');
      return null;
    }

    console.log('Auth Debug - Found user ID:', userId);

    // Verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: true,
      },
    });

    if (!user) {
      console.log('Auth Debug - User not found in database');
      return null;
    }

    console.log('Auth Debug - User found:', user.id);
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}