import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export async function GET(){
  const products=await prisma.product.findMany({orderBy:{updatedAt:"desc"},include:{images:{orderBy:{sortOrder:"asc"},take:1}}});
  return NextResponse.json({products:products.map(p=>({...p,sourcePrice:p.sourcePrice.toString(),sellingPrice:p.sellingPrice.toString()}))});
}