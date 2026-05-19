import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientApp from "./apps/client/ClientApp";
import KitchenApp from "./apps/kitchen/KitchenApp";
import PosApp from "./apps/pos/PosApp";
import KioskApp from "./apps/kiosk/KioskApp";
import AdminApp from "./apps/admin/AdminApp";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/kitchen" element={<KitchenApp />} />
        <Route path="/pos" element={<PosApp />} />
        <Route path="/borne" element={<KioskApp />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/*" element={<ClientApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
