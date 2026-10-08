import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {isAdminAuthenticated} from "@/lib/admin-guard";

export async function GET(){
 if(!(await isAdminAuthenticated()))return NextResponse.json({error:"Unauthorized."},{status:401});
 const runs=await prisma.importRun.findMany({orderBy:{startedAt:"desc"},take:20});
 return NextResponse.json({runs},{headers:{"Cache-Control":"no-store"}});
}