import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  bids: [],
  purchasedItems: [],
  userItems: [],

  fetchUser: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await axios.get(`http://localhost:5000/api/users/${res.data.userId}`);

      const bids = await axios.get(`http://localhost:5000/api/bids/user/${res.data.userId}`);
      const purchasedItems = await axios.get(`http://localhost:5000/api/transactions/buyer/${res.data.userId}`);
      const userItems = await axios.get(`http://localhost:5000/api/items/user/${res.data.userId}`);
      set({
        user: userData.data,
        isAuthenticated: true,
        bids: bids.data,
        purchasedItems: purchasedItems.data,
        userItems: userItems.data,
      });
    } catch (err) {
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },
}));
export default useAuthStore;
