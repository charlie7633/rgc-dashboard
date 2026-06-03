// TODO: Wire up to real data once dataset arrives
// Update lib/data.ts loadProducts() to parse the actual dataset files

export default function ProductsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Products</h1>
      <p className="text-sm text-gray-500 mb-6">Product list and ratings</p>
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-400 font-medium">Awaiting dataset</p>
        <p className="mt-1 text-sm text-gray-300">
          Wire up <code>lib/data.ts</code> → <code>loadProducts()</code>
        </p>
      </div>
    </div>
  );
}
