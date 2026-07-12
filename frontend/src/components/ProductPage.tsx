import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, createProduct, updateProduct, deleteProduct, type Product } from "../api/products";
import { Plus, Pencil, Trash, Search, X, AlertCircle } from "lucide-react";

export default function ProductPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  // modal visibility and active item state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // store id of selected item to confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // input values for creating or editing
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products", page, search],
    queryFn: () => getProducts({ page, limit, search }),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      showSuccess("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to create product"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      showSuccess("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      showSuccess("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setConfirmDeleteId(null);
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to delete product"),
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setSku("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      return showError("Product Name and SKU are required");
    }

    const payload = {
      name,
      sku: sku.toUpperCase()
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6 antialiased">
      {/* page title and header actions */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
          <p className="text-sm text-slate-500">Configure catalog details, SKUs, and items availability.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* display success or error messages */}
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

      {/* input field for search filtering */}
      <div className="mb-6 flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
      </div>

      {/* products catalog list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product ID</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-900">{p.name}</td>
                    <td className="p-4 font-mono text-xs font-semibold text-slate-600">{p.sku}</td>
                    <td className="p-4 text-xs text-slate-450">{p._id.slice(4,8)}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 text-slate-400 hover:text-sky-600 transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(p._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* table paginator controls */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs text-slate-500">
            Page {page}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={products.length < limit}
              onClick={() => setPage(page + 1)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* create or edit form overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? "Edit Product Details" : "Register New Product"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MacBook Pro"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Unique SKU</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. MBP-16"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-1/2 rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 transition shadow-sm disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Processing..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* confirm delete prompt */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 overflow-hidden">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-2">Delete Product</h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you sure you want to delete this product? 
                
              </p>  
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="w-1/2 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(confirmDeleteId)}
                  disabled={deleteMutation.isPending}
                  className="w-1/2 rounded-lg bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-500 transition shadow-sm disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
