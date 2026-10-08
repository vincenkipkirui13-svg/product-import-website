"use client";

import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";

type Settings={
  enabled:boolean;publicKey:string;publicConfigured:boolean;secretConfigured:boolean;secretLast4:string;mode:"live"|"test"|"unknown";
};

export default function AdminSettings(){
  const [settings,setSettings]=useState<Settings|null>(null);
  const [enabled,setEnabled]=useState(false);
  const [publicKey,setPublicKey]=useState("");
  const [secretKey,setSecretKey]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(true);
  const [testing,setTesting]=useState(false);

  async function load(){
    setBusy(true);
    try{
      const response=await fetch("/api/admin/settings/payment",{cache:"no-store"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Unable to load payment settings.");
      setSettings(data);setEnabled(Boolean(data.enabled));setPublicKey(data.publicKey||"");
    }catch(error){setError(error instanceof Error?error.message:"Unable to load payment settings.");}
    finally{setBusy(false);}
  }

  useEffect(()=>{void load();},[]);

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setMessage("");setError("");
    try{
      const response=await fetch("/api/admin/settings/payment",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({enabled,publicKey,secretKey})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Unable to save payment settings.");
      setSecretKey("");setMessage("Payment settings saved securely.");await load();
    }catch(error){setError(error instanceof Error?error.message:"Unable to save payment settings.");setBusy(false);}
  }

  async function testConnection(){
    setTesting(true);setMessage("");setError("");
    try{
      const response=await fetch("/api/admin/settings/payment/test",{method:"POST"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||data.message||"Paystack connection test failed.");
      setMessage(data.message);
    }catch(error){setError(error instanceof Error?error.message:"Paystack connection test failed.");}
    finally{setTesting(false);}
  }

  return <main className="admin-page"><section className="section page-top"><div className="container">
    <div className="admin-title-row"><div><p className="eyebrow">SETTINGS</p><h1>Payment settings</h1><p className="muted">Connect the store to Paystack without exposing secret credentials to the browser or public storefront.</p></div><Link className="button secondary" href="/admin">Dashboard</Link></div>

    <div className="payment-settings-layout">
      <form className="payment-settings-card" onSubmit={submit}>
        <div className="payment-settings-heading"><div><span className="settings-kicker">PAYSTACK</span><h2>Payment gateway</h2><p>Enter your Paystack API keys here. The secret key is encrypted before it is stored.</p></div><span className={enabled?"settings-status on":"settings-status"}>{enabled?"ENABLED":"DISABLED"}</span></div>
        <label className="toggle-row"><span><b>Accept online payments</b><small>Customers can continue from checkout to Paystack when enabled.</small></span><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/></label>
        <label>Paystack Public Key<input value={publicKey} onChange={e=>setPublicKey(e.target.value)} placeholder="pk_test_… or pk_live_…" autoComplete="off"/></label>
        <label>Paystack Secret Key<input value={secretKey} onChange={e=>setSecretKey(e.target.value)} placeholder={settings?.secretConfigured?("Saved securely •••• "+settings.secretLast4):"sk_test_… or sk_live_…"} type="password" autoComplete="new-password"/></label>
        {settings?.secretConfigured&&<div className="secret-status"><span>✓</span><div><b>Secret key stored</b><small>Only the last four characters are shown: •••• {settings.secretLast4} · {settings.mode.toUpperCase()} mode</small></div></div>}
        {message&&<p className="form-success" role="status">{message}</p>}
        {error&&<p className="form-error" role="alert">{error}</p>}
        <div className="admin-actions"><button className="button primary" type="submit" disabled={busy}>{busy?"Saving…":"Save payment settings"}</button><button className="button secondary" type="button" onClick={testConnection} disabled={testing||!settings?.secretConfigured}>{testing?"Testing…":"Test Paystack connection"}</button></div>
        <p className="muted small">Never paste secret keys into GitHub, frontend code, screenshots, or public messages.</p>
      </form>

      <aside className="payment-settings-side">
        <div className="payment-info-card"><span className="settings-kicker">PAYMENT FLOW</span><h2>What is already handled</h2><ul><li>Server-side transaction initialization</li><li>Live database price and availability checks</li><li>Unique order and Paystack references</li><li>Amount and currency verification</li><li>Signed Paystack webhook verification</li><li>Duplicate-success protection</li><li>Clear pending, paid and failed states</li></ul></div>
        <div className="payment-info-card"><span className="settings-kicker">WEBHOOK</span><h2>Endpoint</h2><p>Paystack should send payment events to:</p><code>/api/payments/webhook</code><p className="muted small">The webhook signature is checked with the stored secret key. The callback page also verifies the transaction server-side.</p></div>
      </aside>
    </div>
  </div></section></main>;
}
