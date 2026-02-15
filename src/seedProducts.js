// Run with: node src/seedProducts.js
// This script populates your Firestore with the Poké Tea menu

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2ANn4pvAK1HG7Y8Xe_QulSKniUj0ZdlM",
  authDomain: "poke-tea.firebaseapp.com",
  projectId: "poke-tea",
  storageBucket: "poke-tea.firebasestorage.app",
  messagingSenderId: "865008850372",
  appId: "1:865008850372:web:758c71821fdaea18ff0091",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PRODUCTS = [
  { name: "Nêms au poulet 4pcs", price: 6, category: "entrees", popular: false, description: "Nêms croustillants au poulet" },
  { name: "Boite de Poulet Karaage 9pcs", price: 8.8, category: "entrees", popular: true, description: "Boite de Karaage environ 9 pièces" },
  { name: "Nêms aux légumes 4pcs", price: 6, category: "entrees", popular: false, description: "Nêms aux légumes" },
  { name: "Gyoza au poulet 5pcs", price: 6, category: "entrees", popular: false, description: "Gyozas grillés au poulet" },
  { name: "Tempura crevettes 4pcs", price: 8.8, category: "entrees", popular: false, description: "Crevettes tempura croustillantes" },
  { name: "Edamamé", price: 4.2, category: "entrees", popular: false, description: "Fèves de soja entières en gousses" },
  { name: "Salade d'algues", price: 4.2, category: "entrees", popular: false, description: "Lamelles d'algues en salade" },
  { name: "Soupe miso", price: 3.5, category: "entrees", popular: false, description: "Bouillon miso, tofu, algues wakame" },
  { name: "Beignet de boeuf au fromage 2pcs", price: 5, category: "entrees", popular: false, description: "Beignets de boeuf garnis au fromage" },
  { name: "Poulet Karaage", price: 12.9, category: "poke-signature", popular: true, description: "Riz blanc, poulet karaage, chou rouge, betterave, carotte, edamame, oeuf, oignons frits, sauce mayo épicée" },
  { name: "Végétarien", price: 12.9, category: "poke-signature", popular: false, description: "Riz vinaigré, falafel, chou rouge, edamame, carotte, concombre, radis, sauce curry mangue" },
  { name: "Saumon Teriyaki", price: 12.9, category: "poke-signature", popular: true, description: "Riz vinaigré, saumon grillé, carotte, radis rouge, edamame, avocat, sauce teriyaki" },
  { name: "Tuna Bowl", price: 12.9, category: "poke-signature", popular: false, description: "Riz vinaigré, thon cuit mayo, avocat, mais, tomates cerises, cream cheese, sauce poké" },
  { name: "Tartare Saumon Avocat", price: 12.9, category: "poke-signature", popular: true, description: "Riz vinaigré, saumon, avocat, gingembre, wasabi, sésame torréfié" },
  { name: "Crée Ton PokéBowl", price: 12.9, category: "cree-ton-poke", popular: true, description: "1 Base, 5 ingrédients, 1 protéine, 1 topping et 1 sauce au choix" },
  { name: "Crée Ton MasterBowl", price: 15.9, category: "cree-ton-poke", popular: false, description: "1 Base, 5 ingrédients, 2 protéines, 2 toppings et 1 sauce au choix" },
  { name: "Riz sauté au choix", price: 9.9, category: "plats-chauds", popular: false, description: "Riz sauté avec accompagnement au choix" },
  { name: "Nouilles sautées au choix", price: 9.9, category: "plats-chauds", popular: false, description: "Nouilles sautées avec accompagnement au choix" },
  { name: "Sushi Saumon 2pcs", price: 4.8, category: "sushi-bar", popular: false, description: "2 pièces de sushi au saumon frais" },
  { name: "Maki classique 8pcs", price: 5, category: "sushi-bar", popular: false, description: "8 makis classiques au saumon" },
  { name: "California 8pcs", price: 5.8, category: "sushi-bar", popular: false, description: "8 california rolls" },
  { name: "Crousti oignon frit 8pcs", price: 6, category: "sushi-bar", popular: false, description: "8 pièces croustillantes oignon frit" },
  { name: "California Eby Fly 8pcs", price: 6.8, category: "sushi-bar", popular: true, description: "8 california tempura crevette" },
  { name: "California Las Vegas 8pcs", price: 6.8, category: "sushi-bar", popular: false, description: "8 california Las Vegas" },
  { name: "Plateau de 8 sushis", price: 14.8, category: "sushi-bar", popular: false, description: "Assortiment de 8 sushis variés" },
  { name: "Plateau 24 makis", price: 14.8, category: "sushi-bar", popular: false, description: "16 maki saumon, 8 California saumon avocat" },
  { name: "Plateau Calis Las Vegas 16pcs", price: 12.5, category: "sushi-bar", popular: true, description: "8 california saumon avocat et 8 Las Vegas" },
  { name: "Crée ton Fruithé", price: 5.8, category: "fruithe", popular: true, description: "Crée ton bubble tea! Thé, gout, topping, sucre et taille au choix" },
  { name: "Thé noir au lait", price: 5.5, category: "the-au-lait", popular: false, description: "Thé noir au lait classique" },
  { name: "Thé noir au lait crème brulée", price: 6.5, category: "the-au-lait", popular: false, description: "Crème brulée" },
  { name: "Thé noir au lait panna cotta", price: 6.8, category: "the-au-lait", popular: false, description: "Panna cotta" },
  { name: "Matcha au lait crème brulée", price: 6.8, category: "the-au-lait", popular: false, description: "Matcha crème brulée haricots rouges" },
  { name: "Lait de coco nappage matcha", price: 6.5, category: "the-au-lait", popular: false, description: "Coco matcha" },
  { name: "Matcha au lait panna cotta", price: 7, category: "the-au-lait", popular: false, description: "Matcha panna cotta" },
  { name: "Matcha au lait fraise", price: 6.5, category: "the-au-lait", popular: false, description: "Matcha fraise" },
  { name: "Latte fraise panna cotta", price: 7.5, category: "the-au-lait", popular: false, description: "Fraise panna cotta" },
  { name: "Latte fraise Oreo crème brulée", price: 7, category: "the-au-lait", popular: false, description: "Fraise Oreo crème brulée" },
  { name: "Latte au sucre roux tapioca", price: 6, category: "the-au-lait", popular: true, description: "Latte au sucre roux avec perles de tapioca" },
  { name: "Thé noir", price: 4.5, category: "the-nature", popular: false, description: "Thé noir nature" },
  { name: "Thé vert au jasmin", price: 4.5, category: "the-nature", popular: false, description: "Thé vert parfumé au jasmin" },
  { name: "Thé genmaicha", price: 4.8, category: "the-nature", popular: false, description: "Thé de riz brun" },
  { name: "Expresso", price: 2, category: "cafes", popular: false, description: "Expresso classique" },
  { name: "Café latte", price: 3.8, category: "cafes", popular: false, description: "Café latte" },
  { name: "Café latte au sucre brun", price: 5, category: "cafes", popular: false, description: "Sucre brun" },
  { name: "Caramel Macchiato", price: 5, category: "cafes", popular: false, description: "Caramel Macchiato" },
  { name: "Cappuccino", price: 4.2, category: "cafes", popular: false, description: "Cappuccino" },
  { name: "Café Mocha", price: 5, category: "cafes", popular: false, description: "Café Mocha" },
  { name: "Coca 33cl", price: 2.8, category: "softs", popular: false, description: "" },
  { name: "Coca zéro 33cl", price: 2.8, category: "softs", popular: false, description: "" },
  { name: "Fuzetea 33cl", price: 2.8, category: "softs", popular: false, description: "" },
  { name: "Ice tea pêche 33cl", price: 2.8, category: "softs", popular: false, description: "" },
  { name: "Oasis 33cl", price: 2.8, category: "softs", popular: false, description: "" },
  { name: "Evian 50cl", price: 2.8, category: "softs", popular: false, description: "" },
  { name: "San Pellegrino 50cl", price: 2.8, category: "softs", popular: false, description: "" },
  { name: "Limonade japonaise 20cl", price: 4.8, category: "softs", popular: false, description: "Ramune" },
  { name: "Asahi 33cl", price: 4.8, category: "bieres", popular: false, description: "Bière japonaise Asahi" },
  { name: "Mochi crème (Fruit) 1pc", price: 3.5, category: "desserts", popular: false, description: "Mochi crème au fruit" },
  { name: "Gyoza aux pommes 5pcs", price: 6, category: "desserts", popular: true, description: "Gyoza sucrés aux pommes" },
  { name: "Nêms nutella banane 2pcs", price: 4.8, category: "desserts", popular: true, description: "Nêms sucrés au nutella et banane" },
  { name: "Mochi glacé 2 pièces", price: 5.5, category: "desserts", popular: false, description: "3 euros la pièce à partir de la 2ème" },
  { name: "Dorayaki", price: 3.5, category: "desserts", popular: false, description: "Pancakes japonais" },
  { name: "Perle de coco", price: 4.5, category: "desserts", popular: false, description: "A réchauffer" },
];

async function seed() {
  console.log("🍣 Seeding Poké Tea products...");

  // Clear existing products
  const existing = await getDocs(collection(db, "products"));
  console.log(`Deleting ${existing.size} existing products...`);
  for (const d of existing.docs) {
    await deleteDoc(d.ref);
  }

  // Add all products
  const col = collection(db, "products");
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    await addDoc(col, {
      ...p,
      available: true,
      image: "",
      optionGroups: [],
      order: i + 1,
    });
    console.log(`  ✅ ${p.name}`);
  }

  console.log(`\n🎉 Done! ${PRODUCTS.length} products added to Firestore.`);
  process.exit(0);
}

seed().catch(e => { console.error("Error:", e); process.exit(1); });
