// app/layout.js
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/app/lib/hooks/useAuth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RentBW - Property Discovery in Gaborone',
  description: 'Find your perfect rental property in Gaborone, Botswana',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}