import {createHash,randomBytes,scrypt,timingSafeEqual} from "node:crypto";

const KEY_LENGTH=64;

function scryptAsync(password:string,salt:Buffer,keylen:number,options:{N:number;r:number;p:number;maxmem:number}):Promise<Buffer>{
  return new Promise((resolve,reject)=>{
    scrypt(password,salt,keylen,options,(error,derivedKey)=>{
      if(error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function verifyAdminPassword(password:string,stored:string){
  if(stored.startsWith("scrypt$")){
    const [,N,r,p,salt,hash]=stored.split("$");
    const cost=Number(N),block=Number(r),parallel=Number(p);
    if(!salt||!hash||!Number.isSafeInteger(cost)||!Number.isSafeInteger(block)||!Number.isSafeInteger(parallel))return false;
    try{
      const derived=await scryptAsync(password,Buffer.from(salt,"base64"),KEY_LENGTH,{N:cost,r:block,p:parallel,maxmem:32*1024*1024});
      const expected=Buffer.from(hash,"base64");
      return expected.length===derived.length&&timingSafeEqual(expected,derived);
    }catch{return false}
  }
  const legacy=createHash("sha256").update(password).digest("hex");
  return legacy.length===stored.length&&timingSafeEqual(Buffer.from(legacy),Buffer.from(stored));
}

export async function createScryptPasswordHash(password:string){
  const salt=randomBytes(16);
  const N=16384,r=8,p=1;
  const derived=await scryptAsync(password,salt,KEY_LENGTH,{N,r,p,maxmem:32*1024*1024});
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}