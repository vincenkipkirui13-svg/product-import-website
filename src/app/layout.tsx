import type {Metadata,Viewport} from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata:Metadata={
  title:{default:"ImportHub | Global Products · Local Trust",template:"%s | ImportHub"},
  description:"A modern, mobile-first storefront for verified imported products, transparent availability and secure checkout.",
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://example.com"),
  applicationName:"ImportHub",
  keywords:["imported products","online shopping","Kenya","e-commerce","quality products"],
  robots:{index:true,follow:true},
  icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#087a50",colorScheme:"light"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body><SiteHeader/>{children}<SiteFooter/></body></html>;
}