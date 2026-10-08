import {getPaymentSettings} from "@/lib/payment-config";

const PAYSTACK_API="https://api.paystack.co";

export type PaystackVerification={
  status:boolean;
  message?:string;
  data?:{status:string;reference:string;amount:number;currency:string};
};

export type PaystackInitialization={
  status:boolean;
  message?:string;
  data?:{authorization_url:string;access_code:string;reference:string};
};

async function secretKey(){
  const settings=await getPaymentSettings();
  if(!settings.secretKey)throw new Error("Paystack secret key is not configured");
  return settings.secretKey;
}

export async function initializePaystackTransaction(input:{
  email:string;amount:number;currency:string;reference:string;callbackUrl:string;metadata:Record<string,string>;
}):Promise<PaystackInitialization>{
  const secret=await secretKey();
  const response=await fetch(PAYSTACK_API+"/transaction/initialize",{
    method:"POST",
    headers:{Authorization:"Bearer "+secret,"Content-Type":"application/json","Cache-Control":"no-cache"},
    body:JSON.stringify({
      email:input.email,amount:input.amount,currency:input.currency,reference:input.reference,
      callback_url:input.callbackUrl,metadata:input.metadata
    }),
    cache:"no-store"
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok||!data)return {status:false,message:"Paystack did not return a valid response."};
  return data as PaystackInitialization;
}

export async function verifyPaystackTransaction(reference:string):Promise<PaystackVerification>{
  const secret=await secretKey();
  const response=await fetch(PAYSTACK_API+"/transaction/verify/"+encodeURIComponent(reference),{
    headers:{Authorization:"Bearer "+secret},
    cache:"no-store"
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok||!data)return {status:false,message:"Paystack verification request failed."};
  return data as PaystackVerification;
}

export async function testPaystackConnection(){
  const secret=await secretKey();
  const response=await fetch(PAYSTACK_API+"/balance",{headers:{Authorization:"Bearer "+secret},cache:"no-store"});
  const data=await response.json().catch(()=>null);
  return {ok:response.ok&&Boolean(data?.status),message:typeof data?.message==="string"?data.message:"Paystack connection failed."};
}
