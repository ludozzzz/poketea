import { useState, useMemo } from "react";
import { useAuth } from "../../shared/hooks/useAuth";
import { useProducts } from "../../shared/hooks/useProducts";
import { useOrders } from "../../shared/hooks/useOrders";
import { CATEGORIES, SOURCES } from "../../shared/data/categories";
import { computeOrder, computeUnitPriceTTC } from "../../shared/lib/vat";
import { defaultVatForProductCategory } from "../../shared/data/vat";
import ProductOptionsModal from "../../shared/components/ProductOptionsModal";

function lineKey(productId, selectedOptions) {
  const opts = (selectedOptions || []).map(o => `${o.optionId}=${o.choiceId}`).sort().join("|");
  return `${productId}::${opts}`;
}

function formatSelectedOptions(selectedOptions) {
  if (!selectedOptions || selectedOptions.length === 0) return "";
  return selectedOptions.map(o => o.choiceName).join(", ");
}

const STYLES = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body,#root{width:100%;height:100%;overflow:hidden;}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f4f4f7;color:#1a1a1a;}
.p-root{display:grid;grid-template-rows:auto 1fr;height:100vh;}
.p-top{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;background:#0f0f12;color:#fff;border-bottom:1px solid #2a2a30;}
.p-top-left{display:flex;align-items:center;gap:14px;}
.p-top-logo{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#e85d3a,#ff9966);display:flex;align-items:center;justify-content:center;font-size:18px;}
.p-top-title{font-size:18px;font-weight:800;letter-spacing:-.3px;}
.p-top-stats{display:flex;gap:14px;}
.p-stat{padding:6px 14px;background:#1a1a1f;border-radius:10px;}
.p-stat-label{font-size:10px;color:#a8a8b0;text-transform:uppercase;letter-spacing:.5px;}
.p-stat-val{font-size:16px;font-weight:700;}
.p-stat.alert{background:#dc2626;animation:pulse 1.6s infinite;}
@keyframes pulse{50%{opacity:.7}}
.p-top-right{display:flex;align-items:center;gap:10px;}
.p-logout{padding:8px 16px;border:1px solid #3a3a40;background:transparent;color:#fff;border-radius:10px;font-size:13px;cursor:pointer;}
.p-logout:hover{background:#1a1a1f;}

.p-body{display:grid;grid-template-columns:minmax(360px,1.1fr) minmax(420px,1.4fr) minmax(280px,1fr);overflow:hidden;}
.p-col{display:flex;flex-direction:column;overflow:hidden;border-right:1px solid #e5e5ea;background:#fff;}
.p-col:last-child{border-right:none;background:#fafaf7;}
.p-col-head{padding:14px 18px;border-bottom:1px solid #e5e5ea;background:#fafaf7;display:flex;align-items:center;justify-content:space-between;}
.p-col-title{font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;}
.p-col-count{font-size:11px;font-weight:600;padding:2px 9px;border-radius:10px;background:#e85d3a;color:#fff;}
.p-col-body{flex:1;overflow-y:auto;padding:14px;}

/* Incoming orders */
.p-order{background:#fff;border:1.5px solid #e5e5ea;border-radius:14px;padding:14px;margin-bottom:10px;transition:all .15s;}
.p-order.new{border-color:#e85d3a;box-shadow:0 0 0 3px rgba(232,93,58,.1);}
.p-order-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.p-order-id{font-size:15px;font-weight:800;}
.p-source{font-size:10px;font-weight:600;padding:2px 8px;border-radius:8px;color:#fff;display:inline-flex;align-items:center;gap:4px;}
.p-order-meta{font-size:12px;color:#6b6b73;margin-bottom:10px;display:flex;gap:10px;}
.p-order-items{font-size:12.5px;color:#3a3a40;line-height:1.55;margin-bottom:10px;background:#fafaf7;padding:8px 10px;border-radius:8px;max-height:130px;overflow-y:auto;}
.p-order-bot{display:flex;align-items:center;justify-content:space-between;}
.p-order-total{font-size:18px;font-weight:800;color:#e85d3a;}
.p-cash-btn{padding:9px 18px;border:none;border-radius:10px;background:#16a34a;color:#fff;font-size:13px;font-weight:700;cursor:pointer;}
.p-cash-btn:hover{background:#15803d;}
.p-empty{text-align:center;color:#a8a8b0;padding:60px 20px;font-size:14px;}
.p-empty-icon{font-size:48px;margin-bottom:10px;}

/* Catalog */
.p-cats{display:flex;gap:6px;padding:10px 14px;overflow-x:auto;border-bottom:1px solid #e5e5ea;background:#fafaf7;scrollbar-width:none;}
.p-cats::-webkit-scrollbar{display:none;}
.p-cat{flex-shrink:0;padding:9px 15px;border-radius:10px;border:1px solid #e5e5ea;background:#fff;font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;white-space:nowrap;color:#3a3a40;}
.p-cat:hover{border-color:#a8a8b0;}
.p-cat.active{background:#e85d3a;border-color:#e85d3a;color:#fff;}
.p-prods{flex:1;overflow-y:auto;padding:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;align-content:start;}
.p-prod{background:#fff;border:1.5px solid #e5e5ea;border-radius:12px;padding:12px;cursor:pointer;transition:all .12s;text-align:left;display:flex;flex-direction:column;}
.p-prod:hover{border-color:#e85d3a;transform:translateY(-1px);}
.p-prod-name{font-size:13.5px;font-weight:600;line-height:1.3;margin-bottom:6px;}
.p-prod-price{font-size:16px;font-weight:800;color:#e85d3a;margin-top:auto;}

/* Cart counter */
.p-cart-head{display:flex;align-items:center;justify-content:space-between;}
.p-cart-clear{padding:6px 10px;border:1px solid #e5e5ea;background:#fff;border-radius:8px;font-size:11px;color:#dc2626;cursor:pointer;}
.p-cart-clear:hover{border-color:#dc2626;}
.p-mode-toggle{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:10px 14px 0;background:#f0f0f3;border-radius:10px;padding:3px;}
.p-mode-toggle button{padding:8px;border:none;background:transparent;border-radius:8px;font-size:12.5px;font-weight:700;cursor:pointer;color:#6b6b73;transition:all .12s;display:flex;align-items:center;justify-content:center;gap:6px;}
.p-mode-toggle button.active{background:#fff;color:#1a1a1a;box-shadow:0 1px 3px rgba(0,0,0,.08);}
.p-cart-items{flex:1;overflow-y:auto;padding:14px;}
.p-cart-item{display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:1px solid #e5e5ea;}
.p-ci-info{flex:1;min-width:0;}
.p-ci-name{font-size:13px;font-weight:600;line-height:1.3;}
.p-ci-opts{font-size:11px;color:#7c3aed;font-style:italic;margin-top:2px;line-height:1.35;}
.p-ci-price{font-size:11px;color:#6b6b73;margin-top:2px;}
.p-ci-subtotal{font-size:12px;font-weight:700;color:#1a1a1a;margin-top:1px;}
.p-ci-qty{display:flex;align-items:center;gap:6px;}
.p-ci-q{width:24px;height:24px;border:1px solid #e5e5ea;background:#fff;border-radius:6px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.p-ci-q:hover{border-color:#e85d3a;color:#e85d3a;}
.p-ci-qv{font-size:13px;font-weight:700;min-width:18px;text-align:center;}
.p-ci-rm{margin-left:6px;color:#dc2626;background:none;border:none;font-size:18px;cursor:pointer;}
.p-cart-foot{padding:14px;border-top:1px solid #e5e5ea;background:#fff;}
.p-vat-rows{display:flex;flex-direction:column;gap:3px;padding:8px 0 10px;border-bottom:1px dashed #e5e5ea;margin-bottom:10px;}
.p-vat-row{display:flex;justify-content:space-between;font-size:11.5px;color:#6b6b73;}
.p-vat-row strong{color:#1a1a1a;font-weight:600;}
.p-cart-total{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;}
.p-cart-total-l{font-size:13px;color:#6b6b73;font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.p-cart-total-v{font-size:26px;font-weight:800;color:#e85d3a;}
.p-cart-pay{width:100%;padding:14px;border:none;border-radius:12px;background:#e85d3a;color:#fff;font-size:15px;font-weight:800;cursor:pointer;}
.p-cart-pay:hover{background:#d4512f;}
.p-cart-pay:disabled{background:#e5e5ea;color:#a8a8b0;cursor:not-allowed;}

/* Payment modal */
.p-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;}
.p-md{background:#fff;border-radius:18px;padding:28px;width:min(500px,92vw);box-shadow:0 24px 48px rgba(0,0,0,.2);}
.p-md-title{font-size:20px;font-weight:800;margin-bottom:6px;}
.p-md-sub{font-size:14px;color:#6b6b73;margin-bottom:20px;}
.p-md-total{padding:20px;background:#fafaf7;border-radius:14px;margin-bottom:18px;text-align:center;}
.p-md-total-l{font-size:11px;color:#6b6b73;text-transform:uppercase;letter-spacing:.7px;margin-bottom:4px;}
.p-md-total-v{font-size:36px;font-weight:900;color:#e85d3a;}
.p-md-vat{padding:14px;background:#f3e8ff;border-radius:12px;margin-bottom:14px;border:1px solid #e9d5ff;}
.p-md-vat-title{font-size:10px;color:#7c3aed;text-transform:uppercase;letter-spacing:.6px;font-weight:700;margin-bottom:8px;}
.p-md-vat-row{display:flex;justify-content:space-between;font-size:12px;color:#3a3a40;padding:3px 0;}
.p-md-vat-row strong{font-weight:600;}
.p-md-vat-tot{display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;color:#1a1a1a;padding-top:6px;margin-top:4px;border-top:1px solid #d8b4fe;}
.p-pays{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.p-pay{padding:18px;border:2px solid #e5e5ea;background:#fff;border-radius:14px;cursor:pointer;font-size:15px;font-weight:700;display:flex;flex-direction:column;align-items:center;gap:6px;}
.p-pay:hover{border-color:#a8a8b0;}
.p-pay.selected{border-color:#e85d3a;background:#fef5f2;color:#e85d3a;}
.p-pay-icon{font-size:32px;}
.p-cash-input{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
.p-cash-input label{font-size:12px;color:#6b6b73;font-weight:600;}
.p-cash-input input{padding:14px;border:1.5px solid #e5e5ea;border-radius:12px;font-size:18px;font-weight:700;text-align:center;}
.p-cash-input input:focus{outline:none;border-color:#e85d3a;}
.p-change{padding:14px;background:#dcfce7;color:#15803d;border-radius:12px;text-align:center;font-weight:800;margin-bottom:14px;font-size:18px;}
.p-md-acts{display:flex;gap:10px;}
.p-md-cancel{flex:1;padding:13px;border:1.5px solid #e5e5ea;background:#fff;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;color:#6b6b73;}
.p-md-confirm{flex:2;padding:13px;border:none;border-radius:12px;background:#16a34a;color:#fff;font-size:14px;font-weight:800;cursor:pointer;}
.p-md-confirm:disabled{background:#e5e5ea;color:#a8a8b0;cursor:not-allowed;}
.p-md-err{padding:10px;background:#fef2f2;color:#dc2626;border-radius:10px;font-size:13px;margin-bottom:12px;text-align:center;}

/* Login */
.p-login{height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f0f12,#1a1a1f);}
.p-login-box{background:#fff;border-radius:20px;padding:36px;width:min(420px,92vw);box-shadow:0 24px 48px rgba(0,0,0,.3);}
.p-login-icon{font-size:56px;text-align:center;margin-bottom:12px;}
.p-login-title{font-size:24px;font-weight:800;text-align:center;margin-bottom:6px;}
.p-login-sub{font-size:14px;color:#6b6b73;text-align:center;margin-bottom:24px;}
.p-login-in{width:100%;padding:13px 16px;border:1.5px solid #e5e5ea;border-radius:12px;font-size:14px;margin-bottom:10px;}
.p-login-in:focus{outline:none;border-color:#e85d3a;}
.p-login-btn{width:100%;padding:14px;border:none;border-radius:12px;background:#e85d3a;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:6px;}
.p-login-btn:hover{background:#d4512f;}
.p-login-err{padding:10px;background:#fef2f2;color:#dc2626;border-radius:10px;font-size:13px;margin-bottom:10px;text-align:center;}
`;

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function ordersDayTotal(orders) {
  const start = todayStart();
  return orders
    .filter(o => o.paid && o.createdAt && (o.createdAt.toDate ? o.createdAt.toDate().getTime() : new Date(o.createdAt).getTime()) >= start)
    .reduce((s, o) => s + (o.total || 0), 0);
}

export default function PosApp() {
  const { user, isAdmin, loading: authLoading, login, logout } = useAuth();
  const { products, loading: prodsLoading } = useProducts();
  const { orders, createOrder, markPaid } = useOrders();
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const [counterCart, setCounterCart] = useState([]);
  const [counterMode, setCounterMode] = useState("emporter"); // "emporter" | "surplace"
  const [optionsForProduct, setOptionsForProduct] = useState(null);
  const [payOrder, setPayOrder] = useState(null);
  const [payMethod, setPayMethod] = useState("cb");
  const [cashGiven, setCashGiven] = useState("");
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const incoming = useMemo(
    () => orders.filter(o => o.status === "nouvelle" && !o.paid).sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return ta - tb;
    }),
    [orders]
  );

  const dayCount = useMemo(() => {
    const start = todayStart();
    return orders.filter(o => o.paid && o.createdAt && (o.createdAt.toDate ? o.createdAt.toDate().getTime() : 0) >= start).length;
  }, [orders]);

  const dayTotal = useMemo(() => ordersDayTotal(orders), [orders]);

  if (authLoading) {
    return <><style>{STYLES}</style><div className="p-login"><div style={{ color: "#fff", fontSize: 18 }}>Chargement...</div></div></>;
  }

  if (!user || !isAdmin) {
    async function doLogin() {
      try {
        await login(email, pw);
        setLoginErr("");
      } catch {
        setLoginErr("Email ou mot de passe incorrect");
      }
    }
    return (
      <>
        <style>{STYLES}</style>
        <div className="p-login">
          <div className="p-login-box">
            <div className="p-login-icon">💵</div>
            <div className="p-login-title">Caisse Poké Tea</div>
            <div className="p-login-sub">Connexion personnel requise</div>
            {loginErr && <div className="p-login-err">{loginErr}</div>}
            <input className="p-login-in" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="p-login-in" type="password" placeholder="Mot de passe" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
            <button className="p-login-btn" onClick={doLogin}>Se connecter</button>
          </div>
        </div>
      </>
    );
  }

  function addToCounter(p) {
    // Si le produit a des options, on ouvre la modal de sélection.
    if (Array.isArray(p.options) && p.options.length > 0) {
      setOptionsForProduct(p);
      return;
    }
    addLineToCart(p, [], 1);
  }

  function addLineToCart(p, selectedOptions, qty) {
    const unitPriceTTC = computeUnitPriceTTC(p.price, selectedOptions);
    const vatCategory = p.vatCategory || defaultVatForProductCategory(p.category);
    const key = lineKey(p.id, selectedOptions);
    setCounterCart(prev => {
      const ex = prev.find(i => i._key === key);
      if (ex) return prev.map(i => i._key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, {
        _key: key,
        productId: p.id,
        name: p.name,
        basePrice: Number(p.price) || 0,
        unitPriceTTC,
        vatCategory,
        productCategory: p.category,
        selectedOptions: selectedOptions || [],
        qty,
      }];
    });
  }

  function changeQty(key, delta) {
    setCounterCart(prev => prev.flatMap(i => {
      if (i._key !== key) return [i];
      const q = i.qty + delta;
      return q <= 0 ? [] : [{ ...i, qty: q }];
    }));
  }
  function removeFromCounter(key) {
    setCounterCart(prev => prev.filter(i => i._key !== key));
  }
  function clearCounter() {
    if (counterCart.length === 0) return;
    if (confirm("Vider le panier ?")) setCounterCart([]);
  }

  // Calcul TVA en live selon le mode actif du panier comptoir
  const counterCalc = useMemo(
    () => computeOrder(counterCart, counterMode),
    [counterCart, counterMode]
  );
  const counterTotal = counterCalc.totalTTC;

  async function startCounterPayment() {
    if (counterCart.length === 0) return;
    setPayOrder({
      __counter: true,
      mode: counterMode,
      items: counterCalc.items,
      total: counterCalc.totalTTC,
      totalHT: counterCalc.totalHT,
      totalVAT: counterCalc.totalVAT,
      totalTTC: counterCalc.totalTTC,
      vatBreakdown: counterCalc.vatBreakdown,
    });
    setPayMethod("cb");
    setCashGiven("");
    setPayErr("");
  }

  function startPayOrder(order) {
    // Recalcule la ventilation TVA au moment d'encaisser (les commandes web/borne
    // n'ont pas encore de breakdown vu qu'elles ont été passées avant paiement).
    const items = (order.items || []).map(it => ({
      ...it,
      // Si l'item n'a pas encore les nouveaux champs, on remplit depuis le minimum dispo
      unitPriceTTC: Number(it.unitPriceTTC ?? it.price ?? 0),
      qty: Number(it.qty || 1),
      vatCategory: it.vatCategory,            // sera complété par computeOrder via defaultVatForProductCategory si manquant
      productCategory: it.productCategory,
    }));
    const calc = computeOrder(items, order.mode || "emporter");
    setPayOrder({
      ...order,
      items: calc.items,
      total: calc.totalTTC,
      totalHT: calc.totalHT,
      totalVAT: calc.totalVAT,
      totalTTC: calc.totalTTC,
      vatBreakdown: calc.vatBreakdown,
    });
    setPayMethod("cb");
    setCashGiven("");
    setPayErr("");
  }

  function closePay() {
    setPayOrder(null);
    setPayErr("");
  }

  const filteredProducts = products
    .filter(p => p.category === activeCat && p.available !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  function switchPayOrderMode(newMode) {
    if (!payOrder) return;
    const calc = computeOrder(payOrder.items, newMode);
    setPayOrder({
      ...payOrder,
      mode: newMode,
      items: calc.items,
      total: calc.totalTTC,
      totalHT: calc.totalHT,
      totalVAT: calc.totalVAT,
      totalTTC: calc.totalTTC,
      vatBreakdown: calc.vatBreakdown,
    });
    if (payOrder.__counter) setCounterMode(newMode);
  }

  async function confirmPayment() {
    if (!payOrder || paying) return;
    setPaying(true);
    setPayErr("");
    try {
      if (payOrder.__counter) {
        const { id } = await createOrder({
          items: payOrder.items,
          mode: payOrder.mode,
          source: "counter",
          paid: false,
          total:       payOrder.totalTTC,
          totalHT:     payOrder.totalHT,
          totalVAT:    payOrder.totalVAT,
          totalTTC:    payOrder.totalTTC,
          vatBreakdown: payOrder.vatBreakdown,
        });
        await markPaid(id, payMethod);
        setCounterCart([]);
      } else {
        // Persiste la ventilation TVA recalculée lors de l'encaissement
        await markPaid(payOrder.id, payMethod, {
          items:        payOrder.items,
          totalHT:      payOrder.totalHT,
          totalVAT:     payOrder.totalVAT,
          totalTTC:     payOrder.totalTTC,
          vatBreakdown: payOrder.vatBreakdown,
        });
      }
      setPayOrder(null);
    } catch (e) {
      setPayErr("Erreur lors de l'encaissement.");
    } finally {
      setPaying(false);
    }
  }

  const cashAmount = parseFloat(cashGiven.replace(",", ".")) || 0;
  const change = payOrder ? cashAmount - payOrder.total : 0;
  const canConfirmCash = payMethod !== "especes" || cashAmount >= (payOrder?.total || 0);

  return (
    <>
      <style>{STYLES}</style>
      <div className="p-root">
        <div className="p-top">
          <div className="p-top-left">
            <div className="p-top-logo">💵</div>
            <div className="p-top-title">Caisse Poké Tea</div>
          </div>
          <div className="p-top-stats">
            {incoming.length > 0 && (
              <div className="p-stat alert">
                <div className="p-stat-label">À encaisser</div>
                <div className="p-stat-val">{incoming.length}</div>
              </div>
            )}
            <div className="p-stat">
              <div className="p-stat-label">Ventes du jour</div>
              <div className="p-stat-val">{dayCount}</div>
            </div>
            <div className="p-stat">
              <div className="p-stat-label">CA du jour</div>
              <div className="p-stat-val">{dayTotal.toFixed(2)} €</div>
            </div>
          </div>
          <div className="p-top-right">
            <div style={{ fontSize: 12, color: "#a8a8b0" }}>{user.email}</div>
            <button className="p-logout" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="p-body">
          {/* Incoming orders */}
          <div className="p-col">
            <div className="p-col-head">
              <div className="p-col-title">📥 Commandes entrantes
                {incoming.length > 0 && <span className="p-col-count">{incoming.length}</span>}
              </div>
            </div>
            <div className="p-col-body">
              {incoming.length === 0 ? (
                <div className="p-empty">
                  <div className="p-empty-icon">📭</div>
                  Aucune commande en attente
                </div>
              ) : (
                incoming.map(o => {
                  const src = SOURCES[o.source] || SOURCES.web;
                  return (
                    <div key={o.id} className="p-order new">
                      <div className="p-order-top">
                        <div className="p-order-id">#{o.orderNum}</div>
                        <span className="p-source" style={{ background: src.color }}>
                          {src.emoji} {src.label}
                        </span>
                      </div>
                      <div className="p-order-meta">
                        <span>{formatTime(o.createdAt)}</span>
                        <span>•</span>
                        <span>{o.mode === "surplace" ? "🍽 Sur place" : "🥡 À emporter"}</span>
                      </div>
                      <div className="p-order-items">
                        {(o.items || []).map((it, idx) => (
                          <div key={idx}>{it.qty}× {it.name}</div>
                        ))}
                      </div>
                      <div className="p-order-bot">
                        <div className="p-order-total">{(o.total || 0).toFixed(2)} €</div>
                        <button className="p-cash-btn" onClick={() => startPayOrder(o)}>Encaisser →</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Catalog */}
          <div className="p-col">
            <div className="p-col-head">
              <div className="p-col-title">🛍 Vente au comptoir</div>
            </div>
            <div className="p-cats">
              {CATEGORIES.map(c => (
                <button key={c.id} className={`p-cat ${activeCat === c.id ? "active" : ""}`} onClick={() => setActiveCat(c.id)}>
                  <span>{c.emoji}</span>{c.name}
                </button>
              ))}
            </div>
            {prodsLoading ? (
              <div className="p-empty">⏳ Chargement...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-empty">
                <div className="p-empty-icon">🤷</div>
                Aucun produit
              </div>
            ) : (
              <div className="p-prods">
                {filteredProducts.map(p => (
                  <button key={p.id} className="p-prod" onClick={() => addToCounter(p)}>
                    <div className="p-prod-name">{p.name}</div>
                    <div className="p-prod-price">{p.price.toFixed(2)} €</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Counter cart */}
          <div className="p-col">
            <div className="p-col-head p-cart-head">
              <div className="p-col-title">🧾 Panier comptoir
                {counterCart.length > 0 && <span className="p-col-count">{counterCart.reduce((s, i) => s + i.qty, 0)}</span>}
              </div>
              {counterCart.length > 0 && <button className="p-cart-clear" onClick={clearCounter}>Vider</button>}
            </div>
            <div className="p-mode-toggle">
              <button className={counterMode === "emporter" ? "active" : ""} onClick={() => setCounterMode("emporter")}>🥡 À emporter</button>
              <button className={counterMode === "surplace" ? "active" : ""} onClick={() => setCounterMode("surplace")}>🍽 Sur place</button>
            </div>
            <div className="p-cart-items">
              {counterCart.length === 0 ? (
                <div className="p-empty">
                  <div className="p-empty-icon">🛒</div>
                  Touchez un produit
                </div>
              ) : (
                counterCart.map(i => (
                  <div key={i._key} className="p-cart-item">
                    <div className="p-ci-info">
                      <div className="p-ci-name">{i.name}</div>
                      {i.selectedOptions && i.selectedOptions.length > 0 && (
                        <div className="p-ci-opts">{formatSelectedOptions(i.selectedOptions)}</div>
                      )}
                      <div className="p-ci-price">{i.unitPriceTTC.toFixed(2)} € × {i.qty}</div>
                      <div className="p-ci-subtotal">= {(i.unitPriceTTC * i.qty).toFixed(2)} €</div>
                    </div>
                    <div className="p-ci-qty">
                      <button className="p-ci-q" onClick={() => changeQty(i._key, -1)}>−</button>
                      <div className="p-ci-qv">{i.qty}</div>
                      <button className="p-ci-q" onClick={() => changeQty(i._key, +1)}>+</button>
                    </div>
                    <button className="p-ci-rm" onClick={() => removeFromCounter(i._key)}>×</button>
                  </div>
                ))
              )}
            </div>
            <div className="p-cart-foot">
              {counterCart.length > 0 && (
                <div className="p-vat-rows">
                  <div className="p-vat-row"><span>Sous-total HT</span><strong>{counterCalc.totalHT.toFixed(2)} €</strong></div>
                  {Object.entries(counterCalc.vatBreakdown).map(([rate, b]) => (
                    <div key={rate} className="p-vat-row">
                      <span>TVA {rate.replace(".", ",")} %</span>
                      <strong>{b.vat.toFixed(2)} €</strong>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-cart-total">
                <span className="p-cart-total-l">Total TTC</span>
                <span className="p-cart-total-v">{counterTotal.toFixed(2)} €</span>
              </div>
              <button className="p-cart-pay" disabled={counterCart.length === 0} onClick={startCounterPayment}>
                Encaisser ({counterMode === "surplace" ? "Sur place" : "À emporter"})
              </button>
            </div>
          </div>
        </div>

        {payOrder && (
          <div className="p-ov" onClick={closePay}>
            <div className="p-md" onClick={e => e.stopPropagation()}>
              <div className="p-md-title">Encaissement</div>
              <div className="p-md-sub">
                {payOrder.__counter ? "Vente comptoir" : `Commande #${payOrder.orderNum}`}
              </div>
              <div className="p-mode-toggle" style={{ margin: "0 0 16px" }}>
                <button
                  className={payOrder.mode === "emporter" ? "active" : ""}
                  onClick={() => switchPayOrderMode("emporter")}
                >🥡 À emporter</button>
                <button
                  className={payOrder.mode === "surplace" ? "active" : ""}
                  onClick={() => switchPayOrderMode("surplace")}
                >🍽 Sur place</button>
              </div>
              <div className="p-md-total">
                <div className="p-md-total-l">Montant à encaisser</div>
                <div className="p-md-total-v">{payOrder.total.toFixed(2)} €</div>
              </div>
              {payOrder.vatBreakdown && Object.keys(payOrder.vatBreakdown).length > 0 && (
                <div className="p-md-vat">
                  <div className="p-md-vat-title">
                    Ventilation TVA — {payOrder.mode === "surplace" ? "🍽 Sur place" : "🥡 À emporter"}
                  </div>
                  {Object.entries(payOrder.vatBreakdown).map(([rate, b]) => (
                    <div key={rate} className="p-md-vat-row">
                      <span>TVA {rate.replace(".", ",")} %</span>
                      <strong>HT {b.ht.toFixed(2)} € • TVA {b.vat.toFixed(2)} €</strong>
                    </div>
                  ))}
                  <div className="p-md-vat-tot">
                    <span>Total HT</span>
                    <span>{(payOrder.totalHT || 0).toFixed(2)} €</span>
                  </div>
                </div>
              )}
              {payErr && <div className="p-md-err">{payErr}</div>}
              <div className="p-pays">
                <button className={`p-pay ${payMethod === "cb" ? "selected" : ""}`} onClick={() => setPayMethod("cb")}>
                  <div className="p-pay-icon">💳</div>
                  Carte bancaire
                </button>
                <button className={`p-pay ${payMethod === "especes" ? "selected" : ""}`} onClick={() => setPayMethod("especes")}>
                  <div className="p-pay-icon">💶</div>
                  Espèces
                </button>
              </div>
              {payMethod === "especes" && (
                <>
                  <div className="p-cash-input">
                    <label>Montant remis (€)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={cashGiven}
                      onChange={e => setCashGiven(e.target.value.replace(/[^0-9.,]/g, ""))}
                      autoFocus
                    />
                  </div>
                  {cashAmount > 0 && change >= 0 && (
                    <div className="p-change">À rendre : {change.toFixed(2)} €</div>
                  )}
                  {cashAmount > 0 && change < 0 && (
                    <div className="p-md-err">Il manque {Math.abs(change).toFixed(2)} €</div>
                  )}
                </>
              )}
              <div className="p-md-acts">
                <button className="p-md-cancel" onClick={closePay}>Annuler</button>
                <button className="p-md-confirm" disabled={paying || !canConfirmCash} onClick={confirmPayment}>
                  {paying ? "..." : "✓ Valider l'encaissement"}
                </button>
              </div>
            </div>
          </div>
        )}

        {optionsForProduct && (
          <ProductOptionsModal
            product={optionsForProduct}
            onClose={() => setOptionsForProduct(null)}
            onAdd={(selectedOptions, qty) => {
              addLineToCart(optionsForProduct, selectedOptions, qty);
              setOptionsForProduct(null);
            }}
          />
        )}
      </div>
    </>
  );
}
