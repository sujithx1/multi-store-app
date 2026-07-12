import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import React, { useState } from "react";
import { createProduct, getProducts, type Product } from "../api/products";
import {
  adjustStock,
  getStocks,
  transferStock,
  type Stock,
} from "../api/stocks";
import { createStore, getStores, type StoreType } from "../api/stores";




export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [threshold, setThreshold] = useState<string>('');
  
  // Creation States
  const [newProductName, setNewProductName] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newStoreName, setNewStoreName] = useState('');

  // Adjustment States
  const [adjStoreId, setAdjStoreId] = useState('');
  const [adjProductId, setAdjProductId] = useState('');
  const [adjAmount, setAdjAmount] = useState<number>(0);

  // Transfer States
  const [transProductId, setTransProductId] = useState('');
  const [transSourceStoreId, setTransSourceStoreId] = useState('');
  const [transDestStoreId, setTransDestStoreId] = useState('');
  const [transQty, setTransQty] = useState<number>(0);

  // Status/Logs
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Queries using TanStack Query
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const { data: stores = [], isLoading: isLoadingStores } = useQuery<StoreType[]>({
    queryKey: ['stores'],
    queryFn: getStores
  });

  const { data: stocks = [], isLoading: isLoadingStocks, isFetching: isFetchingStocks } = useQuery<Stock[]>({
    queryKey: ['stocks', threshold],
    queryFn: () => getStocks(threshold)
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      showSuccess(`Product "${data.name}" created successfully`);
      setNewProductName('');
      setNewProductSku('');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
    onError: (err: any) => {
      showError(err?.response?.data?.error || err.message || 'Failed to create product');
    }
  });

  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: (data) => {
      showSuccess(`Store "${data.name}" created successfully`);
      setNewStoreName('');
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
    onError: (err: any) => {
      showError(err?.response?.data?.error || err.message || 'Failed to create store');
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      showSuccess('Stock adjustment processed successfully');
      setAdjAmount(0);
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
    onError: (err: any) => {
      showError(err?.response?.data?.error || err.message || 'Failed to adjust stock');
    }
  });

  const transferStockMutation = useMutation({
    mutationFn: transferStock,
    onSuccess: (data) => {
      showSuccess(data.message || 'Stock transfer completed successfully');
      setTransQty(0);
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
    onError: (err: any) => {
      showError(err?.response?.data?.error || err.message || 'Failed to transfer stock');
    }
  });

  // Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductSku) return showError('Product Name and SKU are required');
    createProductMutation.mutate({ name: newProductName, sku: newProductSku });
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return showError('Store Name is required');
    createStoreMutation.mutate({ name: newStoreName });
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjStoreId || !adjProductId || adjAmount === 0) {
      return showError('Please select store, product, and non-zero adjustment amount');
    }
    adjustStockMutation.mutate({
      storeId: adjStoreId,
      productId: adjProductId,
      amount: adjAmount,
    });
  };

  const handleTransferStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transProductId || !transSourceStoreId || !transDestStoreId || transQty <= 0) {
      return showError('Please specify product, different stores, and a positive quantity');
    }
    if (transSourceStoreId === transDestStoreId) {
      return showError('Source and destination stores must be different');
    }
    transferStockMutation.mutate({
      productId: transProductId,
      sourceStoreId: transSourceStoreId,
      destStoreId: transDestStoreId,
      quantity: transQty,
    });
  };

  const getStockQty = (productId: string, storeId: string) => {
    const entry = stocks.find((s) => {
      const pId = typeof s.productId === 'object' && s.productId ? s.productId._id : s.productId;
      const sId = typeof s.storeId === 'object' && s.storeId ? s.storeId._id : s.storeId;
      return pId === productId && sId === storeId;
    });
    return entry ? entry.quantity : 0;
  };

  const getStockBadgeClass = (qty: number) => {
    if (qty === 0) return 'badge-out';
    if (qty <= 5) return 'badge-low';
    return 'badge-ok';
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['stores'] });
    queryClient.invalidateQueries({ queryKey: ['stocks'] });
  };

  const isGlobalLoading = isLoadingProducts || isLoadingStores || isLoadingStocks;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 antialiased">
  {/* Dashboard Header */}
  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Control Center</h1>
      <p className="mt-1 text-sm text-slate-500">Manage catalog products, register stores, and run inventory stock actions</p>
    </div>
    <button 
      onClick={handleRefreshAll} 
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
      disabled={isGlobalLoading || isFetchingStocks}
    >
      {isGlobalLoading || isFetchingStocks ? (
        <Loader2 size={16} className="animate-spin text-sky-600" />
      ) : (
        <RefreshCw size={16} className="text-slate-500" />
      )}
      <span>Refresh</span>
    </button>
  </div>

  {/* Notifications */}
  {successMsg && (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
      <CheckCircle size={18} className="text-emerald-600" />
      <span>{successMsg}</span>
    </div>
  )}

  {errorMsg && (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm">
      <AlertCircle size={18} className="text-rose-600" />
      <span>{errorMsg}</span>
    </div>
  )}

  {/* 2-Column Catalog Forms */}
  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Create Product Form */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Add New Product</h3>
      <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Product Name (e.g. MacBook Pro)"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          disabled={createProductMutation.isPending}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
        />
        <input
          type="text"
          placeholder="Unique SKU (e.g. MBP-16)"
          value={newProductSku}
          onChange={(e) => setNewProductSku(e.target.value)}
          disabled={createProductMutation.isPending}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
        />
        <button 
          type="submit" 
          className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
          disabled={createProductMutation.isPending}
        >
          {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>

    {/* Create Store Form */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Add Store Location</h3>
        <form onSubmit={handleCreateStore} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Store Name (e.g. NY Flagship)"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            disabled={createStoreMutation.isPending}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
          />
          <button 
            type="submit" 
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
            disabled={createStoreMutation.isPending}
          >
            {createStoreMutation.isPending ? 'Adding...' : 'Add Store'}
          </button>
        </form>
      </div>
    </div>
  </div>

  {/* 2-Column Inventory Operations */}
  <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Adjust Stock Card */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-4 inline-flex items-center gap-2">
        <Edit size={16} className="text-emerald-600" />
        Adjust Inventory Quantity
      </h3>
      <form onSubmit={handleAdjustStock} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Select Store</label>
            <div className="relative">
              <select 
                value={adjStoreId} 
                onChange={(e) => setAdjStoreId(e.target.value)}
                disabled={adjustStockMutation.isPending}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
              >
                <option value="">-- Choose Store --</option>
                {stores && stores.length > 0 && stores.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Select Product</label>
            <div className="relative">
              <select 
                value={adjProductId} 
                onChange={(e) => setAdjProductId(e.target.value)}
                disabled={adjustStockMutation.isPending}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
              >
                <option value="">-- Choose Product --</option>
                {products && products.length > 0 && products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Adjustment Amount</label>
          <input
            type="number"
            placeholder="e.g. 50 or -5"
            value={adjAmount === 0 ? '' : adjAmount}
            onChange={(e) => setAdjAmount(Number(e.target.value))}
            disabled={adjustStockMutation.isPending}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
          />
        </div>

        <button 
          type="submit" 
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50"
          disabled={adjustStockMutation.isPending}
        >
          {adjustStockMutation.isPending ? 'Confirming...' : 'Confirm Adjustment'}
        </button>
      </form>
    </div>

    {/* Transfer Stock Card */}
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-4 inline-flex items-center gap-2">
        <ArrowRightLeft size={16} className="text-amber-600" />
        Transfer Stock Between Locations
      </h3>
      <form onSubmit={handleTransferStock} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Select Product</label>
          <div className="relative">
            <select 
              value={transProductId} 
              onChange={(e) => setTransProductId(e.target.value)}
              disabled={transferStockMutation.isPending}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            >
              <option value="">-- Choose Product --</option>
              {products && products.length > 0 && products.map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Source Store</label>
            <div className="relative">
              <select 
                value={transSourceStoreId} 
                onChange={(e) => setTransSourceStoreId(e.target.value)}
                disabled={transferStockMutation.isPending}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
              >
                <option value="">-- Source --</option>
                {stores && stores.length > 0 && stores.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Destination Store</label>
            <div className="relative">
              <select 
                value={transDestStoreId} 
                onChange={(e) => setTransDestStoreId(e.target.value)}
                disabled={transferStockMutation.isPending}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
              >
                <option value="">-- Destination --</option>
                {stores && stores.length > 0 && stores.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Transfer Quantity</label>
          <input
            type="number"
            placeholder="0"
            min="1"
            value={transQty === 0 ? '' : transQty}
            onChange={(e) => setTransQty(Number(e.target.value))}
            disabled={transferStockMutation.isPending}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
          />
        </div>

        <button 
          type="submit" 
          className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-500 active:scale-[0.99] disabled:opacity-50"
          disabled={transferStockMutation.isPending}
        >
          {transferStockMutation.isPending ? 'Transferring...' : 'Confirm Atomic Transfer'}
        </button>
      </form>
    </div>
  </div>

  {/* Stock Matrix Table Card */}
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Active Inventory Matrix</h2>
        <p className="text-xs text-slate-500">Cross-table overview mapping stock distributions per store</p>
      </div>

      <div className="flex gap-2 items-center w-full sm:max-w-xs">
        <input
          type="number"
          placeholder="Filter threshold..."
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
        {threshold && (
          <button 
            onClick={() => setThreshold('')} 
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>

    {isGlobalLoading ? (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="animate-spin text-sky-600" size={28} />
        <p className="text-sm text-slate-500">Loading active stock database...</p>
      </div>
    ) : products.length === 0 ? (
      <p className="text-center py-10 text-sm text-slate-500">No catalog products registered yet.</p>
    ) : (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="p-4">Product Name</th>
              <th className="p-4">SKU</th>
              {stores && stores.length > 0 && stores.map((s) => (
                <th key={s._id} className="p-4">{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {products && products.length > 0 && products.map((product) => {
              if (threshold.trim() !== '') {
                const matchesThreshold = stores.some(
                  (store) => getStockQty(product._id, store._id) <= Number(threshold)
                );
                if (!matchesThreshold) return null;
              }

              return (
                <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{product.name}</td>
                  <td className="p-4 font-mono text-xs text-slate-500">{product.sku}</td>
                  {stores && stores.length > 0 && stores.map((store) => {
                    const qty = getStockQty(product._id, store._id);
                    return (
                      <td key={store._id} className="p-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStockBadgeClass(qty)}`}>
                          {qty}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>
  )
}