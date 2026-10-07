"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

const KEY="product-store-cart";

export default function CheckoutCallback(){
  const [status,setStatus]=useState<"loading"|"success"|"failed">("loading");
  const [message,setMessage]=useState("Confirming your payment securely…");

  useEffect(()=>{
    const reference=new URLSearchParams(window.location.search).get("reference");
    if(!reference){setStatus("failed");setMessage("No payment reference was provided.");return;}
    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`,{cache:"no-store"})
      .then(async response=>({ok:response.ok,data:await response.json().catch(()=>({}))}))
      .then(({ok,data})=>{
        if(ok&&data.status==="success"){
          window.localStorage.removeItem(KEY);
          setStatus("success");
          setMessage("Your payment was verified and your order is confirmed.");
        }else{
          setStatus("failed");
          setMessage(data.error||"The payment could not be confirmed. Please contact support before trying again.");
        }
      })
      .catch(()=>{setStatus("failed");setMessage("We could not reach the payment verification service. Please try again shortly.");});
  },[]);

  return <main><section className="section page-top"><div className="container"><div className="empty-state compact"><p className="eyebrow">{status==="loading"?"PAYMENT":"PAYMENT RESULT"}</p><div className="empty-icon">{status==="success"?"✓":status==="failed"?"!":"…"}</div><h1 className="callback-title">{status==="success"?"Payment confirmed":status==="failed"?"Payment not confirmed":"Verifying payment"}</h1><p>{message}</p><div className="actions"><Link className="button primary" href={status==="success"?"/":"/cart"}>{status==="success"?"Back to store":"Return to cart"}</Link></div></div></div></section></main>;
}