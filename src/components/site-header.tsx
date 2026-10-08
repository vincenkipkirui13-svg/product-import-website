"use client";

import Link from "next/link";
import {useEffect,useState} from "react";

const KEY="product-store-cart";

export default function SiteHeader(){
  const [count,setCount]=useState(0);
  useEffect(()=>{
    const read=()=>{try{const raw=window.localStorage.getItem(KEY);const items=raw?JSON.parse(raw):[];setCount(Array.isArray(items)?items.reduce((n,item)=>n+(Number(item.quantity)||0),0):0)}catch{setCount(0)}};
    read();window.addEventListener("cart-updated",read);window.addEventListener("storage",read);
    return()=>{window.removeEventListener("cart-updated",read);window.removeEventListener("storage",read)};
  },[]);
  return <header className="site-header">
    <div className="utility-bar"><div className="container utility-inner"><span>✓ Verified catalogue</span><span>•</span><span>Secure Paystack checkout</span><span className="utility-hide-mobile">•</span><span className="utility-hide-mobile">Mobile-first shopping</span><span className="utility-spacer"/><span className="utility-hide-mobile">Kenya · KES</span></div></div>
    <div className="container nav">
      <Link className="brand" href="/" aria-label="ImportHub home"><img src="/brand-mark.svg" alt="" width="44" height="44"/><span><strong>Import<span>Hub</span></strong><small>Global products · Local trust</small></span></Link>
      <form className="site-search" action="/products" role="search"><input name="q" placeholder="Search products, categories..." aria-label="Search products and categories"/><button type="submit" aria-label="Search">⌕</button></form>
      <nav aria-label="Primary"><Link href="/">Home</Link><Link href="/products">Shop</Link><Link href="/categories">Categories</Link><Link href="/admin/login">Account</Link><Link className="cart-link" href="/cart">Cart <b>{count}</b></Link></nav>
    </div>
    <div className="quick-nav"><div className="container quick-nav-inner"><Link href="/products">All products</Link><Link href="/categories">Shop by category</Link><Link href="/products?availability=available">Available now</Link><Link href="/cart">Your cart <b>{count}</b></Link><Link href="/admin/login">Manage store</Link></div></div>
    <div className="mobile-nav container"><Link href="/products">Shop</Link><Link href="/categories">Categories</Link><Link href="/cart">Cart {count>0&&<b>{count}</b>}</Link><Link href="/admin/login">Account</Link></div>
  </header>;
}