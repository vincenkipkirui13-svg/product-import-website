import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {verifyPaystackTransaction} from "@/lib/paystack";

export async function GET(request:NextRequest){
  const reference=request.nextUrl.searchParams.get("reference")?.trim();
  if(!reference)return NextResponse.json({error:"Payment reference is required."},{status:400});
  const order=await prisma.order.findFirst({where:{OR:[{reference},{paystackReference:reference}]}});
  if(!order)return NextResponse.json({error:"Order not found."},{status:404});
  if(order.paymentStatus==="SUCCESS")return NextResponse.json({ok:true,status:"success",reference:order.paystackReference||reference});

  try{
    const verification=await verifyPaystackTransaction(reference);
    const data=verification.data;
    if(!verification.status||!data)return NextResponse.json({error:verification.message||"Payment verification failed."},{status:502});

    const expectedAmount=Math.round(Number(order.total)*100);
    const amountMatches=data.amount===expectedAmount;
    const currencyMatches=data.currency===order.currency;

    if(data.status==="success"&&amountMatches&&currencyMatches){
      await prisma.order.update({where:{id:order.id},data:{status:"PAID",paymentStatus:"SUCCESS",paystackReference:reference}});
      return NextResponse.json({ok:true,status:"success",reference});
    }
    if(data.status==="success"&&!amountMatches)return NextResponse.json({error:"Payment amount does not match the order. The payment was not accepted."},{status:409});
    if(data.status==="success"&&!currencyMatches)return NextResponse.json({error:"Payment currency does not match the order. The payment was not accepted."},{status:409});
    return NextResponse.json({ok:false,status:data.status},{status:200});
  }catch{
    return NextResponse.json({error:"Unable to verify payment right now."},{status:502});
  }
}
