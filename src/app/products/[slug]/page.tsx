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

export default async function ProductDetails({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=await prisma.product.findUnique({
    where:{slug},
    include:{images:{orderBy:{sortOrder:"asc"}},variants:true}
  });
  if(!product)notFound();
  const primary=product.images[0];

  return <main>
    <header className="site-header"><div className="container nav"><Link className="brand" href="/">Product<span>Store</span></Link><Link className="nav-button" href="/cart">Cart</Link></div></header>
    <section className="section page-top">
      <div className="container product-detail">
        <div className="detail-media">
          {primary?<img src={primary.url} alt={primary.alt||product.name}/>:<div className="product-media-fallback">No image available</div>}
        </div>
        <div className="detail-copy">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-price detail-price">{formatPrice(product.sellingPrice,product.currency)}</p>
          <span className={`availability availability-${product.availability.toLowerCase()}`}>{product.availability.toLowerCase()}</span>
          {product.description&&<div className="product-description">{product.description}</div>}
          {product.variants.length>0&&<div className="variant-list"><h2>Options</h2>{product.variants.map(v=><div key={v.id}><strong>{v.name}</strong><span>{v.value}</span></div>)}</div>}
          <div className="actions">{product.availability==="AVAILABLE"?<AddToCartButton item={{productId:product.id,slug:product.slug,name:product.name,price:Number(product.sellingPrice),currency:product.currency,imageUrl:primary?.url??null}}/>:<button className="button secondary" disabled>Currently unavailable</button>}<Link className="button secondary" href="/products">Back to products</Link></div>
        </div>
      </div>
    </section>
  </main>;
}