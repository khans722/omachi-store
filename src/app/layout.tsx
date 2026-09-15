import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CustomerProvider } from '@/context/CustomerContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import MobileBottomNav from '@/components/MobileBottomNav';
import AuthModal from '@/components/AuthModal';

export const metadata: Metadata = {
  title: 'Omachi 🌿 Tiệm Charm & Phụ Kiện Handmade Xinh Xắn',
  description: 'Chuyên phụ kiện charm handmade, hạt cườm beads haul, kẹp tóc hoa kem bơ, phone charm, túi mù. Phong cách pastel nàng thơ tươi mát, chốt đơn Zalo tiện lợi!',
  icons: {
    icon: [
      { url: '/images/omachi_hamster_clean.png', type: 'image/png' },
      { url: '/images/omachi_hamster.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/omachi_hamster_clean.png',
    apple: '/images/omachi_hamster_clean.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth" data-theme="green">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col transition-colors duration-500 pb-16 md:pb-0 relative overflow-x-hidden antialiased">
        <ThemeProvider>
          <CustomerProvider>
            <CartProvider>
              {/* 🌈 Ambient Multi-Hue Silk Mesh Wave Glow Backgrounds - Rõ nét, bồng bềnh, ngọt ngào */}
              <div className="silk-mesh-blob-1" />
              <div className="silk-mesh-blob-2" />
              <div className="silk-mesh-blob-3" />
              <div className="silk-mesh-blob-4" />
              <div className="silk-acrylic-sheen" />

              <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
                  {children}
                </main>

                <CartDrawer />
                <Footer />
                <MobileBottomNav />
                <AuthModal />
              </div>
            </CartProvider>
          </CustomerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
