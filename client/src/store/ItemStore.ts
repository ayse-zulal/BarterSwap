import { create } from 'zustand';
import axios from 'axios';

const useItemStore = create((set) => ({
  items: [],
  filteredItems: [],
  fetchItems: async () => {
    const res = await axios.get('http://localhost:5000/api/items/available');
    set({ items: res.data, filteredItems: res.data });
  },
  // while filtering, even if I just type a single character that is in the name of an item, it adds the item to filteredItems, should be fixed maybe later
  filterItems: (query) =>
    set((state) => ({
      filteredItems: state.items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      ),
    })),
}));

export default useItemStore;