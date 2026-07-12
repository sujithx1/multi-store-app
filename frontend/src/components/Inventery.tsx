import type { UseMutationResult } from "@tanstack/react-query";
import { ArrowRightLeft, Edit } from "lucide-react";
import React, { useState } from "react";
import type { Product } from "../api/products";
import type { StoreType } from "../api/stores";

interface InventoryOpsProps {
  products: Product[];
  stores: StoreType[];
  adjustStockMutation: UseMutationResult<
    any,
    any,
    { storeId: string; productId: string; amount: number }
  >;
  transferStockMutation: UseMutationResult<
    any,
    any,
    {
      productId: string;
      sourceStoreId: string;
      destStoreId: string;
      quantity: number;
    }
  >;
  showError: (msg: string) => void;
}

export function InventoryOps({
  products,
  stores,
  adjustStockMutation,
  transferStockMutation,
  showError,
}: InventoryOpsProps) {
  // Adjustment local state
  const [adjStoreId, setAdjStoreId] = useState("");
  const [adjProductId, setAdjProductId] = useState("");
  const [adjAmount, setAdjAmount] = useState<number>(0);

  // Transfer local state
  const [transProductId, setTransProductId] = useState("");
  const [transSourceStoreId, setTransSourceStoreId] = useState("");
  const [transDestStoreId, setTransDestStoreId] = useState("");
  const [transQty, setTransQty] = useState<number>(0);

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjStoreId || !adjProductId || adjAmount === 0) {
      return showError(
        "Please select store, product, and non-zero adjustment amount",
      );
    }
    adjustStockMutation.mutate(
      { storeId: adjStoreId, productId: adjProductId, amount: adjAmount },
      { onSuccess: () => setAdjAmount(0) },
    );
  };

  const handleTransferStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !transProductId ||
      !transSourceStoreId ||
      !transDestStoreId ||
      transQty <= 0
    ) {
      return showError(
        "Please specify product, different stores, and a positive quantity",
      );
    }
    if (transSourceStoreId === transDestStoreId) {
      return showError("Source and destination stores must be different");
    }
    transferStockMutation.mutate(
      {
        productId: transProductId,
        sourceStoreId: transSourceStoreId,
        destStoreId: transDestStoreId,
        quantity: transQty,
      },
      { onSuccess: () => setTransQty(0) },
    );
  };

  return (
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
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Select Store
              </label>
              <div className="relative">
                <select
                  value={adjStoreId}
                  onChange={(e) => setAdjStoreId(e.target.value)}
                  disabled={adjustStockMutation.isPending}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
                >
                  <option value="">-- Choose Store --</option>
                  {stores&& stores.length>0&&stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Select Product
              </label>
              <div className="relative">
                <select
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  disabled={adjustStockMutation.isPending}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
                >
                  <option value="">-- Choose Product --</option>
                  {products&&products.length>0&&products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Adjustment Amount
            </label>
            <input
              type="number"
              placeholder="e.g. 50 or -5"
              value={adjAmount === 0 ? "" : adjAmount}
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
            {adjustStockMutation.isPending
              ? "Confirming..."
              : "Confirm Adjustment"}
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
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Select Product
            </label>
            <div className="relative">
              <select
                value={transProductId}
                onChange={(e) => setTransProductId(e.target.value)}
                disabled={transferStockMutation.isPending}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
              >
                <option value="">-- Choose Product --</option>
                {products&&products.length>0&&products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Source Store
              </label>
              <div className="relative">
                <select
                  value={transSourceStoreId}
                  onChange={(e) => setTransSourceStoreId(e.target.value)}
                  disabled={transferStockMutation.isPending}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
                >
                  <option value="">-- Source --</option>
                  {stores&&stores.length>0&&stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Destination Store
              </label>
              <div className="relative">
                <select
                  value={transDestStoreId}
                  onChange={(e) => setTransDestStoreId(e.target.value)}
                  disabled={transferStockMutation.isPending}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
                >
                  <option value="">-- Destination --</option>
                  {stores && stores.length>0 && stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Transfer Quantity
            </label>
            <input
              type="number"
              placeholder="0"
              min="1"
              value={transQty === 0 ? "" : transQty}
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
            {transferStockMutation.isPending
              ? "Transferring..."
              : "Confirm Atomic Transfer"}
          </button>
        </form>
      </div>
    </div>
  );
}
