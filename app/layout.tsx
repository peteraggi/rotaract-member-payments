import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import { cn } from "@/lib/utils";
// import AuthProvider from "../context/AuthProvider";
import { Toaster } from "react-hot-toast";

const myFont = localFont({
    src: [
        {
            path: './fonts/fonnts.com-DegularDemo-Light.otf',

            weight: '300', // Lighter weight for paragraphs
            style: 'normal',
        },
        {
            path: './fonts/fonnts.com-DegularDemo-Regular.otf',
            weight: '400',
            style: 'normal',
        },
        {

            path: './fonts/fonnts.com-DegularDemo-Medium.otf',

            weight: '500', // Medium weight for subheadings

            style: 'normal',

        },

        {
            path: './fonts/fonnts.com-DegularDemo-Bold.otf',
            weight: '700', // Bold weight for headings
            style: 'normal',
        },
        {

            path: './fonts/fonnts.com-DegularDemo-Black.otf',
            weight: '900', // Heaviest weight for emphasis
            style: 'normal',

        },
    ],
})
export const metadata: Metadata = {
  title: "Rotaract Member Registration",
  description: "REI #25 Registration || Rotary International || Rotaract Earth Initiative || Tree Planting Campaign 2025 || Mt Elgon",
  icons: {
    icon: '/logo.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={cn(myFont.className)}
      >
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
