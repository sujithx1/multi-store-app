import type { UseMutationResult } from "@tanstack/react-query";
import React, { useState } from "react";
import type { Product } from "../api/products";
import type { StoreType } from "../api/stores";

interface CatalogFormsProps {
  createProductMutation: UseMutationResult<
    Product,
    any,
    { name: string; sku: string }
  >;
  // Updated payload definition to include location
  createStoreMutation: UseMutationResult<StoreType, any, { name: string; location: string }>;
  showError: (msg: string) => void;
}

export function CatalogForms({
  createProductMutation,
  createStoreMutation,
  showError,
}: CatalogFormsProps) {
  const [newProductName, setNewProductName] = useState("");
  const [newProductSku, setNewProductSku] = useState("");
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState(""); // State for location

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
    // Validate both fields
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

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Add New Product */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
    </div>
  );
}