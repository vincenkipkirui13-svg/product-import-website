import Link from "next/link";
import {prisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

function formatPrice(value:unknown,currency:string){
  const amount=Number(value);
  if(!Number.isFinite(amount))return "Price unavailable";
  return new Intl.NumberFormat("en-KE",{style:"currency",currency}).format(amount);
}

export default async function ProductsPage({searchParams}:{searchParams:Promise<{q?:string;category?:string;availability?:string;sort?:string}>}){
  const params=await searchParams;
  const q=(params.q||"").trim();
  const category=(params.category||"").trim();
  const availability=(params.availability||"").toUpperCase();
  const sort=params.sort||"newest";
  const orderBy=sort==="price-asc"?{sellingPrice:"asc" as const}:sort==="price-desc"?{sellingPrice:"desc" as const}:sort==="name"?{name:"asc" as const}:{updatedAt:"desc" as const};
  try{
    const categories=await prisma.product.findMany({select:{category:true},distinct:["category"],orderBy:{category:"asc"}});
    const where={
      ...(category?{category}:{}),
      ...(availability&&["AVAILABLE","UNAVAILABLE","UNKNOWN"].includes(availability)?{availability:availability as "AVAILABLE"|"UNAVAILABLE"|"UNKNOWN"}:{}),
      ...(q?{OR:[{name:{contains:q,mode:"insensitive" as const}},{category:{contains:q,mode:"insensitive" as const}},{description:{contains:q,mode:"insensitive" as const}}]}:{})
    };
    const products=await prisma.product.findMany({where,orderBy,include:{images:{orderBy:{sortOrder:"asc"},take:1}}});
    const queryBase=new URLSearchParams();
    if(q)queryBase.set("q",q);if(category)queryBase.set("category",category);if(availability)queryBase.set("availability",availability.toLowerCase());
    const hrefForSort=(value:string)=>{const next=new URLSearchParams(queryBase);next.set("sort",value);return `/products?${next.toString()}`};
    return <main><section className="section page-top"><div className="container">
      <div className="catalogue-heading"><div><p className="eyebrow">CATALOGUE</p><h1>All products</h1><p className="muted">{q?<>Showing results for <strong>“{q}”</strong>.</>:"Browse the verified product catalogue."} Availability describes whether a product can currently be purchased.</p></div><Link className="button secondary" href="/cart">View cart</Link></div>
      <form className="catalogue-tools" action="/products"><label className="catalogue-search"><span>Search</span><input name="q" defaultValue={q} placeholder="Product, category or keyword…"/><button className="button primary" type="submit">Search</button></label><label><span>Category</span><select name="category" defaultValue={category}><option value="">All categories</option>{categories.map(c=><option key={c.category} value={c.category}>{c.category}</option>)}</select></label><label><span>Availability</span><select name="availability" defaultValue={availability.toLowerCase()}><option value="">Any status</option><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="unknown">Unknown</option></select></label></form>
      {products.length===0?<div className="empty-state compact"><h2>No matching products</h2><p>Try a different search or category. The catalogue does not create substitute products when no verified match exists.</p><Link className="button primary" href="/products">Clear filters</Link></div>:<><div className="catalogue-toolbar-row"><div className="catalogue-meta"><span>{products.length} verified {products.length===1?"product":"products"}</span>{(q||category||availability)&&<Link href="/products">Clear filters</Link>}</div><div className="sort-links" aria-label="Sort products"><span>Sort:</span><Link className={sort==="newest"?"active":""} href={hrefForSort("newest")}>Newest</Link><Link className={sort==="price-asc"?"active":""} href={hrefForSort("price-asc")}>Price low</Link><Link className={sort==="price-desc"?"active":""} href={hrefForSort("price-desc")}>Price high</Link><Link className={sort==="name"?"active":""} href={hrefForSort("name")}>Name</Link></div></div><div className="product-grid">{products.map(product=>{const image=product.images[0];return <Link className="product-card" href={`/products/${product.slug}`} key={product.id}><div className="product-media">{image?<img src={image.url} alt={image.alt||product.name} loading="lazy"/>:<div className="product-media-fallback">Image pending</div>}</div><div className="product-card-body"><span className="product-category">{product.category}</span><h2>{product.name}</h2><p className="product-price">{formatPrice(product.sellingPrice,product.currency)}</p><span className={`availability availability-${product.availability.toLowerCase()}`}>{product.availability.toLowerCase()}</span></div></Link>})}</div></>}
    </div></section></main>;
  }catch{return <main><section className="section page-top"><div className="container"><p className="eyebrow">CATALOGUE</p><h1>Catalogue unavailable</h1><div className="empty-state compact"><h2>We could not load the catalogue</h2><p>Try again shortly. Product data has not been replaced with fabricated content.</p><Link className="button primary" href="/products">Try again</Link></div></div></section></main>}
}