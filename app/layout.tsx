import type { Metadata, Viewport } from "next";
import { Fredoka, Montserrat } from "next/font/google";
import { BeeBackground } from "@/components/bee-background";
import "./globals.css";

// Body / UI text
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

// Headings: rounded and friendly, still clean
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Bee",
};

export const viewport: Viewport = {
  themeColor: "#110f0b",
  // Keyboard overlays the page instead of shrinking it (stops layout jumps on Android).
  interactiveWidget: "resizes-visual",
};

// Runs before paint so light-mode users don't see a dark flash.
const themeScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${fredoka.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <BeeBackground />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
