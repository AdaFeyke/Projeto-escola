import { redirect } from 'next/navigation';
import { getUserFromCookie } from '~/services/auth/auth.service';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserFromCookie();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}
