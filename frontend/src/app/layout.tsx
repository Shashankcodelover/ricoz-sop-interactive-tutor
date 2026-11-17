import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RicoZ | Internal Knowledge & SOP Interactive Tutor",
  description: "Enterprise operational procedure execution, automated SOP tutor, and conflict governance engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
