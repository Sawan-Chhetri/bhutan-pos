// "use client";

// export default function InvoicePreview({ invoice }) {
//   const {
//     companyName,
//     projectName,
//     companyAddress,
//     gstNumber,
//     items,
//     subtotal,
//     gst,
//     total,
//     notes,
//   } = invoice;

//   return (
//     <div className="p-4 border rounded bg-white dark:bg-gray-800">
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h3 className="text-lg font-semibold">
//             {companyName || "(No company)"}
//           </h3>
//           {projectName && (
//             <div className="text-sm text-gray-600">{projectName}</div>
//           )}
//           {companyAddress && (
//             <div className="text-sm mt-2 whitespace-pre-wrap">
//               {companyAddress}
//             </div>
//           )}
//         </div>

//         <div className="text-right">
//           <div className="text-sm">Invoice</div>
//           <div className="text-xs text-gray-500">
//             {new Date().toLocaleDateString()}
//           </div>
//         </div>
//       </div>

//       <table className="w-full text-sm">
//         <thead>
//           <tr className="text-left text-xs text-gray-500">
//             <th>Description</th>
//             <th className="text-right">Qty</th>
//             <th className="text-right">Rate</th>
//             <th className="text-right">GST%</th>
//             <th className="text-right">Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((it) => (
//             <tr key={it.id} className="border-t">
//               <td className="py-2">{it.description || "-"}</td>
//               <td className="py-2 text-right">{it.qty}</td>
//               <td className="py-2 text-right">
//                 Nu. {Number(it.rate || 0).toFixed(2)}
//               </td>
//               <td className="py-2 text-right">
//                 {it.isGSTExempt ? "Exempt" : `${it.gstPercent * 100}%`}
//               </td>
//               <td className="py-2 text-right">
//                 Nu. {(Number(it.qty || 0) * Number(it.rate || 0)).toFixed(2)}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="mt-4 text-right">
//         <div className="text-sm">
//           Subtotal: Nu. {Number(subtotal || 0).toFixed(2)}
//         </div>
//         <div className="text-sm">GST: Nu. {Number(gst || 0).toFixed(2)}</div>
//         <div className="text-lg font-semibold">
//           Total: Nu. {Number(total || 0).toFixed(2)}
//         </div>
//       </div>

//       {notes && (
//         <div className="mt-4 text-sm text-gray-600">Notes: {notes}</div>
//       )}
//     </div>
//   );
// }

"use client";
import { FiHash, FiCalendar, FiMapPin } from "react-icons/fi";

export default function InvoicePreview({ invoice }) {
  const {
    companyName,
    projectName,
    companyAddress,
    gstNumber,
    items,
    subtotal,
    gst,
    total,
    notes,
  } = invoice;

  return (
    <div className="bg-white dark:bg-gray-900 w-full rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300">
      {/* Pink Identity Bar */}
      <div className="h-3 bg-brand-pink w-full" />

      <div className="p-8 md:p-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase mb-2">
              {companyName || "DRAFT DOCUMENT"}
            </h3>
            {companyAddress && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed flex items-start gap-2 max-w-xs">
                <FiMapPin className="shrink-0 mt-0.5 text-brand-pink" />
                {companyAddress}
              </p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 min-w-[200px] text-right">
            <h4 className="text-[10px] font-black text-brand-pink uppercase tracking-widest mb-2">
              Proforma Invoice
            </h4>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Generated:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden mb-12">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Description
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Qty
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Rate
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {it.description || "—"}
                    </p>
                    <p className="text-[9px] font-black text-brand-pink uppercase mt-1 tracking-widest">
                      {it.isGSTExempt ? "Exempted Item" : "Taxable (5%)"}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-gray-500 font-mono text-right">
                    {it.qty}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-gray-600 dark:text-gray-400 font-mono text-right">
                    {Number(it.unitPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-gray-900 dark:text-white font-mono text-right">
                    {(Number(it.qty || 0) * Number(it.unitPrice || 0)).toFixed(
                      2
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-end">
          <div className="w-full md:w-64 space-y-3">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
              <span>Subtotal</span>
              <span className="font-mono">
                Nu. {Number(subtotal || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
              <span>GST</span>
              <span className="font-mono">
                Nu. {Number(gst || 0).toFixed(2)}
              </span>
            </div>
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-black text-brand-pink uppercase tracking-widest">
                Payable Nu.
              </span>
              <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter font-mono">
                {Number(total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Additional Notes
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
              &quot;{notes}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
