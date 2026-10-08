import Link from "next/link";
import {prisma} from "@/lib/prisma";

function formatPrice(value:unknown,currency:string){
  const amount=Number(value);
  if(!Number.isFinite(amount))return "Price unavailable";
  return new Intl.NumberFormat("en-KE",{style:"currency",currency,maximumFractionDigits:2}).format(amount);
}

export const dynamic="force-dynamic";

export default async function HomePage(){
  let products:Awaited<ReturnType<typeof prisma.product.findMany>>=[];
  let categories:string[]=[];
  try{
    products=await prisma.product.findMany({
      orderBy:{updatedAt:"desc"},
      take:6,
      include:{images:{orderBy:{sortOrder:"asc"},take:1}}
    });
    const rows=await prisma.product.findMany({select:{category:true},distinct:["category"],orderBy:{category:"asc"}});
    categories=rows.map(row=>row.category);
  }catch{}

  return <main>
    <section className="hero">
      <div className="hero-orbit hero-orbit-one"/>
      <div className="hero-orbit hero-orbit-two"/>
      <div className="container hero-grid">
        <div className="hero-copy-block">
          <div className="hero-kicker"><span/> VERIFIED CATALOGUE <span/> SECURE CHECKOUT</div>
          <h1>Global products.<br/><em>Local trust.</em></h1>
          <p>Discover quality imported products through a fast, transparent shopping experience built for mobile customers in Kenya.</p>
          <div className="actions"><Link className="button primary button-large" href="/products">Shop products <span>→</span></Link><Link className="button ghost button-large" href="/categories">Browse categories</Link></div>
          <div className="hero-trust"><span>✓ Verified catalogue data</span><span>✓ Server-checked prices</span><span>✓ Paystack checkout</span></div>
        </div>
        <div className="hero-art" aria-label="ImportHub shopping highlights">
          <div className="route-card route-card-top"><span className="route-icon">↗</span><div><b>Global sourcing</b><small>Quality products from approved sources</small></div></div>
          <div className="hero-product-card"><div className="hero-product-ring"><img src="/brand-mark.svg" alt="" width="92" height="92"/></div><span className="mini-label">IMPORT<span>HUB</span></span><strong>Shop with confidence</strong><p>Clean catalogue · clear availability · secure payment</p></div>
          <div className="route-card route-card-bottom"><span className="route-icon">✓</span><div><b>Protected checkout</b><small>Your final price is revalidated on the server</small></div></div>
        </div>
      </div>
    </section>

    <section className="trust-strip"><div className="container trust-grid"><div><b>01</b><span><strong>Authentic catalogue</strong>Source-driven product data</span></div><div><b>02</b><span><strong>Transparent pricing</strong>No hidden client-side totals</span></div><div><b>03</b><span><strong>Secure payments</strong>Paystack verification built in</span></div><div><b>04</b><span><strong>Mobile first</strong>Designed for everyday phones</span></div></div></section>

    <section className="section">
      <div className="container section-heading"><div><p className="eyebrow">SHOP THE CATALOGUE</p><h2>Find what you need, without the clutter.</h2><p className="muted">Every product shown here comes from the verified catalogue. Nothing is invented to fill the page.</p></div><Link href="/products">View all products →</Link></div>
      {categories.length>0&&<div className="container category-pills">{categories.slice(0,8).map(category=><Link key={category} href={`/products?category=${encodeURIComponent(category)}`} className="category-pill">{category}<span>→</span></Link>)}</div>}
      {products.length>0?<div className="container product-grid home-products">{products.map(product=>{const image=product.images[0];return <Link className="product-card" href={`/products/${product.slug}`} key={product.id}><div className="product-media">{image?<img src={image.url} alt={image.alt||product.name} loading="lazy"/>:<div className="product-media-fallback">Image pending</div>}</div><div className="product-card-body"><span className="product-category">{product.category}</span><h2>{product.name}</h2><p className="product-price">{formatPrice(product.sellingPrice,product.currency)}</p><span className={`availability availability-${product.availability.toLowerCase()}`}>{product.availability.toLowerCase()}</span></div></Link>})}</div>:<div className="container empty-state"><div className="empty-icon">+</div><h3>Your catalogue is ready for authorized products</h3><p>No products are currently imported. Connect an authorized source or add approved manual products through the admin workflow—never fabricated demo products.</p><Link className="button primary" href="/admin/login">Open admin</Link></div>}
    </section>

    <section className="section soft-section"><div className="container split-section"><div><p className="eyebrow">BUILT FOR CONFIDENCE</p><h2>A storefront that puts clarity before hype.</h2><p className="muted">Availability stays visible, checkout recalculates the live catalogue, and payment status is verified server-side. The experience is designed to remain honest even when a product or service is temporarily unavailable.</p></div><div className="feature-stack"><div><span>01</span><div><b>Source integrity</b><p>No invented products, prices or images.</p></div></div><div><span>02</span><div><b>Checkout validation</b><p>Product, availability, price and currency are checked again before payment.</p></div></div><div><span>03</span><div><b>Accessible by default</b><p>Readable type, touch-friendly controls and responsive layouts.</p></div></div></div></div></section>
  </main>;
}