import Link from "next/link";
import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

type ProductRailProduct=Prisma.ProductGetPayload<{include:{images:{orderBy:{sortOrder:"asc"};take:1}}}>;

function money(value:unknown,currency:string){
  const amount=Number(value);
  if(!Number.isFinite(amount))return "Price unavailable";
  return new Intl.NumberFormat("en-KE",{style:"currency",currency,maximumFractionDigits:2}).format(amount);
}

function ProductRail({title,kicker,products,href="/products"}:{title:string;kicker:string;products:ProductRailProduct[];href?:string}){
  if(!products.length)return null;
  return <section className="market-section">
    <div className="container market-heading"><div><p className="eyebrow">{kicker}</p><h2>{title}</h2></div><Link href={href}>See all <span>→</span></Link></div>
    <div className="container rail-shell"><div className="product-rail">{products.map(product=>{const image=product.images[0];return <Link className="market-card" href={`/products/${product.slug}`} key={product.id}>
      <div className="market-card-media">{image?<img src={image.url} alt={image.alt||product.name} loading="lazy"/>:<div className="product-media-fallback">Image pending</div>}</div>
      <div className="market-card-body"><span className="product-category">{product.category}</span><h3>{product.name}</h3><strong>{money(product.sellingPrice,product.currency)}</strong><span className={`availability availability-${product.availability.toLowerCase()}`}>{product.availability.toLowerCase()}</span></div>
    </Link>})}</div></div>
  </section>;
}

