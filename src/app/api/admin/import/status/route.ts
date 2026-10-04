import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const runs=await prisma.importRun.findMany({orderBy:{startedAt:"desc"},take:20});
 return NextResponse.json({runs});
}