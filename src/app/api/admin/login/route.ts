import {NextRequest,NextResponse} from "next/server";
import {createSession,sessionCookie} from "@/lib/auth";
import {verifyAdminPassword} from "@/lib/password";

const attempts=new Map<string,{count:number;resetAt:number}>();
const WINDOW_MS=10*60*1000;
const MAX_ATTEMPTS=10;

function rateLimitKey(request:NextRequest,username:string){
  const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  return `${forwarded}:${username}`;
}

export async function POST(request:NextRequest){
 const body=await request.json().catch(()=>null);
 const username=typeof body?.username==="string"?body.username.trim():typeof body?.email==="string"?body.email.trim():"";
 const password=typeof body?.password==="string"?body.password:"";
 const expectedUsername=(process.env.ADMIN_USERNAME||process.env.ADMIN_EMAIL||"").trim();
 const expectedHash=process.env.ADMIN_PASSWORD_HASH||"";
 if(!expectedUsername||!expectedHash)return NextResponse.json({error:"Admin authentication is not configured."},{status:503});

 const key=rateLimitKey(request,username.toLowerCase());
 const now=Date.now();
 const record=attempts.get(key);
 if(record&&record.resetAt>now&&record.count>=MAX_ATTEMPTS)return NextResponse.json({error:"Too many sign-in attempts. Please wait a few minutes and try again."},{status:429,headers:{"Retry-After":String(Math.ceil((record.resetAt-now)/1000))}});
 if(!record||record.resetAt<=now)attempts.set(key,{count:0,resetAt:now+WINDOW_MS});

 const okUsername=username.toLowerCase()===expectedUsername.toLowerCase();
 const okHash=okUsername?await verifyAdminPassword(password,expectedHash):false;
 if(!okUsername||!okHash){
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