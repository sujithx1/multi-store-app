import { useState } from "react";
import ProductPage from "./ProductPage";
import StorePage from "./StorePage";
import StockPage from "./StockPage";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"products" | "stocks" | "stores">("products");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 antialiased">
      {/* <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Stock ManageMent
          </h1>
        </div>
      </div> */}

      {/* <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "products"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <span>Products Section</span>
        </button>

        <button
          onClick={() => setActiveTab("stores")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "stores"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <span>Store Section</span>
        </button>

        <button
          onClick={() => setActiveTab("stocks")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "stocks"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <span>Stock Section</span>
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "products" && <ProductPage />}
        {activeTab === "stores" && <StorePage />}
        {activeTab === "stocks" && <StockPage />}
      </div> */}
    </div>
  );
}
