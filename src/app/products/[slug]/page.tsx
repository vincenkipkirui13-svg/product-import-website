import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import AddToCartButton from "@/components/add-to-cart-button";

export const dynamic="force-dynamic";

function formatPrice(value:unknown,currency:string){const amount=Number(value);if(!Number.isFinite(amount))return "Price unavailable";return new Intl.NumberFormat("en-KE",{style:"currency",currency}).format(amount)}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params; const product=await prisma.product.findUnique({where:{slug},select:{name:true,description:true,images:{orderBy:{sortOrder:"asc"},take:1}}});
  if(!product)return {title:"Product not found"};
  return {title:product.name,description:product.description?.slice(0,155)||`Shop ${product.name} at ImportHub.`,openGraph:{title:product.name,description:product.description?.slice(0,155)||"Verified product catalogue." ,images:product.images[0]?.url?[{url:product.images[0].url}]:[]}};
}

export default async function ProductDetails({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=await prisma.product.findUnique({where:{slug},include:{images:{orderBy:{sortOrder:"asc"}},variants:true}});
  if(!product)notFound();
  const primary=product.images[0];
  const jsonLd={"@context":"https://schema.org","@type":"Product","name":product.name,"description":product.description||undefined,"image":product.images.map(image=>image.url),"offers":{"@type":"Offer","price":Number(product.sellingPrice),"priceCurrency":product.currency,"availability":product.availability==="AVAILABLE"?"https://schema.org/InStock":"https://schema.org/OutOfStock"}};
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><section className="section page-top"><div className="container breadcrumb"><Link href="/products">Products</Link><span>/</span><span>{product.category}</span></div><div className="container product-detail">
    <div><div className="detail-media">{primary?<img src={primary.url} alt={primary.alt||product.name}/>:<div className="product-media-fallback">Image pending</div>}</div>{product.images.length>1&&<div className="image-count">{product.images.length} verified product images</div>}</div>
    <div className="detail-copy"><span className="product-category">{product.category}</span><h1>{product.name}</h1><div className="detail-price-row"><p className="product-price detail-price">{formatPrice(product.sellingPrice,product.currency)}</p><span className={`availability availability-${product.availability.toLowerCase()}`}>{product.availability.toLowerCase()}</span></div>{product.description&&<div className="product-description">{product.description}</div>}{product.variants.length>0&&<div className="variant-list"><h2>Product options</h2>{product.variants.map(v=><div key={v.id}><strong>{v.name}</strong><span>{v.value}</span></div>)}</div>}<div className="actions">{product.availability==="AVAILABLE"?<AddToCartButton item={{productId:product.id,slug:product.slug,name:product.name,price:Number(product.sellingPrice),currency:product.currency,imageUrl:primary?.url??null}}/>:<button className="button secondary" disabled>Currently unavailable</button>}<Link className="button secondary" href="/products">Continue shopping</Link></div><p className="detail-note">Prices and availability are revalidated by the server before payment.</p></div>
  </div></section></main>;
}