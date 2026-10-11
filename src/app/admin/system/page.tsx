import Link from "next/link";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {isAdminAuthenticated} from "@/lib/admin-guard";
import AdminImportForm from "@/components/admin-import-form";
export const dynamic="force-dynamic";
export default async function AdminSystem(){
 if(!(await isAdminAuthenticated())) redirect("/admin/login");
 const runs=await prisma.importRun.findMany({orderBy:{startedAt:"desc"},take:25});
 return <main className="admin-page"><section className="section page-top"><div className="container">
 <div className="admin-title-row"><div><p className="eyebrow">SYSTEM</p><h1>Import & synchronization</h1><p className="muted">Import only authorized supplier data. Existing selling prices remain unchanged during refreshes.</p></div><Link className="button secondary" href="/admin">Dashboard</Link></div>
 <div className="payment-settings-layout"><AdminImportForm/><aside className="payment-info-card"><h2>Expected JSON fields</h2><p>Required: sourceId, sourceUrl, name, sourcePrice, currency, availability, imageUrls and category.</p><p>Optional: sourceSku, description and variants. Availability values: available, unavailable or unknown.</p><p className="muted small">Records are validated, duplicates skipped, existing selling prices preserved, and each import is reported. Only import data you are authorized to use.</p></aside></div>
 {runs.length>0&&<><h2>Recent import reports</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Source</th><th>Status</th><th>Total</th><th>New</th><th>Updated</th><th>Duplicates</th><th>Failed</th><th>Started</th></tr></thead><tbody>{runs.map(r=><tr key={r.id}><td>{r.sourceName}</td><td>{r.status}</td><td>{r.total}</td><td>{r.created}</td><td>{r.updated}</td><td>{r.duplicates}</td><td>{r.failed}</td><td>{new Intl.DateTimeFormat("en-KE",{dateStyle:"medium"}).format(r.startedAt)}</td></tr>)}</tbody></table></div></>}
 </div></section></main>;
}