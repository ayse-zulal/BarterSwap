import { create } from 'zustand';
import axios from 'axios';

const useItemStore = create((set) => ({
  items: [],
  filteredItems: [],
  fetchItems: async () => {
    const res = await axios.get('http://localhost:5000/api/items/available');
    set({ items: res.data, filteredItems: res.data });
  },

  filterItems: ({
    searchQuery = "",
    minPrice = 0,
    maxPrice = Infinity,
    minBids = 0,
    category = "",
    condition = ""
  }) =>
    set((state) => ({
      filteredItems: state.items.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const priceMatch = item.currentprice >= minPrice && item.currentprice <= maxPrice;
        const bidMatch = (item.bids?.length || 0) >= minBids;
        const categoryMatch = category ? item.category === category : true;
        const conditionMatch = condition ? item.itemcondition === condition : true;

        return titleMatch && priceMatch && bidMatch && categoryMatch && conditionMatch;
      }),
    })),
}));

export default useItemStore;
