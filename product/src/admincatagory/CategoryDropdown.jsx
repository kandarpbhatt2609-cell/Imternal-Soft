import React, { useEffect, useState } from 'react';
import { getCategories } from './categoryService';

const CategoryDropdown = ({ onSelect }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchItems();
  }, []);

  return (
    <select onChange={(e) => onSelect(e.target.value)} className="admin-dropdown">
      <option value="">Select a Category</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.categoryName}
        </option>
      ))}
    </select>
  );
};

export default CategoryDropdown;