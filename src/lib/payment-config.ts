import {createCipheriv,createDecipheriv,createHash,randomBytes} from "node:crypto";
import {prisma} from "@/lib/prisma";

const TABLE_SQL='CREATE TABLE IF NOT EXISTS "PaymentSettings" ("id" TEXT NOT NULL DEFAULT \'default\',"enabled" BOOLEAN NOT NULL DEFAULT false,"publicKey" TEXT,"secretKeyEncrypted" TEXT,"secretKeyLast4" TEXT,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id"))';

let tableReady:Promise<void>|null=null;

export async function ensurePaymentSettingsTable(){
  if(!tableReady){
    tableReady=prisma.$executeRawUnsafe(TABLE_SQL).then(()=>undefined).catch(error=>{
      tableReady=null;
      throw error;
    });
  }
  return tableReady;
}

function encryptionKey(){
  const secret=process.env.SESSION_SECRET;
  if(!secret)throw new Error("SESSION_SECRET is not configured");
  return createHash("sha256").update(secret).digest();
}

function encryptSecret(value:string){
  const iv=randomBytes(12);
  const cipher=createCipheriv("aes-256-gcm",encryptionKey(),iv);
  const ciphertext=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
  const tag=cipher.getAuthTag();
  return "v1."+iv.toString("base64url")+"."+tag.toString("base64url")+"."+ciphertext.toString("base64url");
}

function decryptSecret(value:string){
  const [version,ivText,tagText,cipherText]=value.split(".");
  if(version!=="v1"||!ivText||!tagText||!cipherText)throw new Error("Invalid encrypted payment secret");
  const decipher=createDecipheriv("aes-256-gcm",encryptionKey(),Buffer.from(ivText,"base64url"));
  decipher.setAuthTag(Buffer.from(tagText,"base64url"));
  return Buffer.concat([decipher.update(Buffer.from(cipherText,"base64url")),decipher.final()]).toString("utf8");
}

export async function getPaymentSettings(){
  await ensurePaymentSettingsTable();
  const stored=await prisma.paymentSettings.findUnique({where:{id:"default"}});
  const environmentSecret=process.env.PAYSTACK_SECRET_KEY?.trim()||"";
  const environmentPublic=process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim()||"";
  const secret=stored?.secretKeyEncrypted?decryptSecret(stored.secretKeyEncrypted):environmentSecret;
  const publicKey=stored?.publicKey||environmentPublic;
  return {
    enabled:stored?.enabled??Boolean(secret),
    publicKey,
    secretKey:secret,
    secretConfigured:Boolean(secret),
    publicConfigured:Boolean(publicKey),
    secretLast4:stored?.secretKeyLast4||secret.slice(-4)||"",
    updatedAt:stored?.updatedAt||null,
    source:stored?.secretKeyEncrypted?"admin":"environment"
  };
}

export async function savePaymentSettings(input:{enabled:boolean;publicKey:string;secretKey?:string}){
  await ensurePaymentSettingsTable();
  const current=await prisma.paymentSettings.findUnique({where:{id:"default"}});
  const secret=input.secretKey?.trim()||(current?.secretKeyEncrypted?decryptSecret(current.secretKeyEncrypted):process.env.PAYSTACK_SECRET_KEY?.trim()||"");
  const publicKey=input.publicKey.trim()||(current?.publicKey||process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim()||"");
  const data={
    enabled:input.enabled,
    publicKey:publicKey||null,
    secretKeyEncrypted:secret?encryptSecret(secret):null,
    secretKeyLast4:secret?secret.slice(-4):null
  };
  await prisma.paymentSettings.upsert({where:{id:"default"},create:{id:"default",...data},update:data});
  return getPaymentSettings();
}
