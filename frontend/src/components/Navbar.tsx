import { LogOut, Package, User } from 'lucide-react';
import { useState } from 'react';
import ProductPage from './ProductPage';
import StorePage from './StorePage';
import StockPage from './StockPage';

interface NavbarProps {
  user: { username: string; role: 'admin' | 'shopper' } | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
    const [activeTab, setActiveTab] = useState<"products" | "stocks" | "stores">("products");
  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 16px 16px', marginBottom: '1rem' }}>
      <div className="container" style={{ padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.35rem', borderRadius: '8px', display: 'flex' }}>
            <Package size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.5px' }}>StockFlow</span>
        </div>
        {user && (
          <>

      <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "products"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <span>Products Section</span>
        </button>

        <button
          onClick={() => setActiveTab("stores")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "stores"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <span>Store Section</span>
        </button>

        <button
          onClick={() => setActiveTab("stocks")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "stocks"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <span>Stock Section</span>
        </button>
      </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
              <User size={16} className="text-secondary" />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.username}</span>
              <span className={`badge ${user.role === 'admin' ? 'badge-low' : 'badge-ok'}`} style={{ fontSize: '0.7rem' }}>
                {user.role}
              </span>
            </div>

            <button 
              onClick={onLogout}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
              >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
          </>
        )}
      </div>
      {
        user && ( 
          <>
            <div className="mt-4">
        
        {activeTab === "products" && <ProductPage />}
        {activeTab === "stores" && <StorePage />}
        {activeTab === "stocks" && <StockPage />}
          </div>
          </>
        )}
    </header>
  );
}
