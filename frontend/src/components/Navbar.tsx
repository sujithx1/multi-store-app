import { LogOut, Package, User } from 'lucide-react';

interface NavbarProps {
  user: { username: string; role: 'admin' | 'shopper' } | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
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
        )}
      </div>
    </header>
  );
}
