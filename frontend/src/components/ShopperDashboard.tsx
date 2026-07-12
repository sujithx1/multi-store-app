import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, Loader2, Package, RefreshCw, Store } from "lucide-react";
import { useState } from "react";
import { getProducts, type Product } from "../api/products";
import { getStocks, type Stock } from "../api/stocks";
import { getStores, type StoreType } from "../api/stores";

export default function ShopperDashboard() {
  const queryClient = useQueryClient();
  const [threshold, setThreshold] = useState<string>("");

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

  // Helper to find stock for a specific product and store
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
    <div className="container" style={{ paddingTop: "1rem" }}>
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
            Product Stock Catalog
          </h1>
      
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

      <div
        className="glass-panel"
        style={{
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
          }}
        >
          <Filter size={18} />
          <span style={{ fontWeight: 500 }}>Filter Catalog:</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flex: 1,
            maxWidth: "400px",
          }}
        >
          <input
            type="number"
            placeholder="Max stock threshold (e.g. 5)"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            style={{ padding: "0.5rem 1rem" }}
          />
          {threshold && (
            <button
              onClick={() => setThreshold("")}
              className="btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {isGlobalLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "5rem",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Loader2 className="spin" size={40} color="var(--primary)" />
          <p style={{ color: "var(--text-secondary)" }}>
            Loading catalog availability...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <Package size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <h3>No Products Found</h3>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {products&&products.length>0&& products.map((product) => {
            // If threshold is set, let's see if this product has stock matching the criteria.
            // If all stores for this product have stock > threshold, we filter it out (hide card).
            if (threshold.trim() !== "") {
              const matchesThreshold = stores.some(
                (store) =>
                  getStockQty(product._id, store._id) <= Number(threshold),
              );
              if (!matchesThreshold) return null;
            }

            return (
              <div
                key={product._id}
                className="glass-panel glass-card"
                style={{ padding: "1.75rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1.25rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {product.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        fontFamily: "monospace",
                      }}
                    >
                      SKU: {product.sku}
                    </span>
                  </div>
                  <div
                    style={{
                      background: "var(--primary-glow)",
                      padding: "0.5rem",
                      borderRadius: "8px",
                    }}
                  >
                    <Package size={20} color="var(--primary)" />
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border-glass)",
                    paddingTop: "1rem",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Store size={14} /> Availability
                  </h4>

                  {stores.length === 0 ? (
                    <p
                      style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}
                    >
                      No stores registered.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      {stores.map((store) => {
                        const qty = getStockQty(product._id, store._id);
                        return (
                          <div
                            key={store._id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.95rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {store.name}
                            </span>
                            <span
                              className={`badge ${getStockBadgeClass(qty)}`}
                            >
                              {qty} in stock
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
