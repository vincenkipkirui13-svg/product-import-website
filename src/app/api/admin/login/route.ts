import {NextRequest,NextResponse} from "next/server";
import {createSession,sessionCookie} from "@/lib/auth";
import {verifyAdminPassword} from "@/lib/password";

const attempts=new Map<string,{count:number;resetAt:number}>();
const WINDOW_MS=10*60*1000;
const MAX_ATTEMPTS=10;

function rateLimitKey(request:NextRequest,email:string){
  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  return `${forwarded}:${email}`;
}

export async function POST(request:NextRequest){
 const body=await request.json().catch(()=>null);
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
 const password=typeof body?.password==="string"?body.password:"";
 const expectedEmail=(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
 const expectedHash=process.env.ADMIN_PASSWORD_HASH||"";
 if(!expectedEmail||!expectedHash)return NextResponse.json({error:"Admin authentication is not configured."},{status:503});

 const key=rateLimitKey(request,email);
 const now=Date.now();
 const record=attempts.get(key);
 if(record&&record.resetAt>now&&record.count>=MAX_ATTEMPTS)return NextResponse.json({error:"Too many sign-in attempts. Please wait a few minutes and try again."},{status:429,headers:{"Retry-After":String(Math.ceil((record.resetAt-now)/1000))}});
 if(!record||record.resetAt<=now)attempts.set(key,{count:0,resetAt:now+WINDOW_MS});

 const okEmail=email===expectedEmail;
 const okHash=okEmail?await verifyAdminPassword(password,expectedHash):false;
 if(!okEmail||!okHash){
   const current=attempts.get(key)!; current.count+=1;
   return NextResponse.json({error:"Invalid credentials."},{status:401});
 }
 attempts.delete(key);
 const {token,signature}=createSession();
 const response=NextResponse.json({ok:true});
 response.headers.set("Cache-Control","no-store");
 response.headers.set("Set-Cookie",sessionCookie(token,signature));
 return response;
}