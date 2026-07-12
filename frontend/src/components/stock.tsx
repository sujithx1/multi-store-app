// import { Loader2 } from "lucide-react";
// import type { Product } from "../api/products";
// import type { Stock } from "../api/stocks";
// import type { StoreType } from "../api/stores";

// interface StockMatrixProps {
//   products: Product[];
//   stores: StoreType[];
//   stocks: Stock[];
//   threshold: string;
//   setThreshold: (val: string) => void;
//   isGlobalLoading: boolean;
// }

// export function StockMatrix({
//   products,
//   stores,
//   stocks,
//   threshold,
//   setThreshold,
//   isGlobalLoading,
// }: StockMatrixProps) {
//   const getStockQty = (productId: string, storeId: string) => {
//     const entry = stocks.find((s) => {
//       const pId =
//         typeof s.productId === "object" && s.productId
//           ? s.productId._id
//           : s.productId;
//       const sId =
//         typeof s.storeId === "object" && s.storeId ? s.storeId._id : s.storeId;
//       return pId === productId && sId === storeId;
//     });
//     return entry ? entry.quantity : 0;
//   };

//   const getStockBadgeClass = (qty: number) => {
//     if (qty === 0) return "bg-rose-50 text-rose-700 ring-rose-600/10";
//     if (qty <= 5) return "bg-amber-50 text-amber-700 ring-amber-600/10";
//     return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
//   };

//   return (
//     <div className="rounded-xl border border-slate-19slice(4,8)9 bg-white p-6 shadow-sm">
//       <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="text-lg font-bold text-slate-900">
//             Active Inventory Matrix
//           </h2>
//           <p className="text-xs text-slate-500">
//             Cross-table overview mapping stock distributions per store
//           </p>
//         </div>

//         <div className="flex gap-2 items-center w-full sm:max-w-xs">
//           <input
//             type="number"
//             placeholder="Filter threshold..."
//             value={threshold}
//             onChange={(e) => setThreshold(e.target.value)}
//             className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
//           />
//           {threshold && (
//             <button
//               onClick={() => setThreshold("")}
//               className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
//             >
//               Clear
//             </button>
//           )}
//         </div>
//       </div>

//       {isGlobalLoading ? (
//         <div className="flex flex-col items-center justify-center py-12 gap-2">
//           <Loader2 className="animate-spin text-sky-600" size={28} />
//           <p className="text-sm text-slate-500">
//             Loading active stock database...
//           </p>
//         </div>
//       ) : products.length === 0 ? (
//         <p className="text-center py-10 text-sm text-slate-500">
//           No catalog products registered yet.
//         </p>
//       ) : (
//         <div className="overflow-x-auto rounded-lg border border-slate-200">
//           <table className="w-full text-left border-collapse text-sm">
//             <thead>
//               <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                 <th className="p-4">Product Name</th>
//                 <th className="p-4">SKU</th>
//                 {stores && stores.length>0&& stores.map((s) => (
//                   <th key={s._id} className="p-4">
//                     {s.name}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-150">
//               {products&& products.length>0&& products.map((product) => {
//                 if (threshold.trim() !== "") {
//                   const matchesThreshold = stores.some(
//                     (store) =>
//                       getStockQty(product._id, store._id) <= Number(threshold),
//                   );
//                   if (!matchesThreshold) return null;
//                 }

//                 return (
//                   <tr
//                     key={product._id}
//                     className="hover:bg-slate-50 transition-colors"
//                   >
//                     <td className="p-4 font-medium text-slate-900">
//                       {product.name}
//                     </td>
//                     <td className="p-4 font-mono text-xs text-slate-500">
//                       {product.sku}
//                     </td>
//                     {stores&& stores.length>0&& stores.map((store) => {
//                       const qty = getStockQty(product._id, store._id);
//                       return (
//                         <td key={store._id} className="p-4">
//                           <span
//                             className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStockBadgeClass(qty)}`}
//                           >
//                             {qty}
//                           </span>
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
