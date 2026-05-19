import { useState, useEffect } from "react";
import { db, configDoc, onSnapshot, setDoc } from "../firebase";

const DEFAULT_CONFIG = {
  waitTime: 20,
  pickupTime: 15,
  forceClose: false,
  uberEatsUrl: "",
  deliverooUrl: "",
  hours: [
    { day: "Lundi", open: "11:30", close: "14:30", open2: "17:00", close2: "21:30", active: true },
    { day: "Mardi", open: "11:30", close: "14:30", open2: "17:00", close2: "21:30", active: true },
    { day: "Mercredi", open: "11:30", close: "14:30", open2: "17:00", close2: "21:30", active: true },
    { day: "Jeudi", open: "11:30", close: "14:30", open2: "17:00", close2: "21:30", active: true },
    { day: "Vendredi", open: "11:30", close: "14:30", open2: "17:00", close2: "22:00", active: true },
    { day: "Samedi", open: "11:30", close: "14:30", open2: "17:00", close2: "22:00", active: true },
    { day: "Dimanche", open: "", close: "", open2: "", close2: "", active: false },
  ],
  welcome: {
    title: "Poké & Tea",
    subtitle: "Votre Poké et Bubble Tea préféré a Meaux",
    badge: "🍣 Poké Bowl - Sushi - Bubble Tea",
  },
};

export function useConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(configDoc, (snap) => {
      if (snap.exists()) {
        setConfig({ ...DEFAULT_CONFIG, ...snap.data() });
      } else {
        // Initialise la config par défaut dans Firestore
        setDoc(configDoc, DEFAULT_CONFIG);
      }
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const updateConfig = async (updates) => {
    const newCfg = { ...config, ...updates };
    await setDoc(configDoc, newCfg);
  };

  const checkOpen = () => {
    if (config.forceClose) return false;
    if (config.forceOpen) return true;
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const now = new Date();
    const today = days[now.getDay()];
    const h = config.hours.find(x => x.day === today);
    if (!h || !h.active) return false;
    const t = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    return (h.open && h.close && t >= h.open && t <= h.close) || (h.open2 && h.close2 && t >= h.open2 && t <= h.close2);
  };

  return { config, loading, updateConfig, checkOpen };
}
