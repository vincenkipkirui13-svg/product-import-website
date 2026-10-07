const PAYSTACK_API="https://api.paystack.co";

export type PaystackVerification={
  status:boolean;
  data?:{
    status:string;
    reference:string;
    amount:number;
    currency:string;
  };
};

export async function verifyPaystackTransaction(reference:string):Promise<PaystackVerification>{
  const secret=process.env.PAYSTACK_SECRET_KEY;
  if(!secret)throw new Error("PAYSTACK_SECRET_KEY is not configured");
  const response=await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,{
    headers:{Authorization:`Bearer ${secret}`},
    cache:"no-store"
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok||!data)return {status:false};
  return data as PaystackVerification;
}