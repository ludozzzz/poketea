import { useState } from "react";
import { useAuth } from "../../shared/hooks/useAuth";
import ProductsTab from "./tabs/ProductsTab";

const STYLES = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body,#root{width:100%;height:100%;overflow:hidden;}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f4f4f7;color:#1a1a1a;}
.a-root{display:grid;grid-template-rows:auto 1fr;height:100vh;}
.a-top{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;background:#0f0f12;color:#fff;border-bottom:1px solid #2a2a30;}
.a-top-left{display:flex;align-items:center;gap:14px;}
.a-top-logo{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:18px;}
.a-top-title{font-size:18px;font-weight:800;letter-spacing:-.3px;}
.a-top-right{display:flex;align-items:center;gap:10px;}
.a-logout{padding:8px 16px;border:1px solid #3a3a40;background:transparent;color:#fff;border-radius:10px;font-size:13px;cursor:pointer;}
.a-logout:hover{background:#1a1a1f;}
.a-body{display:grid;grid-template-columns:220px 1fr;overflow:hidden;}
.a-sidebar{background:#fff;border-right:1px solid #e5e5ea;padding:18px 12px;overflow-y:auto;}
.a-side-title{font-size:10px;color:#a8a8b0;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;padding:0 8px;font-weight:700;}
.a-side-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:none;background:transparent;color:#3a3a40;font-size:13.5px;width:100%;text-align:left;margin-bottom:2px;cursor:pointer;font-weight:500;}
.a-side-item:hover{background:#fafaf7;color:#1a1a1a;}
.a-side-item.active{background:#f3e8ff;color:#7c3aed;font-weight:600;}
.a-side-item .em{font-size:16px;}
.a-side-soon{opacity:.4;cursor:not-allowed;}
.a-content{overflow-y:auto;padding:24px;}

/* Login */
.a-login{height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f0f12,#2a1a3a);}
.a-login-box{background:#fff;border-radius:20px;padding:36px;width:min(420px,92vw);box-shadow:0 24px 48px rgba(0,0,0,.3);}
.a-login-icon{font-size:56px;text-align:center;margin-bottom:12px;}
.a-login-title{font-size:24px;font-weight:800;text-align:center;margin-bottom:6px;}
.a-login-sub{font-size:14px;color:#6b6b73;text-align:center;margin-bottom:24px;}
.a-login-in{width:100%;padding:13px 16px;border:1.5px solid #e5e5ea;border-radius:12px;font-size:14px;margin-bottom:10px;}
.a-login-in:focus{outline:none;border-color:#7c3aed;}
.a-login-btn{width:100%;padding:14px;border:none;border-radius:12px;background:#7c3aed;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:6px;}
.a-login-btn:hover{background:#6d28d9;}
.a-login-err{padding:10px;background:#fef2f2;color:#dc2626;border-radius:10px;font-size:13px;margin-bottom:10px;text-align:center;}

/* Page heading & shared elements (used by tabs) */
.a-page-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.a-page-title{font-size:24px;font-weight:800;letter-spacing:-.4px;}
.a-page-sub{font-size:13px;color:#6b6b73;margin-top:4px;}
.a-btn-primary{padding:10px 18px;border:none;border-radius:10px;background:#7c3aed;color:#fff;font-size:13.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
.a-btn-primary:hover{background:#6d28d9;}
.a-btn-secondary{padding:10px 16px;border:1.5px solid #e5e5ea;background:#fff;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;color:#3a3a40;}
.a-btn-secondary:hover{border-color:#a8a8b0;}
.a-btn-danger{padding:8px 14px;border:1px solid #e5e5ea;background:#fff;border-radius:8px;font-size:12px;color:#dc2626;cursor:pointer;}
.a-btn-danger:hover{border-color:#dc2626;background:#fef2f2;}
.a-search-bar{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#fff;border:1.5px solid #e5e5ea;border-radius:12px;margin-bottom:14px;}
.a-search-bar input{flex:1;border:none;outline:none;font-size:14px;background:transparent;}
.a-search-bar select{border:none;outline:none;font-size:13px;background:transparent;font-weight:600;color:#3a3a40;}

/* Products table */
.a-tbl{width:100%;background:#fff;border:1px solid #e5e5ea;border-radius:14px;overflow:hidden;border-collapse:separate;border-spacing:0;}
.a-tbl thead th{text-align:left;padding:12px 14px;font-size:11px;text-transform:uppercase;letter-spacing:.7px;color:#6b6b73;background:#fafaf7;border-bottom:1px solid #e5e5ea;font-weight:700;}
.a-tbl tbody td{padding:12px 14px;font-size:13.5px;border-bottom:1px solid #f0f0f3;vertical-align:middle;}
.a-tbl tbody tr:last-child td{border-bottom:none;}
.a-tbl tbody tr:hover{background:#fafaf7;}
.a-prod-row-name{font-weight:600;}
.a-prod-row-desc{font-size:11.5px;color:#a8a8b0;margin-top:2px;}
.a-badge{display:inline-block;padding:2px 9px;border-radius:8px;font-size:11px;font-weight:600;}
.a-badge.vat-food{background:#dcfce7;color:#15803d;}
.a-badge.vat-alcohol{background:#fef3c7;color:#92400e;}
.a-badge.popular{background:#ffe4e6;color:#be123c;}
.a-badge.off{background:#f0f0f3;color:#6b6b73;}
.a-options-pill{display:inline-block;padding:2px 8px;border-radius:8px;font-size:11px;background:#ede9fe;color:#7c3aed;font-weight:600;}
.a-row-actions{display:flex;gap:6px;justify-content:flex-end;}

/* Modal (product edit) */
.a-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}
.a-md{background:#fff;border-radius:18px;width:min(720px,96vw);max-height:92vh;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,.2);display:flex;flex-direction:column;}
.a-md-head{padding:20px 24px;border-bottom:1px solid #e5e5ea;display:flex;align-items:center;justify-content:space-between;}
.a-md-title{font-size:18px;font-weight:800;}
.a-md-close{background:none;border:none;font-size:24px;color:#a8a8b0;cursor:pointer;line-height:1;}
.a-md-close:hover{color:#1a1a1a;}
.a-md-body{padding:20px 24px;overflow-y:auto;flex:1;}
.a-md-foot{padding:16px 24px;border-top:1px solid #e5e5ea;display:flex;gap:10px;justify-content:flex-end;background:#fafaf7;}
.a-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
.a-form-grid.full{grid-template-columns:1fr;}
.a-fg{display:flex;flex-direction:column;gap:5px;}
.a-fg.span2{grid-column:1/-1;}
.a-fg label{font-size:11px;color:#6b6b73;font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.a-fg input,.a-fg select,.a-fg textarea{padding:10px 14px;border:1.5px solid #e5e5ea;border-radius:10px;font-size:14px;font-family:inherit;}
.a-fg input:focus,.a-fg select:focus,.a-fg textarea:focus{outline:none;border-color:#7c3aed;}
.a-fg textarea{resize:vertical;min-height:60px;}
.a-checkbox{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;user-select:none;}
.a-checkbox input{width:18px;height:18px;cursor:pointer;}

/* Options builder */
.a-section{margin-top:18px;padding-top:18px;border-top:1px solid #e5e5ea;}
.a-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.a-section-title{font-size:14px;font-weight:700;}
.a-option-group{background:#fafaf7;border:1.5px solid #e5e5ea;border-radius:12px;padding:14px;margin-bottom:10px;}
.a-option-group-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.a-option-group-head input{flex:1;padding:8px 12px;border:1.5px solid #e5e5ea;border-radius:8px;font-size:13.5px;font-weight:600;}
.a-option-group-flags{display:flex;gap:14px;margin-bottom:10px;font-size:12px;color:#6b6b73;}
.a-choices{display:flex;flex-direction:column;gap:6px;}
.a-choice{display:flex;align-items:center;gap:8px;}
.a-choice input[type="text"]{flex:1;padding:7px 11px;border:1px solid #e5e5ea;border-radius:8px;font-size:13px;background:#fff;}
.a-choice input[type="number"]{width:90px;padding:7px 11px;border:1px solid #e5e5ea;border-radius:8px;font-size:13px;background:#fff;text-align:right;}
.a-choice-suffix{font-size:12px;color:#6b6b73;}
.a-icon-btn{background:none;border:1px solid #e5e5ea;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:14px;color:#6b6b73;}
.a-icon-btn:hover{border-color:#dc2626;color:#dc2626;}
.a-add-btn{background:#fff;border:1.5px dashed #d4d4d8;border-radius:10px;padding:10px;font-size:13px;color:#7c3aed;cursor:pointer;font-weight:600;width:100%;}
.a-add-btn:hover{border-color:#7c3aed;background:#f3e8ff;}

.a-empty{padding:60px 20px;text-align:center;color:#a8a8b0;}
.a-empty-icon{font-size:48px;margin-bottom:10px;}

.a-md-err{padding:10px;background:#fef2f2;color:#dc2626;border-radius:10px;font-size:13px;margin-bottom:12px;text-align:center;}
`;

const TABS = [
  { id: "products", label: "Produits & options", emoji: "🍽" },
  { id: "vat",      label: "TVA & taxes",        emoji: "💸", soon: true },
  { id: "audit",    label: "Journal d'audit",    emoji: "🛡",  soon: true },
  { id: "closures", label: "Clôtures Z / X",     emoji: "📊", soon: true },
];

export default function AdminApp() {
  const { user, isAdmin, loading: authLoading, login, logout } = useAuth();
  const [tab, setTab] = useState("products");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");

  if (authLoading) {
    return <><style>{STYLES}</style><div className="a-login"><div style={{ color: "#fff", fontSize: 18 }}>Chargement...</div></div></>;
  }

  if (!user || !isAdmin) {
    async function doLogin() {
      try { await login(email, pw); setLoginErr(""); }
      catch { setLoginErr("Email ou mot de passe incorrect"); }
    }
    return (
      <>
        <style>{STYLES}</style>
        <div className="a-login">
          <div className="a-login-box">
            <div className="a-login-icon">⚙️</div>
            <div className="a-login-title">Administration</div>
            <div className="a-login-sub">Connexion admin requise</div>
            {loginErr && <div className="a-login-err">{loginErr}</div>}
            <input className="a-login-in" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="a-login-in" type="password" placeholder="Mot de passe" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
            <button className="a-login-btn" onClick={doLogin}>Se connecter</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="a-root">
        <div className="a-top">
          <div className="a-top-left">
            <div className="a-top-logo">⚙️</div>
            <div className="a-top-title">Administration Poké Tea</div>
          </div>
          <div className="a-top-right">
            <div style={{ fontSize: 12, color: "#a8a8b0" }}>{user.email}</div>
            <button className="a-logout" onClick={logout}>Déconnexion</button>
          </div>
        </div>
        <div className="a-body">
          <div className="a-sidebar">
            <div className="a-side-title">Gestion</div>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`a-side-item ${tab === t.id ? "active" : ""} ${t.soon ? "a-side-soon" : ""}`}
                onClick={() => !t.soon && setTab(t.id)}
                disabled={t.soon}
                title={t.soon ? "Bientôt disponible" : ""}
              >
                <span className="em">{t.emoji}</span>
                {t.label}
                {t.soon && <span style={{ marginLeft: "auto", fontSize: 10, color: "#a8a8b0" }}>bientôt</span>}
              </button>
            ))}
          </div>
          <div className="a-content">
            {tab === "products" && <ProductsTab />}
          </div>
        </div>
      </div>
    </>
  );
}
