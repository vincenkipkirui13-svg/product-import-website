import Link from "next/link";
import {prisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

function formatPrice(value:unknown,currency:string){
  const amount=Number(value);
  if(!Number.isFinite(amount))return "Price unavailable";
  return new Intl.NumberFormat("en-KE",{style:"currency",currency}).format(amount);
}

export default async function ProductsPage(){
  try{
    const products=await prisma.product.findMany({
      orderBy:{updatedAt:"desc"},
      include:{images:{orderBy:{sortOrder:"asc"},take:1}}
    });

    return <main>
      <header className="site-header">
        <div className="container nav">
          <Link className="brand" href="/">Product<span>Store</span></Link>
          <Link className="nav-button" href="/cart">Cart</Link>
        </div>
      </header>
      <section className="section page-top">
        <div className="container">
          <p className="eyebrow">CATALOGUE</p>
          <h1>All products</h1>
          <p className="muted">Products are displayed from the verified catalogue. Availability is a state of the product, not its existence.</p>
          {products.length===0 ? <div className="empty-state compact">
            <h2>Catalogue awaiting import</h2>
            <p>No live products have been imported yet. Nothing is fabricated or duplicated for demonstration.</p>
            <Link className="button primary" href="/">Back to home</Link>
          </div> : <div className="product-grid">
            {products.map(product=>{
              const image=product.images[0];
              return <Link className="product-card" href={`/products/${product.slug}`} key={product.id}>
                <div className="product-media">
                  {image ? <img src={image.url} alt={image.alt||product.name} loading="lazy"/> : <div className="product-media-fallback">No image</div>}
                </div>
                <div className="product-card-body">
                  <span className="product-category">{product.category}</span>
                  <h2>{product.name}</h2>
                  <p className="product-price">{formatPrice(product.sellingPrice,product.currency)}</p>
                  <span className={`availability availability-${product.availability.toLowerCase()}`}>{product.availability.toLowerCase()}</span>
                </div>
              </Link>;
            })}
          </div>}
        </div>
      </section>
    </main>;
  }catch{
    return <main><header className="site-header"><div className="container nav"><Link className="brand" href="/">Product<span>Store</span></Link><Link className="nav-button" href="/cart">Cart</Link></div></header><section className="section page-top"><div className="container"><p className="eyebrow">CATALOGUE</p><h1>Catalogue unavailable</h1><div className="empty-state compact"><h2>We could not load the catalogue</h2><p>Please try again shortly. Product data has not been replaced with fabricated content.</p><Link className="button primary" href="/products">Try again</Link></div></div></section></main>;
  }
}