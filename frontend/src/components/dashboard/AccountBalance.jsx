import React from "react";
import { formatCurrency } from "../../utils/format";

export default function AccountBalance({ balanceCents = 0, currency = "INR" }) {
  const val = (balanceCents || 0) / 100;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #111827, #1f2937)",
        borderRadius: 16,
        padding: "1rem",
        color: "white",
      }}
    >
      <div style={{ opacity: 0.8, fontSize: 13 }}>Account balance</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{formatCurrency(val, currency)}</div>
    </div>
  );
}