import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Film Ribbon Portfolio',
    description: 'An immersive 3D portfolio experience',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased" style={{ cursor: 'none' }}>
                {children}
            </body>
        </html>
    );
}
