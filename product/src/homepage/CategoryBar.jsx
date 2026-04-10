import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Emoji icons mapped per category name keyword
const CATEGORY_ICONS = {
  dairy:      '🥛',
  milk:       '🥛',
  cheese:     '🧀',
  butter:     '🧈',
  spices:     '🌶️',
  condiment:  '🌶️',
  masala:     '🌶️',
  herbs:      '🌿',
  beverages:  '🧃',
  drinks:     '🥤',
  juice:      '🍊',
  grains:     '🌾',
  rice:       '🍚',
  wheat:      '🌾',
  pulses:     '🫘',
  flour:      '🌾',
  flours:     '🌾',
  lentils:    '🫘',
  snacks:     '🍿',
  chips:      '🍟',
  packet:     '📦',
  food:       '🍱',
  bakery:     '🍞',
  bread:      '🥖',
  biscuit:    '🍪',
  vegetables: '🥦',
  fruits:     '🍎',
  meat:       '🥩',
  chicken:    '🍗',
  fish:       '🐟',
  eggs:       '🥚',
  frozen:     '❄️',
  sweets:     '🍬',
  oil:        '🫙',
  ghee:       '🫙',
  personal:   '🧴',
  cleaning:   '🧹',
  household:  '🏠',
  all:        '🛒',
  default:    '🛒',
};

const getIcon = (name = '') => {
  const key = name.toLowerCase().trim();
  for (const k of Object.keys(CATEGORY_ICONS)) {
    if (k !== 'default' && k !== 'all' && key.includes(k)) return CATEGORY_ICONS[k];
  }
  return CATEGORY_ICONS.default;
};

const CategoryBar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('all');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/auth/api/user/categories');
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('CategoryBar: could not load categories', err);
      }
    };
    loadCategories();
  }, []);

  const allTabs = [
    { id: 'all', categoryName: 'All' },
    ...categories,
  ];

  return (
    <div
      style={{
        borderBottom: '1px solid #ECEEF0',
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'stretch',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {allTabs.map((cat) => {
          const name = cat.categoryName || '';
          const isActive = active === name;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActive(name);
                if (name === 'All') {
                  navigate('/');
                } else {
                  navigate(`/category/${encodeURIComponent(name)}`);
                }
              }}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '10px 20px',
                border: 'none',
                borderBottom: isActive ? '3px solid #3BB77E' : '3px solid transparent',
                background: isActive ? '#f0fdf6' : 'transparent',
                cursor: 'pointer',
                color: isActive ? '#3BB77E' : '#4a5568',
                transition: 'all 0.15s ease',
                minWidth: 72,
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = '#3BB77E';
                  e.currentTarget.style.background = '#f0fdf6';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = '#4a5568';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{getIcon(name)}</span>
              <span style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 600,
                lineHeight: 1.3,
                textTransform: 'capitalize',
              }}>
                {name}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CategoryBar;
