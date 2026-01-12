"use client";

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
    <div className="p-4 border rounded bg-white dark:bg-gray-800">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {companyName || "(No company)"}
          </h3>
          {projectName && (
            <div className="text-sm text-gray-600">{projectName}</div>
          )}
          {companyAddress && (
            <div className="text-sm mt-2 whitespace-pre-wrap">
              {companyAddress}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm">Invoice</div>
          <div className="text-xs text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th>Description</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Rate</th>
            <th className="text-right">GST%</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="py-2">{it.description || "-"}</td>
              <td className="py-2 text-right">{it.qty}</td>
              <td className="py-2 text-right">
                ₹{Number(it.rate || 0).toFixed(2)}
              </td>
              <td className="py-2 text-right">
                {it.isGSTExempt ? "Exempt" : `${it.gstPercent * 100}%`}
              </td>
              <td className="py-2 text-right">
                ₹{(Number(it.qty || 0) * Number(it.rate || 0)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right">
        <div className="text-sm">
          Subtotal: ₹{Number(subtotal || 0).toFixed(2)}
        </div>
        <div className="text-sm">GST: ₹{Number(gst || 0).toFixed(2)}</div>
        <div className="text-lg font-semibold">
          Total: ₹{Number(total || 0).toFixed(2)}
        </div>
      </div>

      {notes && (
        <div className="mt-4 text-sm text-gray-600">Notes: {notes}</div>
      )}
    </div>
  );
}
