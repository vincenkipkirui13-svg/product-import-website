"use client";

import Link from "next/link";
import {FormEvent,useEffect,useMemo,useState} from "react";
import type {CartItem} from "@/components/add-to-cart-button";

const KEY="product-store-cart";

export default function CheckoutPage(){
  const [items,setItems]=useState<CartItem[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [phone,setPhone]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    try{setItems(JSON.parse(window.localStorage.getItem(KEY)||"[]"));}catch{setItems([]);}
    setLoaded(true);
  },[]);

  const total=useMemo(()=>items.reduce((sum,item)=>sum+item.price*item.quantity,0),[items]);

  async function submit(event:FormEvent){
    event.preventDefault();
    setBusy(true);
    setError("");
    const response=await fetch("/api/checkout/initialize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      customerName:name,customerEmail:email,customerPhone:phone,
      items:items.map(item=>({productId:item.productId,quantity:item.quantity}))
    })});
    const data=await response.json().catch(()=>({}));
    if(response.ok&&data.authorizationUrl){
      window.location.href=data.authorizationUrl;
      return;
    }
    setError(data.error||"Unable to start payment.");
    setBusy(false);
  }

  if(!loaded)return <main><section className="section page-top"><div className="container"><div className="empty-state compact"><h2>Loading checkout…</h2></div></div></section></main>;

  return <main>
    <header className="site-header"><div className="container nav"><Link className="brand" href="/">Product<span>Store</span></Link><Link href="/cart">Back to cart</Link></div></header>
    <section className="section page-top">
      <div className="container">
        <p className="eyebrow">SECURE CHECKOUT</p>
        <h1>Complete your order</h1>
        {items.length===0?<div className="empty-state compact"><h2>Your cart is empty</h2><p>Add a catalogue product before checkout.</p><Link className="button primary" href="/products">Browse products</Link></div>:<div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <label>Full name<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required maxLength={120}/></label>
            <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required maxLength={200}/></label>
            <label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" required maxLength={30}/></label>
            {error&&<p className="form-error" role="alert">{error}</p>}
            <button className="button primary full" type="submit" disabled={busy}>{busy?"Connecting to Paystack…":"Continue to secure payment"}</button>
            <p className="muted small">Your final amount is recalculated from the live catalogue on the server before Paystack is initialized.</p>
          </form>
          <aside className="cart-summary"><h2>Order summary</h2>{items.map(item=><div className="summary-row" key={item.productId}><span>{item.name} × {item.quantity}</span><strong>{item.price.toLocaleString("en-KE",{minimumFractionDigits:2})}</strong></div>)}<div className="summary-row total"><span>Estimated total</span><strong>KSh {total.toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div></aside>
        </div>}
      </div>
    </section>
  </main>;
}