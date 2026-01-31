import type { Metadata } from 'next';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });

export const metadata: Metadata = {
    title: 'Joe Irizarry | Portfolio',
    description: 'Director / Editor / VFX',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${oswald.variable} font-sans antialiased`} style={{ cursor: 'none' }}>
                {children}
            </body>
        </html>
    );
}
