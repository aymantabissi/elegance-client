import { create } from "zustand";

const getCartKey = (userId) => `cart_${userId || "guest"}`;

const getInitialUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || user?._id || null;
  } catch {
    return null;
  }
};

const getInitialCart = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(getCartKey(userId))) || [];
  } catch {
    return [];
  }
};

export const useCartStore = create((set, get) => {
  const initialUserId = getInitialUserId();

  return {
    userId: initialUserId,
    cart: getInitialCart(initialUserId),

    // ✅ set userId + load cart
    setUser: (userId) => {
      const uid = userId || null;
      const cart = getInitialCart(uid);
      set({ userId: uid, cart });
    },

    // ✅ explicit load
    loadCart: (userId) => {
      const uid = userId || null;
      const cart = getInitialCart(uid);
      set({ userId: uid, cart });
    },

    // ✅ old API compatibility
    setCart: (newCart) => {
      const { userId } = get();
      localStorage.setItem(getCartKey(userId), JSON.stringify(newCart));
      set({ cart: newCart });
    },

    addToCart: (item) =>
      set((state) => {
        const existingItem = state.cart.find((x) => x._id === item._id);

        let updatedCart;
        if (existingItem) {
          updatedCart = state.cart.map((x) =>
            x._id === item._id ? { ...x, quantity: (x.quantity || 1) + 1 } : x
          );
        } else {
          updatedCart = [...state.cart, { ...item, quantity: 1 }];
        }

        localStorage.setItem(getCartKey(state.userId), JSON.stringify(updatedCart));
        return { cart: updatedCart };
      }),

    removeFromCart: (id) =>
      set((state) => {
        const updatedCart = state.cart.filter((item) => item._id !== id);
        localStorage.setItem(getCartKey(state.userId), JSON.stringify(updatedCart));
        return { cart: updatedCart };
      }),

    updateQuantity: (id, newQuantity) =>
      set((state) => {
        const updatedCart = state.cart.map((item) =>
          item._id === id ? { ...item, quantity: Math.max(Number(newQuantity) || 1, 1) } : item
        );
        localStorage.setItem(getCartKey(state.userId), JSON.stringify(updatedCart));
        return { cart: updatedCart };
      }),

    clearCart: () => {
      const { userId } = get();
      localStorage.removeItem(getCartKey(userId));
      set({ cart: [] });
    },
    resetCartState: () => {
  // ✅ غير UI/state، ما كنمسحوش localStorage
  set({ cart: [], userId: null });
},
  };

});
