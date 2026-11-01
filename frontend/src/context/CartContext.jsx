import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AuthPromptModal from '../components/AuthPromptModal';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('budgetbite_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // Auth prompt modal state for guests attempting to add to cart
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authPromptItemName, setAuthPromptItemName] = useState('');

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('budgetbite_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const openAuthPrompt = (itemName = '') => {
    setAuthPromptItemName(itemName);
    setAuthPromptOpen(true);
  };

  const closeAuthPrompt = () => {
    setAuthPromptOpen(false);
    setAuthPromptItemName('');
  };

  const addToCart = (item, qty = 1, itemType = 'food') => {
    // Enforce Mandatory Login: If guest, display friendly modal prompt
    if (!isAuthenticated) {
      openAuthPrompt(item.name);
      return false;
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (ci) => ci.id === item.id && ci.type === (item.type || itemType)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            image_url: item.image_url,
            is_veg: item.is_veg !== undefined ? item.is_veg : 1,
            type: item.type || itemType,
            quantity: qty
          }
        ];
      }
    });

    return true;
  };

  // Add multiple items in one action (for Smart Budget Planner)
  const addBatchToCart = (items) => {
    // Enforce Mandatory Login
    if (!isAuthenticated) {
      openAuthPrompt('Planned Meal Combination');
      return false;
    }

    setCartItems((prevItems) => {
      const updated = [...prevItems];

      items.forEach((newItem) => {
        const existingIndex = updated.findIndex(
          (ci) => ci.id === newItem.id && ci.type === (newItem.type || 'food')
        );

        if (existingIndex > -1) {
          updated[existingIndex].quantity += newItem.quantity || 1;
        } else {
          updated.push({
            id: newItem.id,
            name: newItem.name,
            price: parseFloat(newItem.price),
            image_url: newItem.image_url,
            is_veg: newItem.is_veg !== undefined ? newItem.is_veg : 1,
            type: newItem.type || 'food',
            quantity: newItem.quantity || 1
          });
        }
      });

      return updated;
    });

    return true;
  };

  const updateQuantity = (id, type, newQty) => {
    if (!isAuthenticated) {
      openAuthPrompt();
      return;
    }

    if (newQty <= 0) {
      removeFromCart(id, type);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.type === type) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id, type) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.type === type)));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('budgetbite_cart');
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 30) : 0;
  const grandTotal = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    addBatchToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    grandTotal,
    totalItems,
    openAuthPrompt,
    closeAuthPrompt
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <AuthPromptModal
        isOpen={authPromptOpen}
        onClose={closeAuthPrompt}
        itemName={authPromptItemName}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
