// components/ReloadSearchDataWorkerButton.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react"; // Optional, can remove if not needed

export default function ReloadSearchDataWorkerButton({ onReload }) {
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    setLoading(true);
    try {
      await onReload();
    } catch (err) {
      console.error("❌ Reload failed:", err);
    } finally {
      // small delay for UX so user can see the spinner
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <button
      className={`reload-btn ${loading ? "loading" : ""}`}
      onClick={handleReload}
      disabled={loading}
    >
      <RotateCcw className={`reload-icon ${loading ? "spinning" : ""}`} />
      {loading ? "Reloading..." : "Reload Data"}
    </button>
  );
}
