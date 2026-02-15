import { useState } from "react";
import { useOrders } from "./hooks/useOrders";
import { useAuth } from "./hooks/useAuth";

const STATUSES = ["nouvelle", "en préparation", "prête", "récupérée"];
const STATUS_COLORS = {
  "nouvelle": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "en préparation": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  "prête": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "récupérée": { bg: "#f5f5f4", color: "#78716c", border: "#d6d3d1" },
};

export default function KitchenScreen() {
  const { user, isAdmin, loading: authLoading, login, logout } = useAuth();
  const { orders, loading: ordersLoading, updateStatus } = useOrders();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("active");

  // Request notification permission
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
  }

  if (authLoading) return <div style={styles.center}><div style={styles.spinner}>🍣</div><p>Chargement...</p></div>;

  if (!user || !isAdmin) {
    return (
      <div style={styles.center}>
        <div style={styles.loginBox}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍣</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Écran Cuisine</h1>
          <p style={{ color: "#888", marginBottom: 24 }}>Connexion admin requise</p>
          {err && <div style={styles.err}>{err}</div>}
          <input style={styles.input} type="email" placeholder="Email admin" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Mot de passe" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
          <button style={styles.btn} onClick={doLogin}>Se connecter</button>
        </div>
      </div>
    );
  }

  async function doLogin() {
    try { await login(email, pw); setErr(""); }
    catch { setErr("Email ou mot de passe incorrect"); }
  }

  const activeOrders = orders.filter(o => o.status !== "récupérée" && o.status !== "annulée");
  const allOrders = filter === "active" ? activeOrders : orders;
  const newCount = orders.filter(o => o.status === "nouvelle").length;

  const nextStatus = (s) => {
    const i = STATUSES.indexOf(s);
    return i >= 0 && i < STATUSES.length - 1 ? STATUSES[i + 1] : null;
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🍣</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Cuisine Poké Tea</span>
          {newCount > 0 && <span style={styles.badge}>{newCount} nouvelle{newCount > 1 ? "s" : ""}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...styles.filterBtn, ...(filter === "active" ? styles.filterActive : {}) }} onClick={() => setFilter("active")}>Actives</button>
          <button style={{ ...styles.filterBtn, ...(filter === "all" ? styles.filterActive : {}) }} onClick={() => setFilter("all")}>Toutes</button>
          <button style={styles.logoutBtn} onClick={logout}>Déconnexion</button>
        </div>
      </div>

      {ordersLoading ? (
        <div style={styles.center}><div style={styles.spinner}>🍣</div></div>
      ) : allOrders.length === 0 ? (
        <div style={styles.center}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🍜</div>
          <p style={{ fontSize: 20, color: "#888" }}>Aucune commande en cours</p>
          <p style={{ fontSize: 14, color: "#aaa", marginTop: 8 }}>Les nouvelles commandes apparaîtront ici automatiquement</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {allOrders.map(o => {
            const sc = STATUS_COLORS[o.status] || STATUS_COLORS["nouvelle"];
            const next = nextStatus(o.status);
            return (
              <div key={o.id} style={{ ...styles.card, borderColor: sc.border, background: sc.bg }}>
                <div style={styles.cardTop}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{o.orderNum}</span>
                  <span style={{ ...styles.statusBadge, background: sc.color + "18", color: sc.color }}>{o.status}</span>
                </div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                  {o.orderMode === "emporter" ? "🥡 A emporter" : o.orderMode === "surplace" ? "🍽 Sur place" : o.orderMode} — {formatTime(o.createdAt)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{o.customer?.name} {o.customer?.phone && `· ${o.customer.phone}`}</div>
                <div style={styles.items}>
                  {(o.items || []).map((item, i) => (
                    <div key={i} style={styles.item}>
                      <span style={styles.qty}>{item.qty}x</span>
                      <span>{item.name}</span>
                      {item.selectedOpts?.length > 0 && <span style={{ fontSize: 11, color: "#7c3aed" }}> ({item.selectedOpts.map(op => op.name).join(", ")})</span>}
                    </div>
                  ))}
                </div>
                {o.customer?.notes && <div style={styles.notes}>📝 {o.customer.notes}</div>}
                <div style={styles.cardBottom}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#e85d3a" }}>{o.total?.toFixed(2)}€</span>
                  {next && (
                    <button style={{ ...styles.actionBtn, background: sc.color }} onClick={() => updateStatus(o.id, next)}>
                      {next === "en préparation" ? "🔥 Préparer" : next === "prête" ? "✅ Prête" : next === "récupérée" ? "📦 Récupérée" : next}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#111", fontFamily: "'DM Sans', system-ui, sans-serif" },
  topbar: { position: "sticky", top: 0, zIndex: 100, background: "rgba(0,0,0,.9)", backdropFilter: "blur(12px)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #333" },
  badge: { background: "#dc2626", color: "white", fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 20, animation: "pulse 2s infinite" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, padding: 20 },
  card: { borderRadius: 16, border: "2px solid", padding: 20, display: "flex", flexDirection: "column", transition: "all .2s" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase" },
  items: { flex: 1, marginBottom: 12 },
  item: { padding: "4px 0", fontSize: 15, borderBottom: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 6 },
  qty: { fontWeight: 800, color: "#e85d3a", minWidth: 28 },
  notes: { background: "rgba(124,58,237,.08)", padding: "8px 12px", borderRadius: 8, fontSize: 13, color: "#7c3aed", marginBottom: 12 },
  cardBottom: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(0,0,0,.08)" },
  actionBtn: { padding: "10px 20px", border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all .15s" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" },
  spinner: { fontSize: 48, animation: "spin 1s linear infinite" },
  loginBox: { background: "white", borderRadius: 20, padding: 40, textAlign: "center", width: "min(400px, 90vw)", boxShadow: "0 12px 40px rgba(0,0,0,.1)" },
  input: { width: "100%", padding: "12px 16px", border: "1.5px solid #e5e5e5", borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: 14, border: "none", borderRadius: 10, background: "#e85d3a", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  err: { background: "#fef2f2", color: "#dc2626", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 },
  filterBtn: { padding: "6px 14px", border: "1px solid #555", borderRadius: 8, background: "transparent", color: "#aaa", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  filterActive: { background: "#e85d3a", borderColor: "#e85d3a", color: "white" },
  logoutBtn: { padding: "6px 14px", border: "1px solid #555", borderRadius: 8, background: "transparent", color: "#888", fontSize: 13, cursor: "pointer" },
};
