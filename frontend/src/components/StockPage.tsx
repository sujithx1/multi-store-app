import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, type Product } from "../api/products";
import { getStores, type StoreType } from "../api/stores";
import {
  getStocks,
  addStock,
  adjustStock,
  transferStock,
  type Stock
} from "../api/stocks";
import { Plus, ArrowLeftRight, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";

export default function StockPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // component input states for adding, adjusting, and transferring stock
  const [addStoreId, setAddStoreId] = useState("");
  const [addProductId, setAddProductId] = useState("");
  const [addQty, setAddQty] = useState<number>(0);

  const [adjStockId, setAdjStockId] = useState("");
  const [adjQty, setAdjQty] = useState<number>(0);

  const [transProductId, setTransProductId] = useState("");
  const [transSourceStoreId, setTransSourceStoreId] = useState("");
  const [transDestStoreId, setTransDestStoreId] = useState("");
  const [transQty, setTransQty] = useState<number>(0);

  // fetch data queries
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: stores = [] } = useQuery<StoreType[]>({
    queryKey: ["stores"],
    queryFn: getStores,
  });

  const { data: stocks = [], isLoading: isLoadingStocks } = useQuery<Stock[]>({
    queryKey: ["stocks"],
    queryFn: () => getStocks(),
  });

  // Mutations
  const addStockMutation = useMutation({
    mutationFn: addStock,
    onSuccess: () => {
      showSuccess("Stock added successfully");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setAddQty(0);
      setAddProductId("");
      setAddStoreId("");
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to add stock"),
  });

  const adjustStockMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      showSuccess("Stock level adjusted successfully");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setAdjQty(0);
      setAdjStockId("");
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to adjust stock"),
  });

  const transferStockMutation = useMutation({
    mutationFn: transferStock,
    onSuccess: () => {
      showSuccess("Stock transferred successfully");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setTransQty(0);
      setTransProductId("");
      setTransSourceStoreId("");
      setTransDestStoreId("");
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to transfer stock"),
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  // Handlers
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStoreId || !addProductId || addQty <= 0) {
      return showError("Please select store, product, and positive quantity");
    }
    addStockMutation.mutate({ storeId: addStoreId, productId: addProductId, quantity: addQty });
  };

  const handleAdjust = (type: "inc" | "dec") => {
    if (!adjStockId || adjQty <= 0) {
      return showError("Please select a stock item and specify positive quantity");
    }
    adjustStockMutation.mutate({ stockId: adjStockId, quantity: adjQty, type });
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transProductId || !transSourceStoreId || !transDestStoreId || transQty <= 0) {
      return showError("Please fill all transfer fields");
    }

    if (transSourceStoreId === transDestStoreId) {
      return showError("Source and destination stores must be different");
    }

    // make sure the source store has enough stock before sending the transfer request
    const sourceStock = stocks.find((s) => {
      const pId = typeof s.productId === "object" ? s.productId._id : s.productId;
      const sId = typeof s.storeId === "object" ? s.storeId._id : s.storeId;
      return pId === transProductId && sId === transSourceStoreId;
    });

    const availableQty = sourceStock ? sourceStock.quantity : 0;
    if (availableQty < transQty) {
      return showError(`Insufficient stock! Available: ${availableQty}, Requested: ${transQty}`);
    }

    transferStockMutation.mutate({
      productId: transProductId,
      sourceStoreId: transSourceStoreId,
      destStoreId: transDestStoreId,
      quantity: transQty,
    });
  };

  // lookup helpers to resolve store/product name details
  const getProductObj = (productId: string | { _id: string; name?: string; sku?: string }) => {
    if (typeof productId === "object") return productId;
    return products.find(p => p._id === productId);
  };

  const getStoreObj = (storeId: string | { _id: string; name?: string; location?: string }) => {
    if (typeof storeId === "object") return storeId;
    return stores.find(s => s._id === storeId);
  };

  // filter current stock rows based on active search text
  const filteredStocks = stocks.filter((s) => {
    const p = getProductObj(s.productId);
    const store = getStoreObj(s.storeId);
    const matchStr = `${p?.name || ""} ${p?.sku || ""} ${store?.name || ""}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-slate-50 min-h-screen p-6 antialiased">
      {/* Notifications */}
      {successMsg && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Stock List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Current Stock Levels</h2>
              <p className="text-sm text-slate-500">Overview of catalog products and quantities across store warehouses.</p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, SKU, or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 flex-1">
            {isLoadingStocks ? (
              <div className="p-8 text-center text-slate-500">Loading stock records...</div>
            ) : filteredStocks.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No stock records found.</div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Store Location</th>
                    <th className="p-4 text-right">Available Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStocks.map((s) => {
                    const p = getProductObj(s.productId);
                    const store = getStoreObj(s.storeId);
                    return (
                      <tr
                        key={s._id}
                        className="hover:bg-slate-50 cursor-pointer transition"
                        onClick={() => {
                          setAdjStockId(s._id);
                          setTransProductId(p?._id || "");
                          setTransSourceStoreId(store?._id || "");
                        }}
                      >
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">{p?.name || "Deleted Product"}</div>
                          <div className="text-xs text-slate-400 font-mono">SKU: {p?.sku || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{store?.name || "Deleted Store"}</div>
                          <div className="text-xs text-slate-400">{store?.location || ""}</div>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${
                            s.quantity === 0 ? "bg-rose-50 text-rose-700" : s.quantity <= 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {s.quantity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Stock Control Action Cards */}
        <div className="flex flex-col gap-6">
          {/* add new product/store stock association */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-sky-600" />
              Add Stock Mapping
            </h3>
            <form onSubmit={handleAddStock} className="flex flex-col gap-3">
              <select
                value={addStoreId}
                onChange={(e) => setAddStoreId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">-- Choose Store --</option>
                {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <select
                value={addProductId}
                onChange={(e) => setAddProductId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Initial Qty"
                value={addQty === 0 ? "" : addQty}
                onChange={(e) => setAddQty(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={addStockMutation.isPending}
                className="w-full rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition shadow-sm disabled:opacity-50"
              >
                {addStockMutation.isPending ? "Adding..." : "Add Stock"}
              </button>
            </form>
          </div>

          {/* increment or decrement mapped stock units */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-emerald-600" />
              Adjust Stock Level
            </h3>
            <div className="flex flex-col gap-3">
              <select
                value={adjStockId}
                onChange={(e) => setAdjStockId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">-- Choose Stock Item --</option>
                {stocks.map(s => {
                  const p = getProductObj(s.productId);
                  const store = getStoreObj(s.storeId);
                  return (
                    <option key={s._id} value={s._id}>
                      {p?.name || "Product"} in {store?.name || "Store"} ({s.quantity} qty)
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Quantity to Adjust"
                value={adjQty === 0 ? "" : adjQty}
                onChange={(e) => setAdjQty(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjust("inc")}
                  disabled={adjustStockMutation.isPending}
                  className="w-1/2 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  <ArrowUpRight size={14} />
                  <span>Increase</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjust("dec")}
                  disabled={adjustStockMutation.isPending}
                  className="w-1/2 flex items-center justify-center gap-1 rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition disabled:opacity-50"
                >
                  <ArrowDownRight size={14} />
                  <span>Decrease</span>
                </button>
              </div>
            </div>
          </div>

          {/* move stock units between different warehouses */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowLeftRight size={16} className="text-amber-600" />
              Transfer Stock
            </h3>
            <form onSubmit={handleTransfer} className="flex flex-col gap-3">
              <select
                value={transProductId}
                onChange={(e) => setTransProductId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
              </select>
              <select
                value={transSourceStoreId}
                onChange={(e) => setTransSourceStoreId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">-- Source Store --</option>
                {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <select
                value={transDestStoreId}
                onChange={(e) => setTransDestStoreId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">-- Destination Store --</option>
                {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty to Transfer"
                value={transQty === 0 ? "" : transQty}
                onChange={(e) => setTransQty(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={transferStockMutation.isPending}
                className="w-full rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition shadow-sm disabled:opacity-50"
              >
                {transferStockMutation.isPending ? "Transferring..." : "Confirm Transfer"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
