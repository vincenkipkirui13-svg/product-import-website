import {createHmac,timingSafeEqual} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {verifyPaystackTransaction} from "@/lib/paystack";

export async function POST(request:NextRequest){
  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret)return NextResponse.json({error:"Webhook is not configured."},{status:503});

  const raw=await request.text();
  const signature=request.headers.get("x-paystack-signature")||"";
  const expected=createHmac("sha512",secret).update(raw).digest("hex");
  const valid=signature.length===expected.length&&timingSafeEqual(Buffer.from(signature),Buffer.from(expected));
  if(!valid)return NextResponse.json({error:"Invalid webhook signature."},{status:401});

  let event:{event?:string;data?:{reference?:string;amount?:number;currency?:string}}={};
  try{event=JSON.parse(raw);}catch{return NextResponse.json({ok:true});}

  const reference=event.data?.reference;
  if(!reference)return NextResponse.json({ok:true});
  if(event.event!=="charge.success"&&event.event!=="charge.failed")return NextResponse.json({ok:true});

  const order=await prisma.order.findFirst({where:{OR:[{reference},{paystackReference:reference}]}});
  if(!order)return NextResponse.json({ok:true});

  if(event.event==="charge.failed"){
    if(order.paymentStatus!=="SUCCESS")await prisma.order.update({where:{id:order.id},data:{status:"FAILED",paymentStatus:"FAILED",paystackReference:reference}});
    return NextResponse.json({ok:true});
  }

  try{
    const verification=await verifyPaystackTransaction(reference);
    const data=verification.data;
    const amountMatches=!!data&&data.amount===Math.round(Number(order.total)*100);
    const currencyMatches=!!data&&data.currency===order.currency;
    if(verification.status&&data?.status==="success"&&amountMatches&&currencyMatches){
      await prisma.order.update({where:{id:order.id},data:{status:"PAID",paymentStatus:"SUCCESS",paystackReference:reference}});
    }
  }catch{}

  return NextResponse.json({ok:true});
}