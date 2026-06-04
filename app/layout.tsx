import Link from "next/link";
import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "red-agent",
  description: "Adversarial finance-agent stress testing harness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="navInner">
            <Link href="/" className="navLogo">
              red-agent <span className="badge">beta</span>
            </Link>
            <ul className="navLinks">
              <li><Link href="/">Dashboard</Link></li>
              <li><Link href="/about">How it works</Link></li>
            </ul>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
