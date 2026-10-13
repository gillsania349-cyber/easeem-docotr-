import "./globals.css";

export const metadata = {
  title: "PakMed — Healthcare. Connected.",
  description:
    "PakMed — Healthcare. Connected. Jobs, doctors and medical equipment across Pakistan.",
  appleWebApp: {
    capable: true,
    title: "PakMed",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F4F6FA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, height: "100%" }}>{children}</body>
    </html>
  );
}
