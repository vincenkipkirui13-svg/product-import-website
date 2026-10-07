import Link from "next/link";
import {redirect} from "next/navigation";
import {isAdminAuthenticated} from "@/lib/admin-guard";

const sections=[
  ["Dashboard","Store health, import activity and order overview."],
  ["Products","Catalogue, pricing, availability and product media."],
  ["Orders","Customer orders and payment status."],
  ["Store","Branding, contact details and store configuration."],
  ["Content","Homepage sections, banners and media."],
  ["Payments","Paystack configuration and transaction controls."],
  ["System","Import sources, synchronization and operational settings."]
];

export default async function AdminPage(){
  if(!(await isAdminAuthenticated())) redirect("/admin/login");

  return <main>
    <header className="admin-header">
      <div className="container nav">
        <Link className="brand" href="/">Product<span>Store</span></Link>
        <div className="admin-actions">
          <span className="admin-label">ADMIN</span>
          <form action="/api/admin/logout" method="post">
            <button className="button secondary" type="submit">Sign out</button>
          </form>
        </div>
      </div>
    </header>
    <section className="section page-top">
      <div className="container">
        <p className="eyebrow">CONTROL CENTER</p>
        <h1>Store administration</h1>
        <p className="muted">Authenticated store administration. Operational controls will be enabled only after their validation, authorization and failure handling are in place.</p>
        <div className="admin-grid">
          {sections.map(([title,copy])=><article className="admin-card" key={title}>
            <span className="card-number">{title.slice(0,2).toUpperCase()}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>)}
        </div>
      </div>
    </section>
  </main>;
}