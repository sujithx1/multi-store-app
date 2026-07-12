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
  const [threshold, setThreshold] = useState<string>("");

  // Creation States
  const [newProductName, setNewProductName] = useState("");
  const [newProductSku, setNewProductSku] = useState("");
  const [newStoreName, setNewStoreName] = useState("");

  // Adjustment States
  const [adjStoreId, setAdjStoreId] = useState("");
  const [adjProductId, setAdjProductId] = useState("");
  const [adjAmount, setAdjAmount] = useState<number>(0);

  // Transfer States
  const [transProductId, setTransProductId] = useState("");
  const [transSourceStoreId, setTransSourceStoreId] = useState("");
  const [transDestStoreId, setTransDestStoreId] = useState("");
  const [transQty, setTransQty] = useState<number>(0);

  // Status/Logs
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

  // Queries using TanStack Query
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<
    Product[]
  >({
    queryKey: ["products"],
    queryFn: getProducts,
  });

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
      setNewProductName("");
      setNewProductSku("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err: any) => {
      showError(
        err?.response?.data?.error || err.message || "Failed to create product",
      );
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: (data) => {
      showSuccess(`Store "${data.name}" created successfully`);
      setNewStoreName("");
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err: any) => {
      showError(
        err?.response?.data?.error || err.message || "Failed to create store",
      );
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      showSuccess("Stock adjustment processed successfully");
      setAdjAmount(0);
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err: any) => {
      showError(
        err?.response?.data?.error || err.message || "Failed to adjust stock",
      );
    },
  });

  const transferStockMutation = useMutation({
    mutationFn: transferStock,
    onSuccess: (data) => {
      showSuccess(data.message || "Stock transfer completed successfully");
      setTransQty(0);
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err: any) => {
      showError(
        err?.response?.data?.error || err.message || "Failed to transfer stock",
      );
    },
  });

  // Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductSku)
      return showError("Product Name and SKU are required");
    createProductMutation.mutate({ name: newProductName, sku: newProductSku });
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return showError("Store Name is required");
    createStoreMutation.mutate({ name: newStoreName });
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjStoreId || !adjProductId || adjAmount === 0) {
      return showError(
        "Please select store, product, and non-zero adjustment amount",
      );
    }
    adjustStockMutation.mutate({
      storeId: adjStoreId,
      productId: adjProductId,
      amount: adjAmount,
    });
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
    transferStockMutation.mutate({
      productId: transProductId,
      sourceStoreId: transSourceStoreId,
      destStoreId: transDestStoreId,
      quantity: transQty,
    });
  };

  const getStockQty = (productId: string, storeId: string) => {
    const entry = stocks.find((s) => {
      const pId =
        typeof s.productId === "object" && s.productId
          ? s.productId._id
          : s.productId;
      const sId =
        typeof s.storeId === "object" && s.storeId ? s.storeId._id : s.storeId;
      return pId === productId && sId === storeId;
    });
    return entry ? entry.quantity : 0;
  };

  const getStockBadgeClass = (qty: number) => {
    if (qty === 0) return "badge-out";
    if (qty <= 5) return "badge-low";
    return "badge-ok";
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["stores"] });
    queryClient.invalidateQueries({ queryKey: ["stocks"] });
  };

  const isGlobalLoading =
    isLoadingProducts || isLoadingStores || isLoadingStocks;

  return (
    <div className="container" style={{ paddingTop: "0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              marginBottom: "0.25rem",
            }}
          >
            Admin Control Center
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage catalog, register stores, and run stock operations
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
          }}
          disabled={isGlobalLoading || isFetchingStocks}
        >
          {isGlobalLoading || isFetchingStocks ? (
            <Loader2 size={16} className="spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid for Creations */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Create Product */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Plus size={18} color="var(--primary)" /> Add Product
          </h3>
          <form
            onSubmit={handleCreateProduct}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <input
              type="text"
              placeholder="Product Name (e.g. MacBook Pro)"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              disabled={createProductMutation.isPending}
            />
            <input
              type="text"
              placeholder="Unique SKU (e.g. MBP-16)"
              value={newProductSku}
              onChange={(e) => setNewProductSku(e.target.value)}
              disabled={createProductMutation.isPending}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? "Adding..." : "Add Product"}
            </button>
          </form>
        </div>

        {/* Create Store */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Plus size={18} color="var(--primary)" /> Add Store Location
          </h3>
          <form
            onSubmit={handleCreateStore}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <input
              type="text"
              placeholder="Store Name (e.g. NY Flagship)"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              disabled={createStoreMutation.isPending}
            />
            <div style={{ flexGrow: 1 }}></div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
              disabled={createStoreMutation.isPending}
            >
              {createStoreMutation.isPending ? "Adding..." : "Add Store"}
            </button>
          </form>
        </div>
      </div>

      {/* Stock Operations: Adjust & Transfer */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        {/* Adjust Stock Form */}
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Edit size={18} color="var(--accent-emerald)" /> Adjust Inventory
            Quantity
          </h3>
          <form
            onSubmit={handleAdjustStock}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                Select Store
              </label>
              <select
                value={adjStoreId}
                onChange={(e) => setAdjStoreId(e.target.value)}
                disabled={adjustStockMutation.isPending}
              >
                <option value="">-- Choose Store --</option>
                {stores.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                Select Product
              </label>
              <select
                value={adjProductId}
                onChange={(e) => setAdjProductId(e.target.value)}
                disabled={adjustStockMutation.isPending}
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                Adjustment Amount (e.g. +50 restock, -5 reduction)
              </label>
              <input
                type="number"
                placeholder="0"
                value={adjAmount === 0 ? "" : adjAmount}
                onChange={(e) => setAdjAmount(Number(e.target.value))}
                disabled={adjustStockMutation.isPending}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                background: "var(--accent-emerald)",
                marginTop: "0.5rem",
              }}
              disabled={adjustStockMutation.isPending}
            >
              {adjustStockMutation.isPending
                ? "Confirming..."
                : "Confirm Adjustment"}
            </button>
          </form>
        </div>

        {/* Transfer Stock Form */}
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <ArrowRightLeft size={18} color="var(--accent-amber)" /> Transfer
            Stock Between Locations
          </h3>
          <form
            onSubmit={handleTransferStock}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                Select Product
              </label>
              <select
                value={transProductId}
                onChange={(e) => setTransProductId(e.target.value)}
                disabled={transferStockMutation.isPending}
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.4rem",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Source Store
                </label>
                <select
                  value={transSourceStoreId}
                  onChange={(e) => setTransSourceStoreId(e.target.value)}
                  disabled={transferStockMutation.isPending}
                >
                  <option value="">-- Source --</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.4rem",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Destination Store
                </label>
                <select
                  value={transDestStoreId}
                  onChange={(e) => setTransDestStoreId(e.target.value)}
                  disabled={transferStockMutation.isPending}
                >
                  <option value="">-- Destination --</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                Transfer Quantity
              </label>
              <input
                type="number"
                placeholder="0"
                min="1"
                value={transQty === 0 ? "" : transQty}
                onChange={(e) => setTransQty(Number(e.target.value))}
                disabled={transferStockMutation.isPending}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                background: "var(--accent-amber)",
                color: "#0b0f19",
                marginTop: "0.5rem",
              }}
              disabled={transferStockMutation.isPending}
            >
              {transferStockMutation.isPending
                ? "Transferring..."
                : "Confirm Atomic Transfer"}
            </button>
          </form>
        </div>
      </div>

      {/* Stock Matrix Table */}
      <div
        className="glass-panel"
        style={{ padding: "2rem 1.5rem", marginBottom: "3rem" }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 600 }}>
              Active Inventory Matrix
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Cross-table showing stocks for each location
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              maxWidth: "300px",
            }}
          >
            <input
              type="number"
              placeholder="Filter low-stock (threshold)"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            />
            {threshold && (
              <button
                onClick={() => setThreshold("")}
                className="btn-secondary"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isGlobalLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "3rem",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <Loader2 className="spin" size={32} color="var(--primary)" />
            <p style={{ color: "var(--text-secondary)" }}>
              Loading inventory data...
            </p>
          </div>
        ) : products.length === 0 ? (
          <p
            style={{
              color: "var(--text-secondary)",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            No products available to show stock.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                minWidth: "600px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border-glass)",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  <th style={{ padding: "1rem 0.5rem" }}>Product Name</th>
                  <th style={{ padding: "1rem 0.5rem" }}>SKU</th>
                  {stores.map((s) => (
                    <th key={s._id} style={{ padding: "1rem 0.5rem" }}>
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 && products.map((product) => {
                  if (threshold.trim() !== "") {
                    const matchesThreshold = stores.some(
                      (store) =>
                        getStockQty(product._id, store._id) <=
                        Number(threshold),
                    );
                    if (!matchesThreshold) return null;
                  }

                  return (
                    <tr
                      key={product._id}
                      style={{
                        borderBottom: "1px solid var(--border-glass)",
                        fontSize: "0.95rem",
                      }}
                    >
                      <td style={{ padding: "1rem 0.5rem", fontWeight: 500 }}>
                        {product.name}
                      </td>
                      <td
                        style={{
                          padding: "1rem 0.5rem",
                          color: "var(--text-muted)",
                          fontFamily: "monospace",
                        }}
                      >
                        {product.sku}
                      </td>
                      {stores.map((store) => {
                        const qty = getStockQty(product._id, store._id);
                        return (
                          <td
                            key={store._id}
                            style={{ padding: "1rem 0.5rem" }}
                          >
                            <span
                              className={`badge ${getStockBadgeClass(qty)}`}
                            >
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
  );
}
