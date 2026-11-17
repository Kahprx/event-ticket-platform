export const SERVICE_FEE_RATE = 0.02;

export const PROMO_CODES = {
  SOUNDPASS10: { code: "SOUNDPASS10", label: "Giảm 10% giá vé", type: "percent", value: 10 },
  SINHVIEN: { code: "SINHVIEN", label: "Giảm 50.000 ₫ cho sinh viên", type: "amount", value: 50000 },
};

export const findPromo = (code) => {
  const normalized = String(code || "").trim().toUpperCase();
  return PROMO_CODES[normalized] || null;
};

export const applyDiscount = (subtotal, promo) => {
  if (!promo) return 0;
  if (promo.type === "percent") return Math.round((subtotal * promo.value) / 100);
  return Math.min(promo.value, subtotal);
};

// Tính các dòng vé từ ghế đã chọn (sự kiện có sơ đồ) hoặc số lượng vé (sự kiện đứng).
export const getSelection = (event, seats, quantities) => {
  if (!event) return { items: [], subtotal: 0, fee: 0, count: 0 };

  const items = [];

  if (event.seating?.type === "seated") {
    const grouped = {};
    seats.forEach((seat) => {
      const zone = event.seating.zones.find((entry) => seat.startsWith(entry.id));
      if (!zone) return;
      if (!grouped[zone.id]) {
        grouped[zone.id] = { id: zone.id, name: zone.name, price: zone.price, quantity: 0, seats: [] };
      }
      grouped[zone.id].quantity += 1;
      grouped[zone.id].seats.push(seat);
    });
    Object.values(grouped).forEach((item) => {
      items.push({ ...item, amount: item.price * item.quantity });
    });
  } else {
    (event.ticketTypes || []).forEach((type) => {
      const quantity = quantities[type.id] || 0;
      if (quantity > 0) {
        items.push({ id: type.id, name: type.name, price: type.price, quantity, amount: type.price * quantity });
      }
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);

  return { items, subtotal, fee, count };
};

export const calculateTotal = (subtotal, fee, promo) => {
  const discount = applyDiscount(subtotal, promo);
  return { discount, total: Math.max(0, subtotal + fee - discount) };
};
