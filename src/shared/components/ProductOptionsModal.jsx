import { useState, useMemo } from "react";
import { computeUnitPriceTTC } from "../lib/vat";

const STYLES = `
.pom-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:pom-fi .18s;}
@keyframes pom-fi{from{opacity:0}to{opacity:1}}
.pom{background:#fff;color:#1a1a1a;border-radius:18px;width:min(540px,96vw);max-height:92vh;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,.25);display:flex;flex-direction:column;animation:pom-si .25s cubic-bezier(.34,1.56,.64,1);}
@keyframes pom-si{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
.pom-head{padding:20px 22px;border-bottom:1px solid #e5e5ea;}
.pom-title{font-size:19px;font-weight:800;line-height:1.25;}
.pom-desc{font-size:13px;color:#6b6b73;margin-top:3px;}
.pom-body{padding:18px 22px;overflow-y:auto;flex:1;}
.pom-group{margin-bottom:18px;}
.pom-group-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.pom-group-name{font-size:14px;font-weight:700;}
.pom-group-req{font-size:10.5px;padding:2px 8px;border-radius:8px;background:#fef3c7;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:.4px;}
.pom-group-opt{font-size:10.5px;color:#a8a8b0;}
.pom-choices{display:flex;flex-direction:column;gap:6px;}
.pom-choice{display:flex;align-items:center;gap:10px;padding:11px 14px;border:1.5px solid #e5e5ea;background:#fff;border-radius:12px;cursor:pointer;font-size:14px;transition:all .12s;}
.pom-choice:hover{border-color:#a8a8b0;}
.pom-choice.selected{border-color:#e85d3a;background:#fef5f2;}
.pom-choice input{width:18px;height:18px;cursor:pointer;accent-color:#e85d3a;}
.pom-choice-name{flex:1;}
.pom-choice-mod{font-size:13px;color:#6b6b73;font-weight:600;}
.pom-choice-mod.zero{color:#16a34a;}
.pom-foot{padding:14px 22px;border-top:1px solid #e5e5ea;display:flex;align-items:center;gap:14px;background:#fafaf7;}
.pom-qty{display:flex;align-items:center;gap:10px;}
.pom-qty-btn{width:36px;height:36px;border:1.5px solid #e5e5ea;background:#fff;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.pom-qty-btn:hover{border-color:#e85d3a;color:#e85d3a;}
.pom-qty-val{font-size:18px;font-weight:700;min-width:24px;text-align:center;}
.pom-add{flex:1;padding:13px;border:none;border-radius:12px;background:#e85d3a;color:#fff;font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;}
.pom-add:hover{background:#d4512f;}
.pom-add:disabled{background:#e5e5ea;color:#a8a8b0;cursor:not-allowed;}
.pom-cancel{background:none;border:none;color:#a8a8b0;font-size:22px;cursor:pointer;padding:4px 8px;line-height:1;}
.pom-cancel:hover{color:#1a1a1a;}
.pom-head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.pom-warn{padding:8px 12px;background:#fef3c7;color:#92400e;border-radius:8px;font-size:12px;margin-bottom:12px;}
`;

function buildInitialSelection(options) {
  const initial = {};
  for (const opt of options || []) {
    if (opt.multiSelect) {
      initial[opt.id] = (opt.choices || [])
        .filter(c => c.isDefault)
        .map(c => c.id);
    } else {
      const def = (opt.choices || []).find(c => c.isDefault);
      initial[opt.id] = def ? def.id : null;
    }
  }
  return initial;
}

export default function ProductOptionsModal({ product, onClose, onAdd }) {
  const options = product?.options || [];
  const [selection, setSelection] = useState(() => buildInitialSelection(options));
  const [qty, setQty] = useState(1);
  const [warn, setWarn] = useState("");

  function toggleChoice(opt, choice) {
    setSelection(prev => {
      if (opt.multiSelect) {
        const cur = prev[opt.id] || [];
        const has = cur.includes(choice.id);
        return { ...prev, [opt.id]: has ? cur.filter(id => id !== choice.id) : [...cur, choice.id] };
      }
      // single
      return { ...prev, [opt.id]: choice.id };
    });
  }

  function isSelected(opt, choice) {
    const cur = selection[opt.id];
    return opt.multiSelect ? Array.isArray(cur) && cur.includes(choice.id) : cur === choice.id;
  }

  const flatSelected = useMemo(() => {
    const flat = [];
    for (const opt of options) {
      const cur = selection[opt.id];
      if (opt.multiSelect) {
        for (const id of (cur || [])) {
          const ch = opt.choices.find(c => c.id === id);
          if (ch) flat.push({ optionId: opt.id, optionName: opt.name, choiceId: ch.id, choiceName: ch.name, priceModifier: ch.priceModifier });
        }
      } else if (cur) {
        const ch = opt.choices.find(c => c.id === cur);
        if (ch) flat.push({ optionId: opt.id, optionName: opt.name, choiceId: ch.id, choiceName: ch.name, priceModifier: ch.priceModifier });
      }
    }
    return flat;
  }, [selection, options]);

  const unitPrice = computeUnitPriceTTC(product?.price ?? 0, flatSelected);
  const totalPrice = unitPrice * qty;

  function validate() {
    for (const opt of options) {
      if (opt.required) {
        const cur = selection[opt.id];
        const has = opt.multiSelect ? (Array.isArray(cur) && cur.length > 0) : !!cur;
        if (!has) {
          setWarn(`Choisis une option pour "${opt.name}".`);
          return false;
        }
      }
    }
    setWarn("");
    return true;
  }

  function handleAdd() {
    if (!validate()) return;
    onAdd(flatSelected, qty);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="pom-ov" onClick={onClose}>
        <div className="pom" onClick={e => e.stopPropagation()}>
          <div className="pom-head">
            <div className="pom-head-row">
              <div>
                <div className="pom-title">{product?.name}</div>
                {product?.description && <div className="pom-desc">{product.description}</div>}
              </div>
              <button className="pom-cancel" onClick={onClose}>×</button>
            </div>
          </div>

          <div className="pom-body">
            {warn && <div className="pom-warn">⚠️ {warn}</div>}
            {options.map(opt => (
              <div key={opt.id} className="pom-group">
                <div className="pom-group-head">
                  <div className="pom-group-name">{opt.name}</div>
                  {opt.required
                    ? <span className="pom-group-req">Obligatoire</span>
                    : <span className="pom-group-opt">Facultatif{opt.multiSelect ? " — plusieurs choix possibles" : ""}</span>}
                </div>
                <div className="pom-choices">
                  {opt.choices.map(ch => {
                    const sel = isSelected(opt, ch);
                    const mod = Number(ch.priceModifier || 0);
                    return (
                      <label key={ch.id} className={`pom-choice ${sel ? "selected" : ""}`}>
                        <input
                          type={opt.multiSelect ? "checkbox" : "radio"}
                          name={opt.id}
                          checked={sel}
                          onChange={() => toggleChoice(opt, ch)}
                        />
                        <span className="pom-choice-name">{ch.name}</span>
                        <span className={`pom-choice-mod ${mod === 0 ? "zero" : ""}`}>
                          {mod === 0 ? "Gratuit" : (mod > 0 ? `+${mod.toFixed(2)} €` : `${mod.toFixed(2)} €`)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pom-foot">
            <div className="pom-qty">
              <button className="pom-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <div className="pom-qty-val">{qty}</div>
              <button className="pom-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button className="pom-add" onClick={handleAdd}>
              Ajouter — {totalPrice.toFixed(2)} €
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
