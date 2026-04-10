import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import NestCartIcon from '../components/NestCartIcon';
import api from '../api/axios';
import authService from '../auth/authService';
import { logout } from '../auth/authSlice';

/* ── nav link style ─────────────────────────────────────────────────── */
const subNavClass = ({ isActive }) => {
  const base =
    'inline-flex items-center text-sm md:text-[0.95rem] leading-tight tracking-tight pb-1.5 border-b-2 transition-colors';
  return isActive
    ? `${base} font-bold text-[var(--text-dark)] border-[var(--nest-primary)]`
    : `${base} font-semibold text-[var(--nav-muted)] border-transparent hover:text-[var(--nest-primary)]`;
};

/* ── Login / Sign Up buttons (shown only when not authenticated) ─────── */
const AuthLinks = ({ mobile }) => (
  <div className={`flex items-center ${mobile ? 'gap-4' : 'gap-8'}`}>
    <Link
      to="/user/login"
      className="text-[var(--text-dark)] text-base font-medium hover:text-[var(--nest-primary)] transition-colors"
    >
      Login
    </Link>
    <Link
      to="/user/register"
      className="px-6 py-3 sm:px-7 bg-[var(--nest-primary)] hover:bg-[var(--nest-primary-hover)] text-white rounded-lg font-bold text-sm transition-all shadow-md"
    >
      Sign Up
    </Link>
  </div>
);

