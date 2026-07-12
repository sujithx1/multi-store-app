import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStores, createStore, updateStore, deleteStore, type StoreType } from "../api/stores";
import { Plus, Pencil, Trash, Search, ArrowUpDown, X, AlertCircle } from "lucide-react";

export default function StorePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof StoreType>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // modal visibility and editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);

  // track ID to confirm store deletion
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // input fields for creation / editing
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data: stores = [], isLoading } = useQuery<StoreType[]>({
    queryKey: ["stores"],
    queryFn: getStores,
  });

  const createMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      showSuccess("Store created successfully");
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      closeModal();
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to create store"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StoreType> }) =>
      updateStore(id, payload),
    onSuccess: () => {
      showSuccess("Store updated successfully");
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      closeModal();
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to update store"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      showSuccess("Store deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      setConfirmDeleteId(null);
    },
    onError: (err: any) => showError(err.friendlyMessage || "Failed to delete store"),
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
    setEditingStore(null);
    setName("");
    setLocation("");
    setIsModalOpen(true);
  };

  const openEditModal = (s: StoreType) => {
    setEditingStore(s);
    setName(s.name);
    setLocation(s.location);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      return showError("Store Name and Location are required");
    }

    const payload = {
      name,
      location,
    };

    if (editingStore) {
      updateMutation.mutate({ id: editingStore._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleSort = (field: keyof StoreType) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // filter and sort store records
  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  const sortedStores = [...filteredStores].sort((a, b) => {
    const valA = a[sortBy] ?? "";
    const valB = b[sortBy] ?? "";
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(sortedStores.length / itemsPerPage);
  const paginatedStores = sortedStores.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="bg-slate-50 min-h-screen p-6 antialiased">
      {/* page title and header controls */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Store Management</h1>
          <p className="text-sm text-slate-500">Configure retail branches, locations, and addresses.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition"
        >
          <Plus size={16} />
          <span>Add Store</span>
        </button>
      </div>

      {/* notification banner triggers */}
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

      {/* search utility */}
      <div className="mb-6 flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by store name or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
      </div>

      {/* stores records list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading stores...</div>
        ) : paginatedStores.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No stores registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("name")}>
                    Store Name <ArrowUpDown size={14} className="inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("location")}>
                    Location/Address <ArrowUpDown size={14} className="inline ml-1" />
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedStores.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-900">{s.name}</td>
                    <td className="p-4">{s.location}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1 text-slate-400 hover:text-sky-600 transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(s._id)}
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

        {/* pager layout */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs text-slate-500">
              Showing page {page} of {totalPages}
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
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* creation and update modal layout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingStore ? "Edit Store Details" : "Register New Retail Store"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NY Flagship"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Location / Address</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Broadway St, Manhattan, NY"
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
                  {createMutation.isPending || updateMutation.isPending ? "Processing..." : "Save Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* verify delete modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 overflow-hidden">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-2">Delete Store</h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you sure you want to delete this store 
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
