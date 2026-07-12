import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, type Product } from "../api/products";
import { getStores, type StoreType } from "../api/stores";
import {
  getStocks,
  addStock,
  adjustStock,
  updateStock,
  transferStock,
  type Stock
} from "../api/stocks";
import { Plus, ArrowLeftRight, Edit, Search, ArrowUpDown, RefreshCw } from "lucide-react";

export default function StockPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "actions">("inventory");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination states
  const [stockPage, setStockPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting states
  const [stockSortBy, setStockSortBy] = useState<"product" | "store" | "quantity">("product");
  const [stockSortOrder, setStockSortOrder] = useState<"asc" | "desc">("asc");

  // Form states
  // 1. Initialize Stock
  const [initStoreId, setInitStoreId] = useState("");
  const [initProductId, setInitProductId] = useState("");
  const [initQty, setInitQty] = useState<number>(0);

  // 2. Direct Update Stock
  const [upStoreId, setUpStoreId] = useState("");
  const [upProductId, setUpProductId] = useState("");
  const [upQty, setUpQty] = useState<number>(0);

  // 3. Adjust Stock
  const [adjStockId, setAdjStockId] = useState("");
  const [adjAmount, setAdjAmount] = useState<number>(0);

  // 4. Transfer Stock
  const [transProductId, setTransProductId] = useState("");
  const [transSourceStoreId, setTransSourceStoreId] = useState("");
  const [transDestStoreId, setTransDestStoreId] = useState("");
  const [transQty, setTransQty] = useState<number>(0);

  // Queries
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
      showSuccess("Stock initialized successfully");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setInitQty(0);
      setInitProductId("");
      setInitStoreId("");
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to initialize stock"),
  });

  const updateStockMutation = useMutation({
    mutationFn: updateStock,
    onSuccess: () => {
      showSuccess("Stock quantity updated successfully");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setUpQty(0);
      setUpProductId("");
      setUpStoreId("");
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to update stock"),
  });

  const adjustStockMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      showSuccess("Stock quantity adjusted successfully");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setAdjAmount(0);
      setAdjStockId("");
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to adjust stock"),
  });

  const transferStockMutation = useMutation({
    mutationFn: transferStock,
    onSuccess: () => {
      showSuccess("Stock transfer completed successfully");
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
  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initStoreId || !initProductId || initQty <= 0) {
      return showError("Please select store, product, and positive quantity");
    }
    addStockMutation.mutate({ storeId: initStoreId, productId: initProductId, quantity: initQty });
  };

  const handleUpdateStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upStoreId || !upProductId || upQty < 0) {
      return showError("Please select store, product, and valid quantity");
    }
    updateStockMutation.mutate({ storeId: upStoreId, productId: upProductId, quantity: upQty });
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjStockId || adjAmount === 0) {
      return showError("Please select stock item and non-zero amount");
    }
    const type = adjAmount > 0 ? "inc" : "dec";
    const quantity = Math.abs(adjAmount);
    adjustStockMutation.mutate({ stockId: adjStockId, quantity, type });
  };

  const handleTransferStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transProductId || !transSourceStoreId || !transDestStoreId || transQty <= 0) {
      return showError("Please fill all transfer fields");
    }

    if (transSourceStoreId === transDestStoreId) {
      return showError("Source and destination stores must be different");
    }

    // Client-side validation: check if available stock is sufficient
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

  // Helper to resolve product/store details from Stocks
  const getProductObj = (productId: string | { _id: string; name?: string; sku?: string; unit?: string }) => {
    if (typeof productId === "object") return productId;
    return products.find(p => p._id === productId);
  };

  const getStoreObj = (storeId: string | { _id: string; name?: string; location?: string }) => {
    if (typeof storeId === "object") return storeId;
    return stores.find(s => s._id === storeId);
  };

  // Quick Action triggers
  const triggerQuickAdjust = (stockId: string) => {
    setAdjStockId(stockId);
    setActiveTab("actions");
    document.getElementById("adjust-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const triggerQuickTransfer = (pId: string, sId: string) => {
    setTransProductId(pId);
    setTransSourceStoreId(sId);
    setActiveTab("actions");
    document.getElementById("transfer-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter & Sort Stocks list
  const filteredStocks = stocks.filter((s) => {
    const p = getProductObj(s.productId);
    const store = getStoreObj(s.storeId);
    const matchStr = `${p?.name || ""} ${p?.sku || ""} ${store?.name || ""}`.toLowerCase();
    return matchStr.includes(searchQuery.toLowerCase());
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let valA: any = "";
    let valB: any = "";

    if (stockSortBy === "product") {
      valA = getProductObj(a.productId)?.name || "";
      valB = getProductObj(b.productId)?.name || "";
    } else if (stockSortBy === "store") {
      valA = getStoreObj(a.storeId)?.name || "";
      valB = getStoreObj(b.storeId)?.name || "";
    } else {
      valA = a.quantity;
      valB = b.quantity;
    }

    if (typeof valA === "number" && typeof valB === "number") {
      return stockSortOrder === "asc" ? valA - valB : valB - valA;
    }
    return stockSortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const stockTotalPages = Math.ceil(sortedStocks.length / itemsPerPage);
  const paginatedStocks = sortedStocks.slice(
    (stockPage - 1) * itemsPerPage,
    stockPage * itemsPerPage
  );

  return (
    <div className="bg-slate-50 min-h-screen p-6 antialiased">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Management</h1>
          <p className="text-sm text-slate-500">Track and transfer inventory stock items across registered locations.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          <button
            onClick={() => { setActiveTab("inventory"); setSearchQuery(""); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "inventory" ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Stock List
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "actions" ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Add & Manage Stock
          </button>
        </div>
      </div>

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

      {/* SEARCH / FILTERS BAR */}
      {activeTab !== "actions" && (
        <div className="mb-6 flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search stock list..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setStockPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
        </div>
      )}

      {/* INVENTORY LIST TAB */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoadingStocks ? (
            <div className="p-8 text-center text-slate-500">Loading stock database...</div>
          ) : paginatedStocks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No active stock mappings registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => { setStockSortBy("product"); setStockSortOrder(stockSortOrder === "asc" ? "desc" : "asc"); }}>
                      Product <ArrowUpDown size={14} className="inline ml-1" />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => { setStockSortBy("store"); setStockSortOrder(stockSortOrder === "asc" ? "desc" : "asc"); }}>
                      Store Location <ArrowUpDown size={14} className="inline ml-1" />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => { setStockSortBy("quantity"); setStockSortOrder(stockSortOrder === "asc" ? "desc" : "asc"); }}>
                      Available Quantity <ArrowUpDown size={14} className="inline ml-1" />
                    </th>
                    <th className="p-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedStocks.map((s) => {
                    const p = getProductObj(s.productId);
                    const store = getStoreObj(s.storeId);
                    return (
                      <tr key={s._id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-medium text-slate-900">
                          <div>{p?.name || "Deleted Product"}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">SKU: {p?.sku || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{store?.name || "Deleted Store"}</div>
                          <div className="text-xs text-slate-400">{store?.location || ""}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                            s.quantity === 0 ? "bg-rose-50 text-rose-700" : s.quantity <= 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {s.quantity} {p?.unit || "pcs"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => triggerQuickAdjust(s._id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-500 border border-slate-200 rounded px-2 py-1 bg-white hover:bg-slate-50 transition"
                            >
                              <Edit size={12} />
                              <span>Adjust</span>
                            </button>
                            <button
                              onClick={() => triggerQuickTransfer(p?._id || "", store?._id || "")}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-500 border border-slate-200 rounded px-2 py-1 bg-white hover:bg-slate-50 transition"
                            >
                              <ArrowLeftRight size={12} />
                              <span>Transfer</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {stockTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">
                Showing page {stockPage} of {stockTotalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={stockPage === 1}
                  onClick={() => setStockPage(stockPage - 1)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={stockPage === stockTotalPages}
                  onClick={() => setStockPage(stockPage + 1)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIONS TAB */}
      {activeTab === "actions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Initialize Stock */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 inline-flex items-center gap-2">
              <Plus size={16} className="text-sky-600" />
              Initialize Stock
            </h3>
            <form onSubmit={handleAddStockSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Store</label>
                <select
                  value={initStoreId}
                  onChange={(e) => setInitStoreId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Store --</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Product</label>
                <select
                  value={initProductId}
                  onChange={(e) => setInitProductId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={initQty === 0 ? "" : initQty}
                  onChange={(e) => setInitQty(Number(e.target.value))}
                  placeholder="e.g. 50"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={addStockMutation.isPending}
                className="w-full rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition shadow-sm disabled:opacity-50"
              >
                {addStockMutation.isPending ? "Adding..." : "Add Stock"}
              </button>
            </form>
          </div>

          {/* Direct Update Stock */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 inline-flex items-center gap-2">
              <RefreshCw size={16} className="text-sky-600" />
              Direct Update Stock
            </h3>
            <form onSubmit={handleUpdateStockSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Store</label>
                <select
                  value={upStoreId}
                  onChange={(e) => setUpStoreId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Store --</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Product</label>
                <select
                  value={upProductId}
                  onChange={(e) => setUpProductId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Absolute Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={upQty === 0 ? "" : upQty}
                  onChange={(e) => setUpQty(Number(e.target.value))}
                  placeholder="e.g. 100"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={updateStockMutation.isPending}
                className="w-full rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition shadow-sm disabled:opacity-50"
              >
                {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
              </button>
            </form>
          </div>

          {/* Adjust Stock */}
          <div id="adjust-section" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 inline-flex items-center gap-2">
              <Edit size={16} className="text-emerald-600" />
              Adjust Stock Level
            </h3>
            <form onSubmit={handleAdjustStockSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Stock Item</label>
                <select
                  value={adjStockId}
                  onChange={(e) => setAdjStockId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Mapped Stock --</option>
                  {stocks.map(s => {
                    const p = getProductObj(s.productId);
                    const store = getStoreObj(s.storeId);
                    return (
                      <option key={s._id} value={s._id}>
                        {p?.name || "Product"} in {store?.name || "Store"} ({s.quantity} available)
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Adjustment Amount (+/-)</label>
                <input
                  type="number"
                  placeholder="e.g. 10 or -5"
                  value={adjAmount === 0 ? "" : adjAmount}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={adjustStockMutation.isPending}
                className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition shadow-sm disabled:opacity-50"
              >
                {adjustStockMutation.isPending ? "Confirming..." : "Confirm Adjustment"}
              </button>
            </form>
          </div>

          {/* Transfer Stock */}
          <div id="transfer-section" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 inline-flex items-center gap-2">
              <ArrowLeftRight size={16} className="text-amber-600" />
              Transfer Stock
            </h3>
            <form onSubmit={handleTransferStockSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Product</label>
                <select
                  value={transProductId}
                  onChange={(e) => setTransProductId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Source Store</label>
                <select
                  value={transSourceStoreId}
                  onChange={(e) => setTransSourceStoreId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Source --</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Destination Store</label>
                <select
                  value={transDestStoreId}
                  onChange={(e) => setTransDestStoreId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Choose Destination --</option>
                  {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Transfer Qty</label>
                <input
                  type="number"
                  min="1"
                  value={transQty === 0 ? "" : transQty}
                  onChange={(e) => setTransQty(Number(e.target.value))}
                  placeholder="Qty to transfer"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
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
      )}
    </div>
  );
}
