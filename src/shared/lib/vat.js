import { VAT_RATES, defaultVatForProductCategory } from "../data/vat";

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Renvoie le taux de TVA applicable (ex: 0.10, 0.055, 0.20)
// vatCategory: "food" | "alcohol"
// mode: "surplace" | "emporter"
export function getVatRate(vatCategory, mode) {
  if (vatCategory === "alcohol") return VAT_RATES.alcohol;
  // food (par défaut)
  return mode === "surplace" ? VAT_RATES.food_dineIn : VAT_RATES.food_takeaway;
}

// Convertit un montant TTC en HT + TVA selon un taux donné
export function fromTTC(ttc, vatRate) {
  const ht = ttc / (1 + vatRate);
  const vat = ttc - ht;
  return { ht: round2(ht), vat: round2(vat), ttc: round2(ttc) };
}

// Calcule HT/TVA/TTC d'une ligne (qty * prix unitaire TTC)
export function computeLine(unitPriceTTC, qty, vatRate) {
  const lineTTC = round2(unitPriceTTC * qty);
  const { ht, vat } = fromTTC(lineTTC, vatRate);
  return { lineHT: ht, lineVAT: vat, lineTTC };
}

// Taux de TVA → clé string utilisée dans vatBreakdown ("5.5", "10", "20")
export function vatRateKey(vatRate) {
  const pct = vatRate * 100;
  // arrondi à 1 décimale, supprime ".0"
  return pct % 1 === 0 ? String(pct) : pct.toFixed(1);
}

// Calcule la ventilation TVA complète pour un ensemble d'items + un mode (sur place / à emporter).
// `items` doit être un tableau d'objets { unitPriceTTC, qty, vatCategory, productCategory? }.
// Renvoie { items: items enrichis, vatBreakdown, totalHT, totalVAT, totalTTC }.
export function computeOrder(items, mode) {
  const breakdown = {};
  let totalHT = 0, totalVAT = 0, totalTTC = 0;

  const enrichedItems = items.map((item) => {
    const vatCategory = item.vatCategory || defaultVatForProductCategory(item.productCategory);
    const vatRate = getVatRate(vatCategory, mode);
    const { lineHT, lineVAT, lineTTC } = computeLine(item.unitPriceTTC, item.qty, vatRate);

    totalHT  += lineHT;
    totalVAT += lineVAT;
    totalTTC += lineTTC;

    const key = vatRateKey(vatRate);
    if (!breakdown[key]) breakdown[key] = { rate: vatRate, ht: 0, vat: 0, ttc: 0, count: 0 };
    breakdown[key].ht    = round2(breakdown[key].ht  + lineHT);
    breakdown[key].vat   = round2(breakdown[key].vat + lineVAT);
    breakdown[key].ttc   = round2(breakdown[key].ttc + lineTTC);
    breakdown[key].count += item.qty;

    return { ...item, vatCategory, vatRate, lineHT, lineVAT, lineTTC };
  });

  return {
    items: enrichedItems,
    vatBreakdown: breakdown,
    totalHT:  round2(totalHT),
    totalVAT: round2(totalVAT),
    totalTTC: round2(totalTTC),
  };
}

// Calcule le prix unitaire TTC d'un produit en tenant compte des options sélectionnées.
// selectedOptions: tableau d'objets avec un champ priceModifier (peut être 0 pour les options gratuites).
export function computeUnitPriceTTC(basePrice, selectedOptions = []) {
  const modifier = selectedOptions.reduce((sum, o) => sum + (Number(o.priceModifier) || 0), 0);
  return round2((Number(basePrice) || 0) + modifier);
}
