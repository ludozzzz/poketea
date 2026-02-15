import { useState, useEffect, useRef } from "react";
import { db, ordersCol, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from "../firebase";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevCountRef = useRef(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const q = query(ordersCol, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list);
      setLoading(false);

      // Notification son pour nouvelles commandes (pas au premier chargement)
      if (!isFirstLoad.current && list.length > prevCountRef.current) {
        playNotificationSound();
        if (Notification.permission === "granted") {
          new Notification("🍣 Nouvelle commande !", {
            body: "Une nouvelle commande vient d'arriver",
            icon: "🍣",
          });
        }
      }
      prevCountRef.current = list.length;
      isFirstLoad.current = false;
    }, () => setLoading(false));
    return unsub;
  }, []);

  const createOrder = async (orderData) => {
    const orderNum = "PT-" + String(Date.now()).slice(-6);
    const newOrder = {
      ...orderData,
      orderNum,
      status: "nouvelle",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(ordersCol, newOrder);
    return { id: ref.id, orderNum };
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), {
      status,
      updatedAt: serverTimestamp(),
    });
  };

  return { orders, loading, createOrder, updateStatus };
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}
