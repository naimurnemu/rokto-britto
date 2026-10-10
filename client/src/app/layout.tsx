import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import { ThemeProvider } from '../components/theme-provider';

export const metadata: Metadata = {
  title: 'Rokto Britto (রক্ত বৃত্ত) - Live Blood Emergency Dispatch',
  description: 'Location-based live blood info system with strict 20km proximity dispatch, anti-spam chat, and community protection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-border bg-card/60 py-6 text-center text-xs text-muted-foreground backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>© 2026 Rokto Britto (রক্ত বৃত্ত). Built for real-world life-saving emergencies.</p>
              <div className="flex items-center gap-4 text-muted-foreground font-medium">
                <span>Strict 20km Proximity</span>
                <span>•</span>
                <span>Anti-Spam 1-Message Rule</span>
                <span>•</span>
                <span>Two-Strike Ban Safety</span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
