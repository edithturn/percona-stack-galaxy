import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Percona Galaxy",
  description:
    "Interactive 3D galaxy map of Percona's open source database ecosystem — explore products, releases, and relationships.",
  openGraph: {
    title: "Percona Galaxy",
    description: "Explore Percona's open source database ecosystem in 3D.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (password managers, dark-mode
    // injectors, translators) can mutate <html>/<body> attributes after server render.
    // This tells React to ignore those specific attribute mismatches on the shell.
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#03040e] text-slate-100 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
