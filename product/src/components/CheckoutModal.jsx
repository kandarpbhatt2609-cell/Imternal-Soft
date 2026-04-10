import React, { useState, useEffect } from 'react';
import api from '../api/axios';

/* ─── shared localStorage key (same as OrderModal) ──────────────────── */
const LS_KEY = 'user_delivery_info';

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveDelivery = (info) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(info));
  } catch { /* ignore */ }
};

/* ─── icons ─────────────────────────────────────────────────────────── */
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CheckoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════════ */
/*  CheckoutModal                                                        */
/*  Props:                                                              */
/*    isOpen      – boolean                                             */
/*    onClose     – () => void                                          */
/*    cartSummary – { totalItems, grandTotal } (display purposes only) */
/*    onSuccess   – (msg: string) => void                              */
/* ════════════════════════════════════════════════════════════════════ */
const CheckoutModal = ({ isOpen, onClose, cartSummary, onSuccess }) => {
  const [form, setForm] = useState({
    deliveryPhone:   '',
    deliveryAddress: '',
    deliveryCity:    '',
    deliveryPincode: '',
  });

  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* Pre-fill from localStorage when modal opens */
  useEffect(() => {
    if (!isOpen) return;
    const saved = loadSaved();
    setForm({
      deliveryPhone:   saved?.deliveryPhone   || '',
      deliveryAddress: saved?.deliveryAddress || '',
      deliveryCity:    saved?.deliveryCity    || '',
      deliveryPincode: saved?.deliveryPincode || '',
    });
    setErrors({});
  }, [isOpen]);

  if (!isOpen) return null;

  const change = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.deliveryPhone.trim())   errs.deliveryPhone   = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.deliveryPhone.trim())) errs.deliveryPhone = 'Enter a valid 10-digit phone number';
    if (!form.deliveryAddress.trim()) errs.deliveryAddress = 'Delivery address is required';
    if (!form.deliveryCity.trim())    errs.deliveryCity    = 'City is required';
    if (!form.deliveryPincode.trim()) errs.deliveryPincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.deliveryPincode.trim())) errs.deliveryPincode = 'Enter a valid 6-digit pincode';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await api.post('/auth/api/user/order/checkout', {
        deliveryPhone:   form.deliveryPhone.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        deliveryCity:    form.deliveryCity.trim(),
        deliveryPincode: form.deliveryPincode.trim(),
      });

      /* Save for next time */
      saveDelivery({
        deliveryPhone:   form.deliveryPhone.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        deliveryCity:    form.deliveryCity.trim(),
        deliveryPincode: form.deliveryPincode.trim(),
      });

      onSuccess?.('✅ Order placed successfully!');
      onClose();
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err?.response?.data?.message || 'Failed to place order. Please try again.';
      setErrors({ submit: `❌ ${msg}` });
    } finally {
      setSubmitting(false);
    }
  };

  /* ──────────────────────────────────────────────────────────────── */
  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, animation: 'cmFadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'cmSlideUp 0.25s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #e8f5ee',
          background: 'linear-gradient(135deg, #f0fdf6 0%, #dcfce7 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, background: '#3BB77E', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <CheckoutIcon />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#253d4e' }}>Checkout</div>
              {cartSummary && (
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  {cartSummary.totalItems} item{cartSummary.totalItems !== 1 ? 's' : ''} · ₹{cartSummary.grandTotal?.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 8, display: 'flex' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Cart summary pill */}
        {cartSummary && (
          <div style={{
            margin: '16px 24px 0',
            background: 'linear-gradient(135deg,#f0fdf6,#dcfce7)',
            border: '1.5px solid #86efac',
            borderRadius: 12,
            padding: '12px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 13, color: '#253d4e', fontWeight: 700 }}>
              🛒 {cartSummary.totalItems} item{cartSummary.totalItems !== 1 ? 's' : ''} from your cart
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#3BB77E' }}>
              ₹{cartSummary.grandTotal?.toFixed(2)}
            </div>
          </div>
        )}

        {/* Body – form (NO quantity field) */}
        <form onSubmit={handleSubmit} style={{ padding: '18px 24px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Delivery Phone */}
          <Field label="Delivery Phone *" error={errors.deliveryPhone}>
            <input
              type="tel" maxLength={10} placeholder="10-digit mobile number"
              value={form.deliveryPhone}
              onChange={change('deliveryPhone')}
              style={inputStyle}
            />
          </Field>

          {/* Delivery Address */}
          <Field label="Delivery Address *" error={errors.deliveryAddress}>
            <textarea
              rows={2} placeholder="House / Building / Street"
              value={form.deliveryAddress}
              onChange={change('deliveryAddress')}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 60, paddingTop: 8 }}
            />
          </Field>

          {/* City + Pincode in a row */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="City *" error={errors.deliveryCity} style={{ flex: 1 }}>
              <input
                type="text" placeholder="Your city"
                value={form.deliveryCity}
                onChange={change('deliveryCity')}
                style={inputStyle}
              />
            </Field>
            <Field label="Pincode *" error={errors.deliveryPincode} style={{ flex: 1 }}>
              <input
                type="text" maxLength={6} placeholder="6-digit pincode"
                value={form.deliveryPincode}
                onChange={change('deliveryPincode')}
                style={inputStyle}
              />
            </Field>
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px', color: '#e11d48', fontWeight: 700, fontSize: 13 }}>
              {errors.submit}
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ padding: '12px 24px 22px', display: 'flex', gap: 10 }}>
          <button
            type="button" onClick={onClose}
            style={{ flex: 1, padding: '12px 0', border: 'none', borderRadius: 10, background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 2, padding: '12px 0', border: 'none', borderRadius: 10,
              background: submitting ? '#86efac' : '#3BB77E',
              color: '#fff', fontWeight: 800, fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(59,183,126,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {submitting ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid #fff4', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'cmSpin 0.7s linear infinite' }} />
                Placing order…
              </>
            ) : (
              <><CheckoutIcon /> Place Order</>
            )}
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes cmFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cmSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cmSpin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

/* ─── small helpers ─────────────────────────────────────────────────── */
const Field = ({ label, error, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: 11, color: '#e11d48', fontWeight: 600 }}>{error}</span>}
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #d1fae5',
  borderRadius: 8, fontSize: 14, color: '#253d4e', outline: 'none',
  fontFamily: 'inherit', background: '#fafffe',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

export default CheckoutModal;
