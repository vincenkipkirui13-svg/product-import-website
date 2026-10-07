"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import type {CartItem} from "@/components/add-to-cart-button";

const KEY="product-store-cart";

export default function CartPage(){
  const [items,setItems]=useState<CartItem[]>([]);
  const [loaded,setLoaded]=useState(false);

  function read(){
    try{
      const raw=window.localStorage.getItem(KEY);
      setItems(raw?JSON.parse(raw):[]);
    }catch{
      setItems([]);
    }finally{setLoaded(true);}
  }

  useEffect(()=>{
    read();
    const handler=()=>read();
    window.addEventListener("cart-updated",handler);
    return()=>window.removeEventListener("cart-updated",handler);
  },[]);

  function update(productId:string,quantity:number){
    const next=items.map(item=>item.productId===productId?{...item,quantity}:item).filter(item=>item.quantity>0);
    setItems(next);
    window.localStorage.setItem(KEY,JSON.stringify(next));
  }

  const total=useMemo(()=>items.reduce((sum,item)=>sum+(item.price*item.quantity),0),[items]);

  return <main>
    <header className="site-header"><div className="container nav"><Link className="brand" href="/">Product<span>Store</span></Link><Link href="/products">Continue shopping</Link></div></header>
    <section className="section page-top">
      <div className="container">
        <p className="eyebrow">YOUR ORDER</p>
        <h1>Cart</h1>
        {!loaded?<div className="empty-state compact"><h2>Loading cart…</h2></div>:items.length===0?<div className="empty-state compact"><h2>Your cart is empty</h2><p>Add a legitimate catalogue product to begin checkout.</p><Link className="button primary" href="/products">Browse products</Link></div>:<div className="cart-layout">
          <div className="cart-items">
            {items.map(item=><article className="cart-item" key={item.productId}>
              <div className="cart-thumb">{item.imageUrl?<img src={item.imageUrl} alt="" loading="lazy"/>:<span>No image</span>}</div>
              <div className="cart-item-main"><Link href={`/products/${item.slug}`}><h2>{item.name}</h2></Link><p>{new Intl.NumberFormat("en-KE",{style:"currency",currency:item.currency}).format(item.price)}</p><div className="quantity-row"><button type="button" onClick={()=>update(item.productId,Math.max(0,item.quantity-1))} aria-label={`Decrease quantity of ${item.name}`}>−</button><span>{item.quantity}</span><button type="button" onClick={()=>update(item.productId,Math.min(99,item.quantity+1))} aria-label={`Increase quantity of ${item.name}`}>+</button><button className="remove-button" type="button" onClick={()=>update(item.productId,0)}>Remove</button></div></div>
            </article>)}
          </div>
          <aside className="cart-summary"><h2>Order summary</h2><div className="summary-row"><span>Items</span><strong>{items.reduce((sum,item)=>sum+item.quantity,0)}</strong></div><div className="summary-row total"><span>Estimated total</span><strong>KSh {total.toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div><p className="muted small">This is a cart estimate. The server will revalidate products, availability and prices before payment.</p><button className="button primary full" type="button" disabled>Checkout coming next</button></aside>
        </div>}
      </div>
    </section>
  </main>;
}