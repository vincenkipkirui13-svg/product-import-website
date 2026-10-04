import {cookies} from "next/headers";
import {cookieName,verifySession} from "@/lib/auth";
export async function isAdminAuthenticated(){const value=(await cookies()).get(cookieName)?.value;if(!value)return false;const [token,signature]=value.split(".");return !!token&&!!signature&&verifySession(token,signature)}
export async function requireAdmin(){if(!(await isAdminAuthenticated()))throw new Error("UNAUTHORIZED")}