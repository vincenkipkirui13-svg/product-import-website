import Link from "next/link";
import {prisma} from "@/lib/prisma";

export const dynamic="force-dynamic";

export default async function CategoriesPage(){
  try{
    const groups=await prisma.product.groupBy({by:["category"],_count:{_all:true},orderBy:{category:"asc"}});
    return <main><section className="section page-top"><div className="container"><p className="eyebrow">DISCOVER</p><h1>Shop by category</h1><p className="muted">Categories are generated directly from the approved product catalogue.</p>{groups.length===0?<div className="empty-state compact"><h2>Categories will appear with the catalogue</h2><p>Once verified products are imported, their real categories will become available here.</p><Link className="button primary" href="/products">View products</Link></div>:<div className="category-grid">{groups.map(group=><Link className="category-card" href={`/products?category=${encodeURIComponent(group.category)}`} key={group.category}><span className="category-index">{String(group._count._all).padStart(2,"0")}</span><h2>{group.category}</h2><p>{group._count._all} {group._count._all===1?"product":"products"} in catalogue</p><span className="category-arrow">Explore →</span></Link>)}</div>}</div></section></main>;
  }catch{return <main><section className="section page-top"><div className="container"><h1>Categories unavailable</h1><div className="empty-state compact"><p>We could not load catalogue categories right now.</p><Link className="button primary" href="/categories">Try again</Link></div></div></section></main>}
}