import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { createProduct, getProducts, type Product } from "../api/products";
import {
  adjustStock,
  getStocks,
  transferStock,
  type Stock,
} from "../api/stocks";
import { createStore, getStores, type StoreType } from "../api/stores";
import { CatalogForms } from "./Form";
import { InventoryOps } from "./Inventery";
import { StockMatrix } from "./stock";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [threshold, setThreshold] = useState<string>("");

  // Notification State
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg("");
    setTimeout(() => setErrorMsg(""), 5000);
  };

  // Queries
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<
    Product[]
  >({
    queryKey: ["products"],
    queryFn: getProducts,
  });
console.log('products',products)
  const { data: stores = [], isLoading: isLoadingStores } = useQuery<
    StoreType[]
  >({
    queryKey: ["stores"],
    queryFn: getStores,
  });

  const {
    data: stocks = [],
    isLoading: isLoadingStocks,
    isFetching: isFetchingStocks,
  } = useQuery<Stock[]>({
    queryKey: ["stocks", threshold],
    queryFn: () => getStocks(threshold),
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      showSuccess(`Product "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err: any) =>
      showError(
        err?.response?.data?.error || err.message || "Failed to create product",
      ),
  });

  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: (data) => {
      showSuccess(`Store "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err: any) =>
      showError(
        err?.response?.data?.error || err.message || "Failed to create store",
      ),
  });

  const adjustStockMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      showSuccess("Stock adjustment processed successfully");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err: any) =>
      showError(
        err?.response?.data?.error || err.message || "Failed to adjust stock",
      ),
  });

const transferStockMutation = useMutation({
    mutationFn: transferStock,
    onSuccess: (data) => {
      showSuccess(data.message || "Stock transfer completed successfully");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err: any) =>
      showError(
        err?.response?.data?.error || err.message || "Failed to transfer stock",
      ),
  });

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["stores"] });
    queryClient.invalidateQueries({ queryKey: ["stocks"] });
  };

  const isGlobalLoading =
    isLoadingProducts || isLoadingStores || isLoadingStocks;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 antialiased">
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin Control Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage catalog products, register stores, and run inventory stock
            actions
          </p>
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

      {/* Subcomponents */}
      <CatalogForms
        createProductMutation={createProductMutation}
        createStoreMutation={createStoreMutation}
        showError={showError}
      />

      <InventoryOps
        products={products}
        stores={stores}
        adjustStockMutation={adjustStockMutation}
        transferStockMutation={transferStockMutation}
        showError={showError}
      />

      <StockMatrix
        products={products}
        stores={stores}
        stocks={stocks}
        threshold={threshold}
        setThreshold={setThreshold}
        isGlobalLoading={isGlobalLoading}
      />
    </div>
  );
}
