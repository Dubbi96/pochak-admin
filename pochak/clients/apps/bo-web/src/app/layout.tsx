import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POCHAK Back Office",
  description: "POCHAK 관리자 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem("pochak-bo-theme")||"{}");if(t.state&&t.state.theme)document.documentElement.setAttribute("data-theme",t.state.theme)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
