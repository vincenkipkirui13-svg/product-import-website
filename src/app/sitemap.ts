import type {MetadataRoute} from "next";
import {prisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=process.env.NEXT_PUBLIC_SITE_URL||"https://example.com";
  const staticPaths=["/","/products","/categories"];
  try{
    const products=await prisma.product.findMany({select:{slug:true,updatedAt:true}});
    return [
      ...staticPaths.map(path=>({url:`${base}${path}`,changeFrequency:"daily" as const,priority:path==="/" ? 1 : .7})),
      ...products.map(product=>({url:`${base}/products/${product.slug}`,lastModified:product.updatedAt,changeFrequency:"weekly" as const,priority:.8}))
    ];
  }catch{
    return staticPaths.map(path=>({url:`${base}${path}`,changeFrequency:"daily" as const,priority:path==="/" ? 1 : .7}));
  }
}