"use client";

import Link from "next/link";
import {useState} from "react";

const example = JSON.stringify([
  {
    "sourceId": "supplier-item-001",
    "sourceSku": "MODEL-001",
    "sourceUrl": "https://supplier.example/products/model-001",
    "name": "Brand Model 001",
    "description": "Product description verified against the source listing.",
    "sellingPrice": 10000,
    "referencePrice": 12000,
    "referencePriceUrl": "https://www.jumia.co.ke/example-listing.html",
    "referencePriceCheckedAt": "2026-10-12T10:00:00.000Z",
    "currency": "KES",
    "availability": "available",
    "imageUrls": ["https://images.example.com/model-001.jpg"],
    "category": "Smartphones",
    "variants": []
  }
], null, 2);

export default function AdminImportPage() {
  const [sourceName, setSourceName] = useState("Verified supplier catalogue");
  const [markupType, setMarkupType] = useState("fixed");
  const [markupValue, setMarkupValue] = useState("0");
  const [payload, setPayload] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setResult("");
    let products: unknown;
    try {
      products = JSON.parse(payload);
    } catch {
      setError("The catalogue is not valid JSON. Check commas, quotation marks and brackets.");
      return;
    }
    if (!Array.isArray(products) || products.length === 0) {
      setError("Paste a JSON array containing at least one product.");
      return;
    }
    if (!authorized) {
      setError("Confirm that you are authorized to import these product details and images.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceName,
          authorized: true,
          markupType,
          markupValue: Number(markupValue),
          products
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Import request failed.");
      } else {
        setResult(JSON.stringify(data, null, 2));
        if (data.created || data.updated) setPayload("");
      }
    } catch {
      setError("Could not reach the import endpoint. Please retry when the connection is available.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="admin-page"><section className="section page-top"><div className="container">
    <div className="admin-title-row"><div><p className="eyebrow">CATALOGUE TOOLS</p><h1>Bulk product import</h1><p className="muted">Import up to 2,000 validated products in one run.</p></div><Link className="button secondary" href="/admin/products">Back to products</Link></div>
    <div className="form-card" style={{maxWidth: 900, margin: "0 auto"}}>
      <p className="muted">Use real product records with a source listing URL and direct image URLs. Keep sourcePrice (supplier cost) separate from referencePrice (Jumia comparison price).</p>
      <label htmlFor="sourceName">Catalogue/source name</label>
      <input id="sourceName" value={sourceName} onChange={e => setSourceName(e.target.value)} required />
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginTop:16}}>
        <div><label htmlFor="markupType">Selling-price markup</label><select id="markupType" value={markupType} onChange={e => setMarkupType(e.target.value)}><option value="fixed">Fixed KSh amount</option><option value="percentage">Percentage</option></select></div>
        <div><label htmlFor="markupValue">Markup value</label><input id="markupValue" type="number" min="0" step="any" value={markupValue} onChange={e => setMarkupValue(e.target.value)} /></div>
      </div>
      <label htmlFor="catalogueJson" style={{display:"block",marginTop:16}}>Product catalogue JSON</label>
      <textarea id="catalogueJson" rows={18} value={payload} onChange={e => setPayload(e.target.value)} placeholder={example} spellCheck={false} style={{width:"100%",fontFamily:"monospace",fontSize:13}} />
      <p className="muted">Required fields: sourceId, sourceUrl, name, sourcePrice, currency, availability, imageUrls and category. Optional Jumia comparison fields: referencePrice, referencePriceUrl, referencePriceCheckedAt. Use direct image URLs, not webpage URLs. Available status values: available, unavailable, unknown.</p>
      <label style={{display:"flex",alignItems:"flex-start",gap:10,marginTop:16}}><input type="checkbox" checked={authorized} onChange={e => setAuthorized(e.target.checked)} /><span>I confirm that I am authorized to use the imported product data and images.</span></label>
      <button className="button" type="button" disabled={busy || !payload.trim()} onClick={submit} style={{marginTop:18}}>{busy ? "Importing catalogue…" : "Validate and import products"}</button>
      {error && <p role="alert" style={{color:"#b42318",whiteSpace:"pre-wrap"}}>{error}</p>}
      {result && <div style={{marginTop:18}}><h2>Import report</h2><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",padding:16,borderRadius:8,background:"var(--surface, #f4f4f4)"}}>{result}</pre></div>}
    </div>
  </div></section></main>;
}
