import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic="force-dynamic";

function formatPrice(value:unknown,currency:string){
  const amount=Number(value);
  if(!Number.isFinite(amount))return "Price unavailable";
  return new Intl.NumberFormat("en-KE",{style:"currency",currency}).format(amount);
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const product=await prisma.product.findUnique({where:{slug},select:{name:true,description:true,images:{orderBy:{sortOrder:"asc"},take:1}}});
  if(!product)return {title:"Product not found"};
  return {title:product.name,description:product.description?.slice(0,155)||`Shop ${product.name} at ImportHub.`,openGraph:{title:product.name,description:product.description?.slice(0,155)||"Verified product catalogue.",images:product.images[0]?.url?[{url:product.images[0].url}]:[]}};
}

export default async function ProductDetails({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=await prisma.product.findUnique({where:{slug},include:{images:{orderBy:{sortOrder:"asc"}},variants:true}});
  if(!product)notFound();
  const related=await prisma.product.findMany({
    where:{category:product.category,id:{not:product.id}},
    orderBy:{updatedAt:"desc"},
    take:8,
    include:{images:{orderBy:{sortOrder:"asc"},take:1}}
  });
  const primary=product.images[0];
  const jsonLd={"@context":"https://schema.org","@type":"Product","name":product.name,"description":product.description||undefined,"image":product.images.map(image=>image.url),"offers":{"@type":"Offer","price":Number(product.sellingPrice),"priceCurrency":product.currency,"availability":product.availability==="AVAILABLE"?"https://schema.org/InStock":"https://schema.org/OutOfStock"}};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="section page-top">
      <div className="container breadcrumb"><Link href="/products">Products</Link><span>/</span><Link href={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div>
      <div className="container product-detail">
        <div className="detail-gallery">
          <div className="detail-media">{primary?<img src={primary.url} alt={primary.alt||product.name}/>:<div className="product-media-fallback">Image pending</div>}</div>
          {product.images.length>1&&<div className="detail-thumbs">{product.images.map((image,index)=><a href={image.url} target="_blank" rel="noreferrer" key={image.id} aria-label={`Open product image ${index+1}`}><img src={image.url} alt="" loading="lazy"/></a>)}</div>}
          <p className="image-count">{product.images.length?product.images.length+" verified product image"+(product.images.length===1?"":"s"):"No product image supplied"}</p>
        </div>
        <div className="detail-copy">
          <div className="detail-topline"><span className="product-category">{product.category}</span><span className="detail-trust">✓ Verified catalogue item</span></div>
          <h1>{product.name}</h1>
          <div className="detail-price-row"><p className="product-price detail-price">{formatPrice(product.sellingPrice,product.currency)}</p><span className={`availability availability-${product.availability.toLowerCase()}`}>{product.availability.toLowerCase()}</span></div>
          {product.description&&<div className="product-description">{product.description}</div>}
          <div className="detail-benefits"><div><b>✓ Secure checkout</b><small>Paystack payment verification</small></div><div><b>✓ Live validation</b><small>Price and availability rechecked</small></div><div><b>✓ Mobile ready</b><small>Simple ordering on your phone</small></div></div>
          {product.variants.length>0&&<div className="variant-list"><h2>Product options</h2>{product.variants.map(v=><div key={v.id}><strong>{v.name}</strong><span>{v.value}</span></div>)}</div>}
          <div className="actions">{product.availability==="AVAILABLE"?<AddToCartButton item={{productId:product.id,slug:product.slug,name:product.name,price:Number(product.sellingPrice),currency:product.currency,imageUrl:primary?.url??null}}/>:<button className="button secondary" disabled>Currently unavailable</button>}<Link className="button secondary" href="/products">Continue shopping</Link></div>
          <p className="detail-note">The amount shown is the current store selling price. The server revalidates product, price, currency and availability before payment.</p>
        </div>
      </div>
    </section>
    {related.length>0&&<section className="market-section"><div className="container market-heading"><div><p className="eyebrow">KEEP DISCOVERING</p><h2>More from {product.category}</h2></div><Link href={`/products?category=${encodeURIComponent(product.category)}`}>See all <span>→</span></Link></div><div className="container rail-shell"><div className="product-rail">{related.map(item=>{const image=item.images[0];return <Link className="market-card" href={`/products/${item.slug}`} key={item.id}><div className="market-card-media">{image?<img src={image.url} alt={image.alt||item.name} loading="lazy"/>:<div className="product-media-fallback">Image pending</div>}</div><div className="market-card-body"><span className="product-category">{item.category}</span><h3>{item.name}</h3><strong>{formatPrice(item.sellingPrice,item.currency)}</strong><span className={`availability availability-${item.availability.toLowerCase()}`}>{item.availability.toLowerCase()}</span></div></Link>})}</div></div></section>}
  </main>;
}