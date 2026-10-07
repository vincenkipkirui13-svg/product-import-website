import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {z} from "zod";
import {prisma} from "@/lib/prisma";

const inputSchema=z.object({
  customerName:z.string().trim().min(2).max(120),
  customerEmail:z.string().trim().email().max(200),
  customerPhone:z.string().trim().min(7).max(30),
  items:z.array(z.object({productId:z.string().min(1),quantity:z.number().int().min(1).max(99)})).min(1).max(100)
});

export async function POST(request:NextRequest){
  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret)return NextResponse.json({error:"Payment service is not configured."},{status:503});

  const body=await request.json().catch(()=>null);
  const parsed=inputSchema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Invalid checkout details."},{status:400});

  const merged=new Map<string,number>();
  for(const item of parsed.data.items)merged.set(item.productId,(merged.get(item.productId)||0)+item.quantity);

  const products=await prisma.product.findMany({
    where:{id:{in:[...merged.keys()]}}
  });
  if(products.length!==merged.size)return NextResponse.json({error:"One or more products are no longer available in the catalogue."},{status:409});

  const unavailable=products.find(p=>p.availability!=="AVAILABLE");
  if(unavailable)return NextResponse.json({error:`${unavailable.name} is currently unavailable.`},{status:409});

  const currencySet=new Set(products.map(p=>p.currency));
  if(currencySet.size!==1)return NextResponse.json({error:"This cart contains incompatible currencies."},{status:400});
  const currency=products[0].currency;
  const total=products.reduce((sum,p)=>sum+Number(p.sellingPrice)*(merged.get(p.id)||0),0);
  if(!Number.isFinite(total)||total<=0)return NextResponse.json({error:"The order total is invalid."},{status:400});

  const reference=`order-${randomUUID()}`;
  const order=await prisma.order.create({
    data:{
      reference,
      customerName:parsed.data.customerName,
      customerEmail:parsed.data.customerEmail,
      customerPhone:parsed.data.customerPhone,
      total:total.toFixed(2),
      currency,
      items:{create:products.map(p=>({productId:p.id,quantity:merged.get(p.id)||0,unitPrice:p.sellingPrice}))}
    }
  });

  try{
    const baseUrl=process.env.NEXT_PUBLIC_SITE_URL||request.nextUrl.origin;
    const response=await fetch("https://api.paystack.co/transaction/initialize",{
      method:"POST",
      headers:{"Authorization":`Bearer ${secret}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        email:order.customerEmail,
        amount:Math.round(total*100),
        currency,
        reference,
        callback_url:`${baseUrl}/checkout/callback`,
        metadata:{orderId:order.id,orderReference:order.reference}
      }),
      cache:"no-store"
    });
    const data=await response.json().catch(()=>null);
    if(!response.ok||!data?.status||!data?.data?.authorization_url){
      await prisma.order.update({where:{id:order.id},data:{status:"FAILED",paymentStatus:"FAILED"}});
      return NextResponse.json({error:"Payment initialization failed. The order was not charged."},{status:502});
    }
    await prisma.order.update({where:{id:order.id},data:{paystackReference:data.data.reference}});
    return NextResponse.json({authorizationUrl:data.data.authorization_url,reference:data.data.reference});
  }catch{
    await prisma.order.update({where:{id:order.id},data:{status:"FAILED",paymentStatus:"FAILED"}});
    return NextResponse.json({error:"Payment service could not be reached. The order was not charged."},{status:502});
  }
}