import {NextResponse} from "next/server";
import {isAdminAuthenticated} from "@/lib/admin-guard";
import {getPaymentSettings} from "@/lib/payment-config";
import {testPaystackConnection} from "@/lib/paystack";

export async function POST(){
  if(!(await isAdminAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const settings=await getPaymentSettings();
    if(!settings.secretKey)return NextResponse.json({error:"Add a Paystack secret key first."},{status:400});
    const result=await testPaystackConnection();
    return NextResponse.json({
      ok:result.ok,
      message:result.ok?"Paystack credentials are valid and the API is reachable.":result.message,
      mode:settings.secretKey.startsWith("sk_live_")?"live":settings.secretKey.startsWith("sk_test_")?"test":"unknown"
    },{status:result.ok?200:502});
  }catch{return NextResponse.json({error:"Could not test the Paystack connection."},{status:502});}
}
