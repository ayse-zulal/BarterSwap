import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      const res = await axios.get('http://localhost:5000/api/items/available');
      setItems(res.data);
      setFiltered(res.data);
      const uniqueCats = [...new Set(res.data.map((item) => item.category))];
      setCategories(uniqueCats);
    };
    fetchItems();
  }, []);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const result = items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.studentname.toLowerCase().includes(query)
    );
    setFiltered(result);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === '') {
      setFiltered(items);
    } else {
      setFiltered(items.filter((item) => item.category === category));
    }
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">🎁 Available Items</h1>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <input
          className="w-full md:w-1/2 px-4 py-2 border rounded-xl shadow-sm"
          type="text"
          placeholder="Search by item, category, or seller..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <select
          className="w-full md:w-1/4 px-4 py-2 border rounded-xl shadow-sm"
          value={selectedCategory}
          onChange={(e) => handleCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.itemid}
            className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition cursor-pointer"
            onClick={() => window.location.href = `/items/${item.itemid}`}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-40 object-cover rounded-xl mb-3"
            />
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-500 mb-1">{item.category}</p>
            <p className="text-sm">Seller: <span className="font-medium">{item.studentname}</span></p>
            <p className="mt-2 text-pink-600 font-bold">{item.currentprice} coins</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No items found for your search.</p>
      )}
    </div>
  );
};

export default HomePage;
