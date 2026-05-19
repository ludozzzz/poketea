import { useState, useMemo } from "react";
import { useProducts } from "../../../shared/hooks/useProducts";
import { CATEGORIES } from "../../../shared/data/categories";
import { VAT_CATEGORIES, defaultVatForProductCategory } from "../../../shared/data/vat";
import ProductEditModal from "../modals/ProductEditModal";

export default function ProductsTab() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | productObject

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products
      .filter(p => (catFilter ? p.category === catFilter : true))
      .filter(p => (s ? (p.name?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s)) : true))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [products, search, catFilter]);

  function vatBadge(p) {
    const vatCat = p.vatCategory || defaultVatForProductCategory(p.category);
    const meta = VAT_CATEGORIES.find(v => v.id === vatCat);
    return <span className={`a-badge vat-${vatCat}`}>{meta?.emoji} {vatCat === "alcohol" ? "20%" : "5,5% / 10%"}</span>;
  }

  async function handleSave(data, originalId) {
    if (originalId) {
      await updateProduct(originalId, data);
    } else {
      await addProduct(data);
    }
    setEditing(null);
  }

  async function handleDelete(p) {
    if (!confirm(`Supprimer définitivement "${p.name}" ?`)) return;
    await deleteProduct(p.id);
  }

  return (
    <>
      <div className="a-page-head">
        <div>
          <div className="a-page-title">Produits & options</div>
          <div className="a-page-sub">{products.length} article{products.length > 1 ? "s" : ""} au catalogue • prix, TVA, options/suppléments</div>
        </div>
        <button className="a-btn-primary" onClick={() => setEditing("new")}>+ Nouvel article</button>
      </div>

      <div className="a-search-bar">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="a-empty">⏳ Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="a-empty">
          <div className="a-empty-icon">🍱</div>
          {products.length === 0 ? "Aucun produit. Crées-en un avec le bouton + Nouvel article." : "Aucun résultat pour ces filtres."}
        </div>
      ) : (
        <table className="a-tbl">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix TTC</th>
              <th>TVA</th>
              <th>Options</th>
              <th>État</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const cat = CATEGORIES.find(c => c.id === p.category);
              const optionCount = Array.isArray(p.options) ? p.options.length : 0;
              const price = Number(p.basePrice ?? p.price ?? 0);
              return (
                <tr key={p.id}>
                  <td>
                    <div className="a-prod-row-name">{p.name}</div>
                    {p.description && <div className="a-prod-row-desc">{p.description}</div>}
                  </td>
                  <td>{cat ? `${cat.emoji} ${cat.name}` : <span style={{ color: "#a8a8b0" }}>—</span>}</td>
                  <td><strong>{price.toFixed(2)} €</strong></td>
                  <td>{vatBadge(p)}</td>
                  <td>
                    {optionCount > 0
                      ? <span className="a-options-pill">{optionCount} groupe{optionCount > 1 ? "s" : ""}</span>
                      : <span style={{ color: "#a8a8b0", fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    {p.available === false
                      ? <span className="a-badge off">Indisponible</span>
                      : <span className="a-badge vat-food">Actif</span>}
                    {p.popular && <span className="a-badge popular" style={{ marginLeft: 4 }}>⭐ Populaire</span>}
                  </td>
                  <td>
                    <div className="a-row-actions">
                      <button className="a-btn-secondary" onClick={() => setEditing(p)}>Modifier</button>
                      <button className="a-btn-danger" onClick={() => handleDelete(p)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {editing && (
        <ProductEditModal
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
