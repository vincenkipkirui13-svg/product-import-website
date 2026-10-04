import {createHmac,randomBytes,timingSafeEqual} from "node:crypto";
const cookieName="admin_session";
function secret(){const value=process.env.SESSION_SECRET;if(!value)throw new Error("SESSION_SECRET is not configured");return value}
function digest(value:string){return createHmac("sha256",secret()).update(value).digest("hex")}
export function createSession(){const token=randomBytes(32).toString("hex");return {token,signature:digest(token)}}
export function verifySession(token:string,signature:string){try{const expected=digest(token);return expected.length===signature.length&&timingSafeEqual(Buffer.from(expected),Buffer.from(signature))}catch{return false}}
export function sessionCookie(token:string,signature:string){return `${cookieName}=${token}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`}
export {cookieName};