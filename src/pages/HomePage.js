import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../api/productsApi';
import { useCart } from '../context/CartContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Carousel from '../components/Carousel';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  // React to URL search params changes (q, category)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'all';
    setSearchQuery(q);
    setSelectedCategory(cat);

    const apply = async () => {
      try {
        setLoading(true);
        if (q && q.trim()) {
          const allProducts = await fetchProducts({ limit: 100, ...(cat !== 'all' ? { category: cat } : {}) });
          const filtered = allProducts.filter(p =>
            p.title.toLowerCase().includes(q.toLowerCase()) ||
            p.description.toLowerCase().includes(q.toLowerCase())
          );
          setProducts(filtered);
        } else {
          const params = cat === 'all' ? {} : { category: cat };
          const productsData = await fetchProducts(params);
          setProducts(productsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    apply();
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts({ limit: 20 }),
        fetchCategories()
      ]);
      setProducts(productsData);
      setCategories(['all', ...categoriesData]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory === 'all' ? {} : { category: selectedCategory };
      const productsData = await fetchProducts(params);
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      // Note: This would ideally be a server-side search
      // For demo purposes, we'll filter client-side
      const allProducts = await fetchProducts({ limit: 100 });
      const filteredProducts = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(filteredProducts);
      // Reflect query in URL
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      setSearchParams(params);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addItem(product);
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading size="large" text="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={loadProducts}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Carousel */}
      <Carousel />

      {/* Search and Filters */}
      <div className="mb-8" id="products">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button type="submit" className="rounded-l-none">
                Search
              </Button>
            </div>
          </form>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCategory(value);
              const params = {};
              if (searchQuery.trim()) params.q = searchQuery.trim();
              if (value && value !== 'all') params.category = value;
              setSearchParams(params);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <Link to={`/product/${product.id}`}>
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-contain mb-4 hover:scale-105 transition-transform duration-200"
              />
            </Link>
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                  {product.title}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary-600">
                  ${product.price}
                </span>
                <Button
                  onClick={() => handleAddToCart(product)}
                  size="small"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
          {searchQuery && (
            <Button
              onClick={() => {
                setSearchQuery('');
                loadProducts();
              }}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
