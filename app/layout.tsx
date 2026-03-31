import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { CLERK_AUTH_APPEARANCE_OVERRIDE } from "@/lib/constants";


const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Bookify",
  description: "将您的书籍转化为交互式人工智能对话，上传PDF文件并使用语音与书籍聊天",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSerif.variable} ${monaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider appearance={CLERK_AUTH_APPEARANCE_OVERRIDE}>
          <NavBar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}