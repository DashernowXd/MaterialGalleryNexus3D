import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ============================================================================
// ESCENARIO: Carrito de compras y badge del navbar.
// Inicialmente los componentes no comparten datos. Mostramos la evolución idiomática:
// 1. Elevación de Estado simple.
// 2. Transición a CartProvider desacoplado para evitar Prop Drilling.
// ============================================================================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR' };

interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalCount: number;
}

function calculateCartTotals(items: CartItem[]): { totalPrice: number; totalCount: number } {
  return items.reduce(
    (acc, item) => ({
      totalPrice: acc.totalPrice + item.price * item.quantity,
      totalCount: acc.totalCount + item.quantity,
    }),
    { totalPrice: 0, totalCount: 0 }
  );
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      let updatedItems: CartItem[];

      if (existing) {
        updatedItems = state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const totals = calculateCartTotals(updatedItems);
      return { items: updatedItems, ...totals };
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(i => i.id !== action.payload);
      const totals = calculateCartTotals(updatedItems);
      return { items: updatedItems, ...totals };
    }

    case 'CLEAR':
      return { items: [], totalPrice: 0, totalCount: 0 };

    default:
      return state;
  }
}

// Separación de contextos para alto rendimiento (evita que el botón que solo hace dispatch re-renderice cuando cambia el total)
const CartStateContext = createContext<CartState | undefined>(undefined);
const CartDispatchContext = createContext<React.Dispatch<CartAction> | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalPrice: 0,
    totalCount: 0,
  });

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

// Hooks de consumo protegidos
export function useCartState() {
  const context = useContext(CartStateContext);
  if (!context) throw new Error('useCartState debe usarse dentro de un CartProvider');
  return context;
}

export function useCartDispatch() {
  const context = useContext(CartDispatchContext);
  if (!context) throw new Error('useCartDispatch debe usarse dentro de un CartProvider');
  return context;
}

// Componentes desacoplados
export function NavbarCartBadge() {
  const { totalCount } = useCartState();
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
      🛒 Carrito: <span>{totalCount} productos</span>
    </div>
  );
}

export function ProductAddButton({ product }: { product: { id: string; name: string; price: number } }) {
  const dispatch = useCartDispatch();

  return (
    <button
      onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}
      style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', borderRadius: 4, border: 'none', cursor: 'pointer' }}
    >
      Añadir al carrito (${product.price})
    </button>
  );
}

export function CartSummary() {
  const { items, totalPrice } = useCartState();
  const dispatch = useCartDispatch();

  if (items.length === 0) return <p>El carrito está vacío.</p>;

  return (
    <div>
      <h4>Tu Carrito</h4>
      <ul>
        {items.map(item => (
          <li key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
            <span>{item.name} x {item.quantity} (${item.price * item.quantity})</span>
            <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}>✕</button>
          </li>
        ))}
      </ul>
      <p><strong>Total: ${totalPrice.toFixed(2)}</strong></p>
      <button onClick={() => dispatch({ type: 'CLEAR' })}>Vaciar carrito</button>
    </div>
  );
}