/* ── User Avatar Dropdown ───────────────────────────────────────────── */
const UserAvatar = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const [open,      setOpen]      = useState(false);
  const [profile,   setProfile]   = useState(null);   // null = still loading
  const [avatar,    setAvatar]    = useState(null);
  const [uploading, setUploading] = useState(false);

  const wrapperRef = useRef(null);
  const fileRef    = useRef(null);

  /* fetch profile on mount – fills in all user details */
  useEffect(() => {
    let cancelled = false;
    api.get('/auth/api/user/profile')
      .then(res => {
        if (cancelled) return;
        const d = res.data?.data || res.data || {};
        setProfile(d);
        const saved = localStorage.getItem('user_avatar');
        setAvatar(saved || d.profile_image || null);
      })
      .catch(() => {
        if (!cancelled) setProfile({});   // mark as "loaded, but empty"
      });
    return () => { cancelled = true; };
  }, []);

  /* close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* upload avatar (stored locally as base64) */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target.result;
      localStorage.setItem('user_avatar', b64);
      setAvatar(b64);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  /* logout */
  const handleLogout = async () => {
    try {
      await authService.logout('user');
    } catch (_) {}
    localStorage.removeItem('user_avatar');
    dispatch(logout());
    setOpen(false);
    navigate('/');
  };

  /* initials fallback */
  const initials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const name  = profile?.username  || '';
  const email = profile?.email     || '';
  const phone = profile?.phonenumber || '';

  /* still fetching profile → show spinner */
  if (profile === null) {
    return (
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        border: '2.5px solid #3BB77E',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          width: 18, height: 18,
          border: '2.5px solid #bbf7d0',
          borderTop: '2.5px solid #3BB77E',
          borderRadius: '50%',
          animation: 'avatarSpin 0.7s linear infinite',
        }} />
        <style>{`@keyframes avatarSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* ── Avatar circle trigger ── */}
      <button
        onClick={() => setOpen(v => !v)}
        title={name || 'My Profile'}
        style={{
          width: 42, height: 42, borderRadius: '50%',
          border: '2.5px solid #3BB77E',
          overflow: 'hidden',
          background: avatar ? 'transparent' : '#def9ec',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0, flexShrink: 0,
          boxShadow: open ? '0 0 0 3px rgba(59,183,126,0.2)' : 'none',
          transition: 'box-shadow 0.2s',
        }}
      >
        {avatar
          ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 14, fontWeight: 800, color: '#3BB77E' }}>{initials(name)}</span>
        }
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', right: 0,
          width: 280, background: '#fff',
          borderRadius: 18, border: '1.5px solid #e8f5ee',
          boxShadow: '0 16px 48px rgba(0,0,0,0.13)',
          zIndex: 500, overflow: 'hidden',
          animation: 'dropIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#3BB77E 0%,#1e9f62 100%)',
            padding: '22px 20px 18px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            {/* Avatar + upload overlay */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.6)',
                background: avatar ? 'transparent' : 'rgba(255,255,255,0.2)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatar
                  ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{initials(name)}</span>
                }
              </div>
              {/* Camera overlay button */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Change photo"
                style={{
                  position: 'absolute', bottom: 0, right: -2,
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#fff', border: '2px solid #3BB77E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {uploading ? '⏳' : '📷'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 16, lineHeight: 1.2 }}>{name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Registered User</div>
            </div>
          </div>

          {/* Profile details */}
          <div style={{ padding: '14px 20px 0' }}>
            {[
              { icon: '✉️', label: 'Email',  value: email },
              { icon: '📞', label: 'Phone',  value: phone || 'Not provided' },
              ...(profile?.saved_address ? [{ icon: '📍', label: 'Address', value: `${profile.saved_address}, ${profile.saved_city} - ${profile.saved_pincode}` }] : []),
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '9px 0', borderBottom: '1px solid #f1f5f9',
              }}>
                <span style={{ fontSize: 15 }}>{row.icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#253d4e', marginTop: 1, wordBreak: 'break-all' }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ padding: '12px 20px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => { navigate('/user/orders'); setOpen(false); }}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                background: '#f0fdf6', border: '1.5px solid #bbf7d0',
                color: '#3BB77E', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf6'; }}
            >
              📦 My Orders
            </button>
            <button
              onClick={() => { fileRef.current?.click(); }}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                background: '#f0fdf6', border: '1.5px solid #bbf7d0',
                color: '#3BB77E', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf6'; }}
            >
              📷 {avatar ? 'Change Photo' : 'Add Photo'}
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                background: '#fff1f2', border: '1.5px solid #fecdd3',
                color: '#e11d48', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ffe4e6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff1f2'; }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-8px) scale(0.97); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const isAuthenticated = useSelector((state) => state.auth?.status);
  const navigate = useNavigate();
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  /* fetch cart count whenever auth state changes */
  useEffect(() => {
    if (isAuthenticated !== true) { setCartCount(0); return; }
    api.get('/auth/api/user/cart')
      .then(res => {
        const items = res.data?.data?.items || res.data?.data || res.data?.items || res.data || [];
        const list = Array.isArray(items) ? items : [];
        const total = list.reduce((sum, ci) => sum + (ci.quantity || 1), 0);
        setCartCount(total);
      })
      .catch(() => setCartCount(0));
  }, [isAuthenticated]);

  const handleCartClick = (e) => {
    if (isAuthenticated !== true) {
      e.preventDefault();
      setIsLoginPromptOpen(true);
      setTimeout(() => {
        setIsLoginPromptOpen((prev) => {
          if (prev) { navigate('/user/login?redirect=/'); return false; }
          return prev;
        });
      }, 4000);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-50 font-['Quicksand'] border-b border-[#ECEEF0]">
        {/* Part 1: logo + search + auth */}
        <div className="homepage-shell py-6 md:py-8 lg:py-9 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex justify-between items-center w-full lg:w-auto lg:shrink-0 min-w-0">
            <Link to="/" className="flex items-center gap-3.5 cursor-pointer min-w-0 shrink-0 overflow-visible">
              <div className="w-12 h-12 md:w-[52px] md:h-[52px] bg-[var(--nest-primary)] rounded-xl flex items-center justify-center text-white shrink-0">
                <NestCartIcon className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-3xl md:text-4xl font-bold text-[var(--nest-primary)] leading-none">Nest</span>
                <span className="text-[10px] md:text-[11px] font-bold text-[var(--text-grey)] tracking-widest uppercase">Mart & Grocery</span>
              </div>
            </Link>
            {/* Mobile: show auth or avatar */}
            <div className="lg:hidden">
              {isAuthenticated === true ? <UserAvatar /> : <AuthLinks mobile />}
            </div>
          </div>

          <div className="flex w-full lg:flex-1 lg:max-w-[640px] lg:mx-4 xl:mx-10 h-14 md:h-[3.75rem] bg-white border border-[var(--border-search)] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 px-4 md:px-5 outline-none text-base text-[var(--text-dark)] placeholder:text-[var(--text-grey)]"
              aria-label="Search for products"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="px-6 sm:px-8 shrink-0 bg-[var(--nest-primary)] hover:bg-[var(--nest-primary-hover)] text-white text-base font-bold transition-colors"
            >
              Search
            </button>
          </div>

          {/* Desktop right: auth links OR avatar + cart */}
          <div className="hidden lg:flex items-center shrink-0 gap-4">
            {/* Show Login/SignUp only when NOT authenticated */}
            {isAuthenticated !== true && <AuthLinks />}

            <div className="w-[1px] h-8 bg-gray-200" />

            {/* Cart */}
            <Link to="/user/cart" onClick={handleCartClick} className="relative p-2 shrink-0 group flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <NestCartIcon className="w-7 h-7 text-gray-700 group-hover:text-[var(--nest-primary)] transition-colors" />
                {isAuthenticated === true && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#f74b81] text-white text-[11px] items-center justify-center flex font-bold border-2 border-white shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[var(--text-dark)] font-semibold text-sm group-hover:text-[var(--nest-primary)] transition-colors">Cart</span>
            </Link>

            {/* User avatar (only when authenticated) */}
            {isAuthenticated === true && <UserAvatar />}
          </div>
        </div>

        {/* Part 2: slim nav strip */}
        <nav className="border-t border-b border-[#E8EAED] bg-white" aria-label="Main">
          <div className="homepage-shell flex flex-wrap items-end gap-7 md:gap-9 lg:gap-10 pt-2.5 pb-1.5 md:pt-3 md:pb-2 min-h-[34px] md:min-h-[38px]">
            <NavLink to="/" end className={subNavClass}>Home</NavLink>
            <NavLink to="/about" className={subNavClass}>About</NavLink>
            <NavLink to="/contact" className={subNavClass}>Contact</NavLink>
            {isAuthenticated === true && (
              <NavLink to="/user/orders" className={subNavClass}>My Orders</NavLink>
            )}
          </div>
        </nav>
      </header>

      {/* Login Required Modal */}
      {isLoginPromptOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
            <p className="text-gray-500 font-medium mb-3">Please log in to view your cart. You will be redirected shortly...</p>
            <button
              onClick={() => { setIsLoginPromptOpen(false); navigate('/user/login?redirect=/'); }}
              className="w-full py-3 rounded-xl bg-[#3BB77E] text-white font-bold tracking-wide shadow-lg shadow-green-200 hover:bg-green-600 transition-all"
            >
              Go to Login Page Now
            </button>
            <button onClick={() => setIsLoginPromptOpen(false)} className="mt-2 text-gray-400 hover:text-gray-600 font-semibold transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
