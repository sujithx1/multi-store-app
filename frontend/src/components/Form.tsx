import type { UseMutationResult } from "@tanstack/react-query";
import React, { useState } from "react";
import type { Product } from "../api/products";
import type { StoreType } from "../api/stores";

interface CatalogFormsProps {
  products: Product[];
  stores: StoreType[];
  createProductMutation: UseMutationResult<
    Product,
    any,
    { name: string; sku: string }
  >;
  createStoreMutation: UseMutationResult<StoreType, any, { name: string; location: string }>;
  addStockMutation: UseMutationResult<any, any, { productId: string; storeId: string; quantity: number }>;
  updateStockMutation: UseMutationResult<any, any, { productId: string; storeId: string; quantity: number }>;
  showError: (msg: string) => void;
}

export function CatalogForms({
  products,
  stores,
  createProductMutation,
  createStoreMutation,
  addStockMutation,
  updateStockMutation,
  showError,
}: CatalogFormsProps) {
  const [newProductName, setNewProductName] = useState("");
  const [newProductSku, setNewProductSku] = useState("");
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState(""); // State for location

  // Add stock state
  const [addStockStoreId, setAddStockStoreId] = useState("");
  const [addStockProductId, setAddStockProductId] = useState("");
  const [addStockQty, setAddStockQty] = useState<number>(0);

  // Update stock state
  const [updateStockStoreId, setUpdateStockStoreId] = useState("");
  const [updateStockProductId, setUpdateStockProductId] = useState("");
  const [updateStockQty, setUpdateStockQty] = useState<number>(0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductSku)
      return showError("Product Name and SKU are required");
    createProductMutation.mutate(
      { name: newProductName, sku: newProductSku },
      {
        onSuccess: () => {
          setNewProductName("");
          setNewProductSku("");
        },
      },
    );
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName || !newStoreLocation) 
      return showError("Store Name and Location are required");
    
    createStoreMutation.mutate(
      { name: newStoreName, location: newStoreLocation },
      {
        onSuccess: () => {
          setNewStoreName("");
          setNewStoreLocation("");
        },
      },
    );
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStockStoreId || !addStockProductId || addStockQty <= 0) {
      return showError("Please select store, product, and positive quantity");
    }
    addStockMutation.mutate(
      { storeId: addStockStoreId, productId: addStockProductId, quantity: addStockQty },
      {
        onSuccess: () => {
          setAddStockQty(0);
        }
      }
    );
  };

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateStockStoreId || !updateStockProductId || updateStockQty < 0) {
      return showError("Please select store, product, and non-negative quantity");
    }
    updateStockMutation.mutate(
      { storeId: updateStockStoreId, productId: updateStockProductId, quantity: updateStockQty },
      {
        onSuccess: () => {
          setUpdateStockQty(0);
        }
      }
    );
  };

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Add New Product */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Add New Product
          </h3>
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
              {createProductMutation.isPending ? "Adding..." : "Add Product"}
            </button>
          </form>
        </div>
      </div>

      {/* Add Store Location */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Add Store Location
          </h3>
          <form onSubmit={handleCreateStore} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Store Name (e.g. NY Flagship)"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              disabled={createStoreMutation.isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            />
            <input
              type="text"
              placeholder="Location/Address (e.g. Manhattan, NY)"
              value={newStoreLocation}
              onChange={(e) => setNewStoreLocation(e.target.value)}
              disabled={createStoreMutation.isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
              disabled={createStoreMutation.isPending}
            >
              {createStoreMutation.isPending ? "Adding..." : "Add Store"}
            </button>
          </form>
        </div>
      </div>

      {/* Add Initial Stock */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Initialize Stock
          </h3>
          <form onSubmit={handleAddStock} className="flex flex-col gap-4">
            <select
              value={addStockStoreId}
              onChange={(e) => setAddStockStoreId(e.target.value)}
              disabled={addStockMutation.isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            >
              <option value="">-- Select Store --</option>
              {stores && stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select
              value={addStockProductId}
              onChange={(e) => setAddStockProductId(e.target.value)}
              disabled={addStockMutation.isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            >
              <option value="">-- Select Product --</option>
              {products && products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </select>
            <input
              type="number"
              min="1"
              placeholder="Initial Qty"
              value={addStockQty === 0 ? "" : addStockQty}
              onChange={(e) => setAddStockQty(Number(e.target.value))}
              disabled={addStockMutation.isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
              disabled={addStockMutation.isPending}
            >
              {addStockMutation.isPending ? "Adding..." : "Add Stock"}
            </button>
          </form>
        </div>
      </div>

      {/* Direct Update Stock */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Direct Update Stock
          </h3>
          <form onSubmit={handleUpdateStock} className="flex flex-col gap-4">
            <select
              value={updateStockStoreId}
              onChange={(e) => setUpdateStockStoreId(e.target.value)}
              disabled={updateStockMutation.isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            >
              <option value="">-- Select Store --</option>
              {stores && stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select
              value={updateStockProductId}
              onChange={(e) => setUpdateStockProductId(e.target.value)}
              disabled={updateStockMutation.isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            >
              <option value="">-- Select Product --</option>
              {products && products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Absolute Qty"
              value={updateStockQty === 0 ? "" : updateStockQty}
              onChange={(e) => setUpdateStockQty(Number(e.target.value))}
              disabled={updateStockMutation.isPending}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
              disabled={updateStockMutation.isPending}
            >
              {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}