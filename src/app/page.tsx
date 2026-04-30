import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (session) {
    // Try to find the user and their role to redirect properly
    const user = await prisma.user.findUnique({
      where: { id: session.value },
      select: { role: true }
    });

    if (user) {
      switch (user.role) {
        case 'ADMIN':
          redirect('/admin-panel');
        case 'TREASURER':
          redirect('/treasurer-dashboard');
        case 'SECRETARY':
          redirect('/secretary-dashboard');
        case 'MEMBER':
          redirect('/member-dashboard');
      }
    }
  }

  redirect('/login-screen');
}
