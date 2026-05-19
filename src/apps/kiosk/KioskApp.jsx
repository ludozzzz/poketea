import { useState, useEffect, useRef, useMemo } from "react";
import { useProducts } from "../../shared/hooks/useProducts";
import { useOrders } from "../../shared/hooks/useOrders";
import { CATEGORIES, MODES } from "../../shared/data/categories";
import { computeOrder, computeUnitPriceTTC } from "../../shared/lib/vat";
import { defaultVatForProductCategory } from "../../shared/data/vat";
import ProductOptionsModal from "../../shared/components/ProductOptionsModal";

function lineKey(productId, selectedOptions) {
  const opts = (selectedOptions || []).map(o => `${o.optionId}=${o.choiceId}`).sort().join("|");
  return `${productId}::${opts}`;
}

function formatSelectedOptions(selectedOptions) {
  if (!selectedOptions || selectedOptions.length === 0) return "";
  return selectedOptions.map(o => o.choiceName).join(" · ");
}

const IDLE_MS = 60000;
const CONFIRM_MS = 12000;

const STYLES = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;}
html,body,#root{width:100%;height:100%;overflow:hidden;}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#0f0f12;color:#fff;}
.k-root{width:100vw;height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#1a1a1f 0%,#0f0f12 100%);overflow:hidden;}
.k-header{display:flex;align-items:center;justify-content:space-between;padding:18px 28px;border-bottom:1px solid #2a2a30;}
.k-logo{display:flex;align-items:center;gap:12px;}
.k-logo-icon{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#e85d3a,#ff9966);display:flex;align-items:center;justify-content:center;font-size:24px;}
.k-logo-text{font-size:22px;font-weight:800;letter-spacing:-.5px;}
.k-back{background:#2a2a30;border:none;color:#fff;padding:14px 22px;border-radius:14px;font-size:16px;font-weight:600;}
.k-back:active{background:#3a3a40;}

/* Welcome */
.k-welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;}
.k-w-logo{font-size:140px;margin-bottom:20px;animation:bounce 2s infinite ease-in-out;}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.k-w-title{font-size:64px;font-weight:900;letter-spacing:-2px;margin-bottom:14px;text-align:center;}
.k-w-title span{background:linear-gradient(135deg,#e85d3a,#ff9966);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.k-w-sub{font-size:22px;color:#a8a8b0;margin-bottom:48px;text-align:center;}
.k-w-btn{padding:28px 80px;border:none;border-radius:24px;background:linear-gradient(135deg,#e85d3a,#ff7043);color:#fff;font-size:32px;font-weight:800;box-shadow:0 12px 40px rgba(232,93,58,.4);transition:transform .15s;}
.k-w-btn:active{transform:scale(.97);}

/* Mode select */
.k-modes{flex:1;display:flex;align-items:center;justify-content:center;gap:32px;padding:60px;}
.k-mode{flex:1;max-width:420px;height:480px;border-radius:32px;border:3px solid #2a2a30;background:#1a1a1f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;transition:all .15s;}
.k-mode:active{border-color:#e85d3a;background:#231a17;transform:scale(.98);}
.k-mode-icon{font-size:140px;}
.k-mode-label{font-size:42px;font-weight:800;}
.k-mode-sub{font-size:18px;color:#a8a8b0;text-align:center;padding:0 24px;}

/* Menu */
.k-menu{display:flex;flex-direction:column;flex:1;overflow:hidden;}
.k-cats{display:flex;gap:10px;padding:14px 22px;overflow-x:auto;border-bottom:1px solid #2a2a30;scrollbar-width:none;}
.k-cats::-webkit-scrollbar{display:none;}
.k-cat{flex-shrink:0;padding:14px 22px;border-radius:18px;background:#2a2a30;color:#a8a8b0;border:none;font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px;white-space:nowrap;}
.k-cat.active{background:#e85d3a;color:#fff;}
.k-cat-emoji{font-size:22px;}
.k-products{flex:1;overflow-y:auto;padding:22px;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;-webkit-overflow-scrolling:touch;}
.k-prod{background:#1a1a1f;border:1.5px solid #2a2a30;border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:10px;transition:transform .12s;}
.k-prod:active{transform:scale(.98);border-color:#e85d3a;}
.k-prod-name{font-size:18px;font-weight:700;line-height:1.25;}
.k-prod-desc{font-size:13px;color:#8a8a92;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.k-prod-bot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;}
.k-prod-price{font-size:22px;font-weight:800;color:#e85d3a;}
.k-prod-add{width:54px;height:54px;border-radius:50%;background:#e85d3a;color:#fff;border:none;font-size:30px;display:flex;align-items:center;justify-content:center;}
.k-prod-add:active{background:#d4512f;}

/* Cart bar bottom */
.k-cart-bar{padding:14px 22px;background:#1a1a1f;border-top:1px solid #2a2a30;display:flex;align-items:center;gap:14px;}
.k-cart-info{flex:1;}
.k-cart-count{font-size:13px;color:#a8a8b0;}
.k-cart-total{font-size:28px;font-weight:800;color:#e85d3a;}
.k-cart-btn{padding:18px 36px;border:none;border-radius:18px;background:#e85d3a;color:#fff;font-size:20px;font-weight:800;}
.k-cart-btn:disabled{opacity:.4;background:#3a3a40;color:#a8a8b0;}
.k-cart-btn:active:not(:disabled){background:#d4512f;}

/* Cart screen */
.k-cart{flex:1;display:flex;flex-direction:column;overflow:hidden;padding:22px;gap:14px;}
.k-cart-title{font-size:32px;font-weight:800;}
.k-items{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;-webkit-overflow-scrolling:touch;}
.k-item{display:flex;align-items:center;gap:14px;padding:18px;background:#1a1a1f;border-radius:16px;border:1px solid #2a2a30;}
.k-item-info{flex:1;}
.k-item-name{font-size:18px;font-weight:700;}
.k-item-opts{font-size:13px;color:#ff9966;font-style:italic;margin-top:3px;line-height:1.35;}
.k-item-price{font-size:14px;color:#a8a8b0;margin-top:3px;}
.k-qty{display:flex;align-items:center;gap:12px;}
.k-qty-btn{width:44px;height:44px;border-radius:50%;border:1.5px solid #3a3a40;background:#0f0f12;color:#fff;font-size:22px;}
.k-qty-btn:active{background:#e85d3a;border-color:#e85d3a;}
.k-qty-val{font-size:20px;font-weight:700;min-width:30px;text-align:center;}
.k-cart-sum{padding:18px;background:#1a1a1f;border-radius:16px;}
.k-cart-row{display:flex;justify-content:space-between;align-items:center;font-size:18px;}
.k-cart-row.total{font-size:28px;font-weight:800;margin-top:8px;padding-top:14px;border-top:1px solid #2a2a30;}
.k-validate{width:100%;padding:24px;border:none;border-radius:18px;background:linear-gradient(135deg,#e85d3a,#ff7043);color:#fff;font-size:24px;font-weight:800;box-shadow:0 8px 24px rgba(232,93,58,.3);}
.k-validate:active{transform:scale(.98);}
.k-validate:disabled{opacity:.5;}

/* Confirmation */
.k-confirm{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;}
.k-confirm-icon{font-size:140px;margin-bottom:24px;animation:pop .6s ease-out;}
@keyframes pop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
.k-confirm-title{font-size:48px;font-weight:900;margin-bottom:18px;}
.k-confirm-num{font-size:120px;font-weight:900;color:#e85d3a;letter-spacing:-4px;margin:18px 0;font-variant-numeric:tabular-nums;}
.k-confirm-msg{font-size:24px;color:#a8a8b0;max-width:600px;line-height:1.4;margin-bottom:20px;}
.k-confirm-counter{font-size:16px;color:#6a6a72;}

.k-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#6a6a72;font-size:20px;gap:12px;}
.k-empty-icon{font-size:80px;}
.k-error{padding:14px;background:rgba(220,38,38,.15);border:1px solid #dc2626;border-radius:12px;color:#fca5a5;font-size:15px;margin-bottom:12px;}
`;

export default function KioskApp() {
  const [step, setStep] = useState("welcome");
  const [mode, setMode] = useState(null);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const [cart, setCart] = useState([]);
  const [orderNum, setOrderNum] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [optionsForProduct, setOptionsForProduct] = useState(null);
  const { products, loading } = useProducts();
  const { createOrder } = useOrders();
  const idleRef = useRef(null);
  const confirmRef = useRef(null);

  const resetIdle = () => {
    if (idleRef.current) clearTimeout(idleRef.current);
    if (step !== "welcome" && step !== "confirm") {
      idleRef.current = setTimeout(() => reset(), IDLE_MS);
    }
  };

  useEffect(() => {
    resetIdle();
    return () => idleRef.current && clearTimeout(idleRef.current);
  }, [step, cart]);

  function reset() {
    setStep("welcome");
    setMode(null);
    setCart([]);
    setActiveCat(CATEGORIES[0].id);
    setOrderNum(null);
    setErr("");
    setOptionsForProduct(null);
  }

  function addToCart(p) {
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
    setCart(prev => {
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
    setCart(prev => prev.flatMap(i => {
      if (i._key !== key) return [i];
      const q = i.qty + delta;
      return q <= 0 ? [] : [{ ...i, qty: q }];
    }));
  }

  const cartCalc = useMemo(
    () => computeOrder(cart, mode || "emporter"),
    [cart, mode]
  );
  const total = cartCalc.totalTTC;
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  async function submit() {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    setErr("");
    try {
      const { orderNum: num } = await createOrder({
        items: cartCalc.items,
        mode,
        source: "kiosk",
        paid: false,
        total:        cartCalc.totalTTC,
        totalHT:      cartCalc.totalHT,
        totalVAT:     cartCalc.totalVAT,
        totalTTC:     cartCalc.totalTTC,
        vatBreakdown: cartCalc.vatBreakdown,
      });
      setOrderNum(num);
      setStep("confirm");
      if (confirmRef.current) clearTimeout(confirmRef.current);
      confirmRef.current = setTimeout(() => reset(), CONFIRM_MS);
    } catch (e) {
      setErr("Erreur lors de l'envoi. Réessaie ou présente-toi à la caisse.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredProducts = products
    .filter(p => p.category === activeCat && p.available !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <>
      <style>{STYLES}</style>
      <div className="k-root" onTouchStart={resetIdle} onClick={resetIdle}>
        {step === "welcome" && (
          <div className="k-welcome">
            <div className="k-w-logo">🍣</div>
            <h1 className="k-w-title">Bienvenue chez <span>Poké Tea</span></h1>
            <p className="k-w-sub">Touchez pour commander</p>
            <button className="k-w-btn" onClick={() => setStep("mode")}>Commander</button>
          </div>
        )}

        {step === "mode" && (
          <>
            <div className="k-header">
              <div className="k-logo">
                <div className="k-logo-icon">🍣</div>
                <div className="k-logo-text">Poké Tea</div>
              </div>
              <button className="k-back" onClick={() => setStep("welcome")}>← Annuler</button>
            </div>
            <div className="k-modes">
              {MODES.map(m => (
                <button key={m.id} className="k-mode" onClick={() => { setMode(m.id); setStep("menu"); }}>
                  <div className="k-mode-icon">{m.icon}</div>
                  <div className="k-mode-label">{m.label}</div>
                  <div className="k-mode-sub">{m.sub}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "menu" && (
          <>
            <div className="k-header">
              <div className="k-logo">
                <div className="k-logo-icon">🍣</div>
                <div className="k-logo-text">{mode === "surplace" ? "Sur place" : "À emporter"}</div>
              </div>
              <button className="k-back" onClick={() => setStep("mode")}>← Retour</button>
            </div>
            <div className="k-menu">
              <div className="k-cats">
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`k-cat ${activeCat === c.id ? "active" : ""}`} onClick={() => setActiveCat(c.id)}>
                    <span className="k-cat-emoji">{c.emoji}</span>
                    {c.name}
                  </button>
                ))}
              </div>
              {loading ? (
                <div className="k-empty"><div className="k-empty-icon">⏳</div>Chargement du menu...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="k-empty"><div className="k-empty-icon">🤷</div>Aucun produit dans cette catégorie</div>
              ) : (
                <div className="k-products">
                  {filteredProducts.map(p => (
                    <button key={p.id} className="k-prod" onClick={() => addToCart(p)}>
                      <div className="k-prod-name">{p.name}</div>
                      {p.description && <div className="k-prod-desc">{p.description}</div>}
                      <div className="k-prod-bot">
                        <div className="k-prod-price">{p.price.toFixed(2)} €</div>
                        <div className="k-prod-add">+</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="k-cart-bar">
                <div className="k-cart-info">
                  <div className="k-cart-count">{itemCount} article{itemCount > 1 ? "s" : ""}</div>
                  <div className="k-cart-total">{total.toFixed(2)} €</div>
                </div>
                <button className="k-cart-btn" disabled={cart.length === 0} onClick={() => setStep("cart")}>
                  Voir mon panier →
                </button>
              </div>
            </div>
          </>
        )}

        {step === "cart" && (
          <>
            <div className="k-header">
              <div className="k-logo">
                <div className="k-logo-icon">🛒</div>
                <div className="k-logo-text">Mon panier</div>
              </div>
              <button className="k-back" onClick={() => setStep("menu")}>← Menu</button>
            </div>
            <div className="k-cart">
              <div className="k-cart-title">Récapitulatif</div>
              {err && <div className="k-error">{err}</div>}
              <div className="k-items">
                {cart.map(i => (
                  <div key={i._key} className="k-item">
                    <div className="k-item-info">
                      <div className="k-item-name">{i.name}</div>
                      {i.selectedOptions && i.selectedOptions.length > 0 && (
                        <div className="k-item-opts">{formatSelectedOptions(i.selectedOptions)}</div>
                      )}
                      <div className="k-item-price">{i.unitPriceTTC.toFixed(2)} € × {i.qty} = {(i.unitPriceTTC * i.qty).toFixed(2)} €</div>
                    </div>
                    <div className="k-qty">
                      <button className="k-qty-btn" onClick={() => changeQty(i._key, -1)}>−</button>
                      <div className="k-qty-val">{i.qty}</div>
                      <button className="k-qty-btn" onClick={() => changeQty(i._key, +1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="k-cart-sum">
                <div className="k-cart-row"><span>{itemCount} article{itemCount > 1 ? "s" : ""}</span><span>{total.toFixed(2)} €</span></div>
                <div className="k-cart-row total"><span>Total</span><span>{total.toFixed(2)} €</span></div>
              </div>
              <button className="k-validate" disabled={submitting || cart.length === 0} onClick={submit}>
                {submitting ? "Envoi..." : "Valider ma commande"}
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <div className="k-confirm">
            <div className="k-confirm-icon">✅</div>
            <div className="k-confirm-title">Commande envoyée !</div>
            <div className="k-confirm-num">{orderNum}</div>
            <div className="k-confirm-msg">Présentez-vous à la caisse pour régler et récupérer votre commande.</div>
            <div className="k-confirm-counter">Cet écran se réinitialise dans quelques secondes...</div>
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
