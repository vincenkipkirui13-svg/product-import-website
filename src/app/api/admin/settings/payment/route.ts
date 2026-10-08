import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {isAdminAuthenticated} from "@/lib/admin-guard";
import {getPaymentSettings,savePaymentSettings} from "@/lib/payment-config";

const schema=z.object({
  enabled:z.boolean(),
  publicKey:z.string().trim().max(300).optional().default(""),
  secretKey:z.string().trim().max(500).optional().default("")
});

export async function GET(){
  if(!(await isAdminAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const settings=await getPaymentSettings();
    return NextResponse.json({
      enabled:settings.enabled,publicKey:settings.publicKey,secretConfigured:settings.secretConfigured,
      publicConfigured:settings.publicConfigured,secretLast4:settings.secretLast4,
      mode:settings.secretKey.startsWith("sk_live_")?"live":settings.secretKey.startsWith("sk_test_")?"test":"unknown",
      source:settings.source
    },{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Unable to load payment settings."},{status:500});}
}

export async function POST(request:NextRequest){
  if(!(await isAdminAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await request.json().catch(()=>null);
  const parsed=schema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Invalid payment settings."},{status:400});

  if(parsed.data.publicKey&&!parsed.data.publicKey.startsWith("pk_"))return NextResponse.json({error:"The Paystack public key must start with pk_."},{status:400});
  if(parsed.data.secretKey&&!parsed.data.secretKey.startsWith("sk_"))return NextResponse.json({error:"The Paystack secret key must start with sk_."},{status:400});

  try{
    const current=await getPaymentSettings();
    if(parsed.data.enabled&&!(parsed.data.secretKey||current.secretKey))return NextResponse.json({error:"Add the Paystack secret key before enabling payments."},{status:400});
    const settings=await savePaymentSettings({enabled:parsed.data.enabled,publicKey:parsed.data.publicKey,secretKey:parsed.data.secretKey});
    return NextResponse.json({
      ok:true,enabled:settings.enabled,publicConfigured:settings.publicConfigured,
      secretConfigured:settings.secretConfigured,secretLast4:settings.secretLast4,
      mode:settings.secretKey.startsWith("sk_live_")?"live":settings.secretKey.startsWith("sk_test_")?"test":"unknown"
    });
  }catch{return NextResponse.json({error:"Unable to save payment settings."},{status:500});}
}
