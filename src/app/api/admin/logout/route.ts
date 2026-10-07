import {NextResponse} from "next/server";

export async function POST(request:Request){
  const url=new URL("/admin/login",request.url);
  const response=NextResponse.redirect(url);
  const secure=process.env.NODE_ENV==="production"?" Secure;":"";
  response.headers.set("Set-Cookie",`admin_session=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`);
  return response;
}