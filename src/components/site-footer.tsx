import Link from "next/link";

export default function SiteFooter(){
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand"><Link className="brand footer-logo" href="/"><img src="/brand-mark.svg" alt="" width="44" height="44"/><span><strong>Import<span>Hub</span></strong><small>Global products · Local trust</small></span></Link><p>A polished, trustworthy storefront designed for verified imported products and secure online ordering.</p></div>
      <div><h2>Shop</h2><Link href="/products">All products</Link><Link href="/categories">Categories</Link><Link href="/cart">Cart</Link></div>
      <div><h2>Help</h2><Link href="/checkout">Checkout</Link><Link href="/admin/login">Store admin</Link><span>Secure payments via Paystack</span></div>
      <div><h2>Trust</h2><span>Verified catalogue data</span><span>Transparent availability</span><span>Server-validated pricing</span></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} ImportHub. All rights reserved.</span><span>Built for fast, accessible shopping.</span></div>
  </footer>;
}