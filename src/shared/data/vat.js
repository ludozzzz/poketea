// Taux de TVA français applicables à la restauration
export const VAT_RATES = {
  food_dineIn:   0.10,    // Restauration sur place : 10 %
  food_takeaway: 0.055,   // Vente à emporter (non-alcool) : 5,5 %
  alcohol:       0.20,    // Boissons alcoolisées : 20 % toujours
};

export const VAT_CATEGORIES = [
  { id: "food",    label: "Nourriture & boisson sans alcool", emoji: "🍱",
    description: "10 % sur place, 5,5 % à emporter" },
  { id: "alcohol", label: "Alcool",                            emoji: "🍺",
    description: "20 % dans tous les cas" },
];

export const DEFAULT_VAT_CATEGORY = "food";

// Fallback intelligent quand un produit en BDD n'a pas encore de vatCategory
export function defaultVatForProductCategory(productCategoryId) {
  if (productCategoryId === "bieres") return "alcohol";
  return "food";
}
