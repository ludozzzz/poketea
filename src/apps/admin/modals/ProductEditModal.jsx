import { useState, useEffect } from "react";
import { CATEGORIES } from "../../../shared/data/categories";
import { VAT_CATEGORIES, defaultVatForProductCategory } from "../../../shared/data/vat";

function uid() {
  return (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function emptyChoice() {
  return { id: uid(), name: "", priceModifier: 0, isDefault: false };
}

function emptyOption() {
  return {
    id: uid(),
    name: "",
    required: false,
    multiSelect: false,
    choices: [emptyChoice()],
  };
}

export default function ProductEditModal({ product, onClose, onSave }) {
  const isNew = !product;
  const [form, setForm] = useState(() => ({
    name:        product?.name ?? "",
    category:    product?.category ?? CATEGORIES[0].id,
    price:       Number(product?.basePrice ?? product?.price ?? 0),
    description: product?.description ?? "",
    vatCategory: product?.vatCategory ?? defaultVatForProductCategory(product?.category),
    popular:     !!product?.popular,
    available:   product?.available !== false,
    order:       Number(product?.order ?? 0),
    options:     Array.isArray(product?.options) ? product.options.map(o => ({
      id: o.id || uid(),
      name: o.name || "",
      required: !!o.required,
      multiSelect: !!o.multiSelect,
      choices: (o.choices || []).map(c => ({
        id: c.id || uid(),
        name: c.name || "",
        priceModifier: Number(c.priceModifier || 0),
        isDefault: !!c.isDefault,
      })),
    })) : [],
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Si la catégorie change et qu'on est en création, suggère la vatCategory adéquate
  useEffect(() => {
    if (isNew) {
      setForm(f => ({ ...f, vatCategory: defaultVatForProductCategory(f.category) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category]);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function addOptionGroup() {
    setForm(f => ({ ...f, options: [...f.options, emptyOption()] }));
  }
  function removeOptionGroup(optId) {
    setForm(f => ({ ...f, options: f.options.filter(o => o.id !== optId) }));
  }
  function updateOption(optId, patch) {
    setForm(f => ({ ...f, options: f.options.map(o => o.id === optId ? { ...o, ...patch } : o) }));
  }
  function addChoice(optId) {
    setForm(f => ({
      ...f,
      options: f.options.map(o => o.id === optId
        ? { ...o, choices: [...o.choices, emptyChoice()] }
        : o)
    }));
  }
  function removeChoice(optId, choiceId) {
    setForm(f => ({
      ...f,
      options: f.options.map(o => o.id === optId
        ? { ...o, choices: o.choices.filter(c => c.id !== choiceId) }
        : o)
    }));
  }
  function updateChoice(optId, choiceId, patch) {
    setForm(f => ({
      ...f,
      options: f.options.map(o => o.id === optId
        ? { ...o, choices: o.choices.map(c => c.id === choiceId ? { ...c, ...patch } : c) }
        : o)
    }));
  }

  async function handleSubmit() {
    setErr("");
    if (!form.name.trim()) { setErr("Le nom est obligatoire."); return; }
    if (form.price < 0 || isNaN(form.price)) { setErr("Le prix doit être un nombre positif."); return; }
    // Validate options
    for (const o of form.options) {
      if (!o.name.trim()) { setErr(`Un groupe d'options n'a pas de nom.`); return; }
      if (o.choices.length === 0) { setErr(`Le groupe "${o.name}" doit avoir au moins un choix.`); return; }
      for (const c of o.choices) {
        if (!c.name.trim()) { setErr(`Un choix du groupe "${o.name}" n'a pas de nom.`); return; }
      }
    }

    setSaving(true);
    try {
      const data = {
        name:        form.name.trim(),
        category:    form.category,
        price:       Number(form.price),         // prix TTC de référence (rétrocompat — utilisé par client/borne/POS)
        basePrice:   Number(form.price),         // alias explicite
        description: form.description.trim(),
        vatCategory: form.vatCategory,
        popular:     form.popular,
        available:   form.available,
        order:       Number(form.order) || 0,
        options:     form.options.map(o => ({
          id: o.id,
          name: o.name.trim(),
          required: o.required,
          multiSelect: o.multiSelect,
          choices: o.choices.map(c => ({
            id: c.id,
            name: c.name.trim(),
            priceModifier: Number(c.priceModifier) || 0,
            isDefault: !!c.isDefault,
          })),
        })),
      };
      await onSave(data, product?.id || null);
    } catch (e) {
      setErr(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="a-ov" onClick={onClose}>
      <div className="a-md" onClick={e => e.stopPropagation()}>
        <div className="a-md-head">
          <div className="a-md-title">{isNew ? "Nouvel article" : `Modifier — ${product.name}`}</div>
          <button className="a-md-close" onClick={onClose}>×</button>
        </div>

        <div className="a-md-body">
          {err && <div className="a-md-err">{err}</div>}

          <div className="a-form-grid">
            <div className="a-fg span2">
              <label>Nom du produit</label>
              <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="ex: Poké Saumon Teriyaki" />
            </div>

            <div className="a-fg">
              <label>Catégorie</label>
              <select value={form.category} onChange={e => update("category", e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>

            <div className="a-fg">
              <label>Prix TTC de référence (€)</label>
              <input
                type="number" step="0.01" min="0"
                value={form.price}
                onChange={e => update("price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              />
            </div>

            <div className="a-fg span2">
              <label>Description</label>
              <textarea
                rows="2"
                value={form.description}
                onChange={e => update("description", e.target.value)}
                placeholder="Description optionnelle affichée au client"
              />
            </div>

            <div className="a-fg span2">
              <label>Catégorie TVA</label>
              <select value={form.vatCategory} onChange={e => update("vatCategory", e.target.value)}>
                {VAT_CATEGORIES.map(v => (
                  <option key={v.id} value={v.id}>{v.emoji} {v.label} — {v.description}</option>
                ))}
              </select>
            </div>

            <div className="a-fg">
              <label>Ordre d'affichage</label>
              <input
                type="number" step="1" min="0"
                value={form.order}
                onChange={e => update("order", e.target.value === "" ? 0 : parseInt(e.target.value))}
              />
            </div>

            <div className="a-fg" style={{ justifyContent: "flex-end" }}>
              <label className="a-checkbox">
                <input type="checkbox" checked={form.popular} onChange={e => update("popular", e.target.checked)} />
                ⭐ Marquer comme populaire
              </label>
              <label className="a-checkbox">
                <input type="checkbox" checked={form.available} onChange={e => update("available", e.target.checked)} />
                ✅ Disponible à la vente
              </label>
            </div>
          </div>

          {/* OPTIONS */}
          <div className="a-section">
            <div className="a-section-head">
              <div>
                <div className="a-section-title">Options & suppléments</div>
                <div style={{ fontSize: 12, color: "#6b6b73", marginTop: 2 }}>
                  Ex : Taille (Regular/Large), Cuisson (Saignant/À point), Suppléments (Tapioca +0,80 €)
                </div>
              </div>
              <button type="button" className="a-btn-secondary" onClick={addOptionGroup}>+ Groupe d'options</button>
            </div>

            {form.options.length === 0 ? (
              <div style={{ fontSize: 13, color: "#a8a8b0", padding: 12, background: "#fafaf7", borderRadius: 10, textAlign: "center" }}>
                Aucune option. Le produit s'ajoutera directement au panier sans modal de choix.
              </div>
            ) : (
              form.options.map(opt => (
                <div key={opt.id} className="a-option-group">
                  <div className="a-option-group-head">
                    <input
                      type="text"
                      placeholder="Nom du groupe (ex: Taille)"
                      value={opt.name}
                      onChange={e => updateOption(opt.id, { name: e.target.value })}
                    />
                    <button type="button" className="a-icon-btn" onClick={() => removeOptionGroup(opt.id)} title="Supprimer le groupe">🗑</button>
                  </div>
                  <div className="a-option-group-flags">
                    <label className="a-checkbox">
                      <input
                        type="checkbox"
                        checked={opt.required}
                        onChange={e => updateOption(opt.id, { required: e.target.checked })}
                      />
                      Obligatoire
                    </label>
                    <label className="a-checkbox">
                      <input
                        type="checkbox"
                        checked={opt.multiSelect}
                        onChange={e => updateOption(opt.id, { multiSelect: e.target.checked })}
                      />
                      Choix multiples (cases à cocher)
                    </label>
                  </div>
                  <div className="a-choices">
                    {opt.choices.map(ch => (
                      <div key={ch.id} className="a-choice">
                        <input
                          type="text"
                          placeholder="Nom du choix"
                          value={ch.name}
                          onChange={e => updateChoice(opt.id, ch.id, { name: e.target.value })}
                        />
                        <input
                          type="number" step="0.10"
                          placeholder="0.00"
                          value={ch.priceModifier}
                          onChange={e => updateChoice(opt.id, ch.id, { priceModifier: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
                        />
                        <span className="a-choice-suffix">€</span>
                        <label className="a-checkbox" style={{ marginLeft: 4 }}>
                          <input
                            type="checkbox"
                            checked={ch.isDefault}
                            onChange={e => updateChoice(opt.id, ch.id, { isDefault: e.target.checked })}
                          />
                          défaut
                        </label>
                        <button type="button" className="a-icon-btn" onClick={() => removeChoice(opt.id, ch.id)}>🗑</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="a-add-btn" style={{ marginTop: 8 }} onClick={() => addChoice(opt.id)}>
                    + Ajouter un choix
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="a-md-foot">
          <button className="a-btn-secondary" onClick={onClose} disabled={saving}>Annuler</button>
          <button className="a-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Enregistrement..." : (isNew ? "Créer l'article" : "Enregistrer les modifications")}
          </button>
        </div>
      </div>
    </div>
  );
}
