import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'NomadSpot — Remote Workplace & Cafe Discovery',
  description:
    'Find work-ready cafes with verified high-speed Wi-Fi, power outlets, quiet zones, and specialty coffee. Powered by OpenStreetMap & Nomad Community telemetry.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-nomad-navy-950 text-nomad-sand-50 antialiased selection:bg-nomad-teal-500 selection:text-white font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
