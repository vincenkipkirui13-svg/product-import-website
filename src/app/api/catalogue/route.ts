import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

type CatalogueProduct = {
  sourcePrice: {toString(): string};
  sellingPrice: {toString(): string};
  [key: string]: unknown;
};

export async function GET(){
  const products: CatalogueProduct[]=await prisma.product.findMany({
    orderBy:{updatedAt:"desc"},
    include:{images:{orderBy:{sortOrder:"asc"},take:1}}
  });
  return NextResponse.json({
    products:products.map((p)=>({
      ...p,
      sourcePrice:p.sourcePrice.toString(),
      sellingPrice:p.sellingPrice.toString()
    }))
  });
}