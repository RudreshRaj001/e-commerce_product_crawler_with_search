import React, { useEffect, useState } from "react";
import { Search, ArrowLeft, ArrowRight, Star } from "lucide-react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    min_price: "",
    max_price: "",
    availability: "",
  });

  const [page, setPage] = useState(1);
  const limit = 10; // Number of products per page

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    const skip = (page - 1) * limit;
    const params = new URLSearchParams({ q: search, ...filters, skip, limit });

    try {
      const res = await fetch(`http://localhost:5000/api/products?${params}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search/filter
    fetchProducts();
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (products.length === limit) setPage((prev) => prev + 1);
  };

  // Function to display rating stars
  const renderRatingStars = (rating) => {
    if (!rating) return "N/A";
    
    return (
      <div className="flex items-center">
        <span className="mr-1">{rating}</span>
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 bg-gradient-to-b from-blue-50 to-gray-50 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 text-blue-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Product Search</h1>
        <p className="text-gray-600">Find the perfect products with our advanced search</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 p-3 pl-10 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          </div>

          {/* <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="border border-gray-300 p-3 rounded-lg shadow-sm w-full"
          >
            <option value="">All Categories</option>
            <option value="All Products">All Products</option>
            <option value="Grocery">Grocery</option>
            <option value="Personal Care">Personal Care</option>
          </select> */}

          {/* <select
            value={filters.availability}
            onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
            className="border border-gray-300 p-3 rounded-lg shadow-sm w-full"
          >
            <option value="">All Availability</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select> */}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.min_price}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, min_price: e.target.value }))
                }
                className="border border-gray-300 p-3 pl-6 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <span className="absolute left-3 top-3.5 text-gray-500">$</span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Max Price"
                value={filters.max_price}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, max_price: e.target.value }))
                }
                className="border border-gray-300 p-3 pl-6 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <span className="absolute left-3 top-3.5 text-gray-500">$</span>
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-medium flex items-center justify-center"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.length > 0 ? (
          products.map((product, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition duration-300 overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image_url || "/api/placeholder/400/320"}
                  alt={product.name}
                  className="w-full h-52 object-cover transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                  {product.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="font-bold text-gray-800 text-xl group-hover:text-blue-600 transition duration-200">
                    {product.name}
                  </h2>
                  <span className="font-bold text-lg bg-blue-600 text-white px-3 py-1 rounded-full">
                    ${product.price}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-amber-500">
                    {renderRatingStars(product.rating)}
                  </div>
                  <p className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800">
                    {product.availability ?? "Available"}
                  </p>
                </div>
                {/* <a
                  href={product.product_url}
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  View Product
                </a> */}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center">
            <p className="text-gray-500 text-lg">No products found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center shadow-sm transition duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Previous
        </button>
        <div className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium shadow-sm">
          Page {page}
        </div>
        <button
          onClick={handleNextPage}
          disabled={products.length < limit}
          className="px-5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center shadow-sm transition duration-200"
        >
          Next <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