export default async function HomePage(){
  let products:ProductRailProduct[]=[];
  let categories:string[]=[];
  try{
    products=await prisma.product.findMany({orderBy:{updatedAt:"desc"},take:24,include:{images:{orderBy:{sortOrder:"asc"},take:1}}});
    const rows=await prisma.product.findMany({select:{category:true},distinct:["category"],orderBy:{category:"asc"}});
    categories=rows.map(row=>row.category);
  }catch{}

  const categoryProducts=new Map<string,typeof products>();
  for(const product of products){
    const list=categoryProducts.get(product.category)||[];
    if(list.length<8)list.push(product);
    categoryProducts.set(product.category,list);
  }

  return <main className="market-home">
    <section className="promo-marquee" aria-label="Store highlights"><div className="promo-track"><span>✓ VERIFIED CATALOGUE</span><span>SECURE PAYSTACK CHECKOUT</span><span>MOBILE-FIRST SHOPPING</span><span>TRANSPARENT AVAILABILITY</span><span>✓ VERIFIED CATALOGUE</span><span>SECURE PAYSTACK CHECKOUT</span><span>MOBILE-FIRST SHOPPING</span><span>TRANSPARENT AVAILABILITY</span></div></section>

    <section className="market-hero">
      <div className="hero-carousel" aria-label="Store highlights">
        <div className="hero-slide hero-slide-one"><div className="container hero-slide-inner"><div className="hero-copy-block"><span className="hero-badge">IMPORTHUB · KENYA</span><h1>Shop globally.<br/><em>Buy confidently.</em></h1><p>Quality imported products, clearly presented and securely checked before you pay.</p><div className="actions"><Link className="button primary button-large" href="/products">Start shopping <span>→</span></Link><Link className="button ghost button-large" href="/categories">Explore categories</Link></div></div><div className="hero-visual"><div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/><div className="hero-badge-card"><img src="/brand-mark.svg" alt="" width="76" height="76"/><strong>GLOBAL<br/><span>LOCAL TRUST</span></strong><small>Verified catalogue experience</small></div><div className="floating-chip chip-one">✓ Server-checked prices</div><div className="floating-chip chip-two">KES · Secure checkout</div></div></div></div>
        <div className="hero-slide hero-slide-two"><div className="container hero-slide-inner"><div className="hero-copy-block"><span className="hero-badge">A BETTER WAY TO DISCOVER</span><h2>More to browse.<br/><em>Less to figure out.</em></h2><p>Search, compare, discover related products and keep your cart close on every device.</p><div className="actions"><Link className="button primary button-large" href="/products">Browse catalogue <span>→</span></Link></div></div><div className="hero-panel-stack"><div><b>01</b><span>Search</span><small>Find products quickly</small></div><div><b>02</b><span>Compare</span><small>Clear prices and availability</small></div><div><b>03</b><span>Checkout</span><small>Pay securely with Paystack</small></div></div></div></div>
        <div className="hero-slide hero-slide-three"><div className="container hero-slide-inner"><div className="hero-copy-block"><span className="hero-badge">BUILT FOR PHONES</span><h2>Your shopping journey,<br/><em>without the clutter.</em></h2><p>Touch-friendly controls, swipeable product rails and a checkout designed for everyday Kenyan mobile users.</p><div className="actions"><Link className="button primary button-large" href="/cart">Open your cart <span>→</span></Link></div></div><div className="hero-mobile-card"><div className="mobile-card-top"><span>YOUR CART</span><b>● READY</b></div><div className="mobile-lines"><i/><i/><i/><i/></div><strong>Simple shopping.<br/>Serious checkout.</strong><small>Your final total is rechecked before payment.</small></div></div></div>
      </div>
      <div className="hero-dots" aria-hidden="true"><i/><i/><i/></div>
    </section>

    <section className="trust-strip"><div className="container trust-grid"><div><b>01</b><span><strong>Verified catalogue</strong>Source-driven products only</span></div><div><b>02</b><span><strong>Clear pricing</strong>Live totals are revalidated</span></div><div><b>03</b><span><strong>Secure checkout</strong>Paystack payment verification</span></div><div><b>04</b><span><strong>Made for mobile</strong>Fast, touch-friendly shopping</span></div></div></section>

    <section className="market-section category-section"><div className="container market-heading"><div><p className="eyebrow">SHOP BY CATEGORY</p><h2>Find your next favourite.</h2></div><Link href="/categories">All categories <span>→</span></Link></div>{categories.length?<div className="container category-rail">{categories.slice(0,12).map((category,index)=><Link className="category-tile" href={`/products?category=${encodeURIComponent(category)}`} key={category}><span>{String(index+1).padStart(2,"0")}</span><strong>{category}</strong><small>Shop category →</small></Link>)}</div>:<div className="container catalogue-ready"><div className="ready-mark">+</div><div><strong>Your category shelves are ready.</strong><p>Once authorized products are imported, real categories will automatically appear here. We will never create fake products to fill the shelves.</p></div><Link className="button secondary" href="/admin/login">Open admin</Link></div>}</section>

    {products.length>0?<><ProductRail title="Latest arrivals" kicker="NEW IN" products={products.slice(0,8)}/><ProductRail title="Explore the catalogue" kicker="DISCOVER MORE" products={products.slice(8,16)}/>{Array.from(categoryProducts.entries()).slice(0,4).map(([category,list])=><ProductRail key={category} title={category} kicker="SHOP THE CATEGORY" products={list} href={`/products?category=${encodeURIComponent(category)}`}/>)}</>:<section className="market-section"><div className="container empty-market"><div className="empty-market-art"><div className="empty-orbit"/><img src="/brand-mark.svg" alt="" width="90" height="90"/></div><div><p className="eyebrow">CATALOGUE READY</p><h2>The marketplace is built.<br/>Now it is waiting for your real products.</h2><p>All product rails, catalogue discovery, product pages, cart behavior and secure checkout are ready for authorized imports. No demo products have been inserted.</p><Link className="button primary" href="/admin/login">Go to product import</Link></div></div></section>}

    <section className="market-section service-section"><div className="container service-grid"><div><p className="eyebrow">WHY SHOP HERE</p><h2>A marketplace experience built around trust.</h2></div><div className="service-card"><span>01</span><strong>Real catalogue data</strong><p>Products come from authorized imports or approved manual entries.</p></div><div className="service-card"><span>02</span><strong>Server-side protection</strong><p>Prices, availability, currency and order totals are checked again at checkout.</p></div><div className="service-card"><span>03</span><strong>Easy discovery</strong><p>Search, categories, rails, product pages and cart keep the journey moving.</p></div></div></section>
  </main>;
}