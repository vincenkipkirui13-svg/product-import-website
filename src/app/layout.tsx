import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:{default:"Product Store",template:"%s | Product Store"},description:"A modern online store for quality products.",metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://example.com"),robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}