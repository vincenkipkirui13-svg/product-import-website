import {NextRequest,NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {createSession,sessionCookie} from "@/lib/auth";
export async function POST(request:NextRequest){
 const body=await request.json().catch(()=>null);
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
 const password=typeof body?.password==="string"?body.password:"";
 const expectedEmail=(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
 const expectedHash=process.env.ADMIN_PASSWORD_HASH||"";
 if(!expectedEmail||!expectedHash)return NextResponse.json({error:"Admin authentication is not configured."},{status:503});
 const passwordHash=(await import("node:crypto")).createHash("sha256").update(password).digest("hex");
 const okEmail=email===expectedEmail;
 const okHash=passwordHash.length===expectedHash.length&&timingSafeEqual(Buffer.from(passwordHash),Buffer.from(expectedHash));
 if(!okEmail||!okHash)return NextResponse.json({error:"Invalid credentials."},{status:401});
 const {token,signature}=createSession();
 const response=NextResponse.json({ok:true});
 response.headers.set("Set-Cookie",sessionCookie(token,signature));
 return response;
}