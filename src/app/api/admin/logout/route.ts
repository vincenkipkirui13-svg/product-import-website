import {NextResponse} from "next/server";

export async function POST(){
  const response=NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  response.headers.set("Set-Cookie","admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return response;
}