"use client";

import {useState} from "react";

export type CartItem={productId:string;slug:string;name:string;price:number;currency:string;imageUrl:string|null;quantity:number};

const KEY="product-store-cart";

export default function AddToCartButton({item}:{item:Omit<CartItem,"quantity">}){
  const [added,setAdded]=useState(false);

  function add(){
    try{
      const raw=window.localStorage.getItem(KEY);
      const current:CartItem[]=raw?JSON.parse(raw):[];
      const index=current.findIndex(entry=>entry.productId===item.productId);
      if(index>=0)current[index]={...current[index],quantity:Math.min(current[index].quantity+1,99)};
      else current.push({...item,quantity:1});
      window.localStorage.setItem(KEY,JSON.stringify(current));
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setAdded(true);
      window.setTimeout(()=>setAdded(false),1600);
    }catch{
      setAdded(false);
    }
  }

  return <button className="button primary" type="button" onClick={add}>{added?"Added to cart":"Add to cart"}</button>;
}