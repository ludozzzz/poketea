import { useState, useEffect } from "react";
import { db, productsCol, onSnapshot, query, orderBy, doc, updateDoc, addDoc, deleteDoc } from "../firebase";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(productsCol, orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const updateProduct = async (id, data) => {
    await updateDoc(doc(db, "products", id), data);
  };

  const addProduct = async (data) => {
    const order = products.length > 0 ? Math.max(...products.map(p => p.order || 0)) + 1 : 1;
    return await addDoc(productsCol, { ...data, order });
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
  };

  return { products, loading, updateProduct, addProduct, deleteProduct };
}
