import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Star, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterCategory]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = async (productId, size = null, color = null) => {
    const sessionId = localStorage.getItem('cart_session_id') || generateSessionId();
    localStorage.setItem('cart_session_id', sessionId);

    try {
      await axios.post(`${API}/cart/add`, {
        session_id: sessionId,
        product_id: productId,
        quantity: 1,
        size: size,
        color: color
      });
      // Could add toast notification here
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding item to cart');
    }
  };

  const generateSessionId = () => {
    return 'cart_' + Math.random().toString(36).substr(2, 9);
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'apparel': 'Apparel',
      'accessories': 'Accessories',
      'other': 'Other'
    };
    return categoryLabels[category] || category;
  };

  // Sample products based on your merchandise catalog
  const sampleProducts = [
    {
      id: '1',
      name: 'ICAA Logo Hat',
      description: 'A white cap with the "ICAA" logo embroidered.',
      category: 'apparel',
      price: 26,
      image_url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d',
      sizes_available: ['One Size'],
      colors_available: ['White'],
      stock_quantity: 50
    },
    {
      id: '2',
      name: 'Black Hoodie',
      description: 'A black hoodie with a white "ICAA" logo on the chest.',
      category: 'apparel',
      price: 55,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7',
      sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
      colors_available: ['Black'],
      stock_quantity: 30
    },
    {
      id: '3',
      name: "Men's Black Premium Polo",
      description: 'A black polo shirt with an embroidered "ICAA" logo.',
      category: 'apparel',
      price: 30,
      image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990',
      sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
      colors_available: ['Black'],
      stock_quantity: 25
    },
    {
      id: '4',
      name: "Men's White Premium Polo",
      description: 'A white polo shirt with an embroidered "ICAA" logo.',
      category: 'apparel',
      price: 30,
      image_url: 'https://images.unsplash.com/photo-1618354691321-1ce8c1b6c5b1',
      sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
      colors_available: ['White'],
      stock_quantity: 25
    },
    {
      id: '5',
      name: 'ICAA Water Bottle',
      description: 'Plastic water bottle featuring the "ICAA" logo.',
      category: 'accessories',
      price: 21,
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8',
      sizes_available: null,
      colors_available: ['Clear'],
      stock_quantity: 100
    },
    {
      id: '6',
      name: '415ndearborn Shirt',
      description: 'A black t-shirt with a graphic design and "415NDEARBORN" text.',
      category: 'apparel',
      price: 25,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
      colors_available: ['Black'],
      stock_quantity: 40
    },
    {
      id: '7',
      name: '415ndearborn Hoodie',
      description: 'A black hoodie with a graphic design and "415NDEARBORN" text.',
      category: 'apparel',
      price: 55,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7',
      sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
      colors_available: ['Black'],
      stock_quantity: 20
    }
  ];

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : (products.length === 0 ? sampleProducts.filter(product => {
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) : []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'League Spartan' }}>
            ICAA Shop
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Show your ICAA pride with our exclusive merchandise collection. Support the alumni community while representing your connection to i.c.stars.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="products-search"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Link to="/shop/cart">
              <Button className="bg-red-600 hover:bg-red-700 w-full md:w-auto">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
            <p className="text-lg text-gray-600">
              Premium ICAA merchandise to show your alumni pride and support the community.
            </p>
          </div>

          {displayProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayProducts.map((product, index) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300" data-testid={`product-${index}`}>
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 left-4 bg-white text-gray-800">
                      {getCategoryLabel(product.category)}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-600">${product.price}</span>
                      {product.stock_quantity > 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Size and Color Info */}
                    <div className="space-y-2 mb-4">
                      {product.sizes_available && product.sizes_available.length > 0 && (
                        <div className="text-xs text-gray-600">
                          <strong>Sizes:</strong> {product.sizes_available.join(', ')}
                        </div>
                      )}
                      {product.colors_available && product.colors_available.length > 0 && (
                        <div className="text-xs text-gray-600">
                          <strong>Colors:</strong> {product.colors_available.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/shop/product/${product.id}`} className="flex-1">
                        <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock_quantity === 0}
                        data-testid={`add-to-cart-${product.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
              <p className="text-gray-500">
                {products.length === 0 
                  ? "No products available at the moment. Check back soon!"
                  : "No products match your current search criteria."
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Shop with ICAA?</h2>
            <p className="text-lg text-gray-600">
              Quality merchandise that supports our alumni community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
              <p className="text-gray-600">
                High-quality materials and professional embroidery for lasting durability and comfort.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Support the Community</h3>
              <p className="text-gray-600">
                Every purchase supports ICAA programs, events, and alumni initiatives.
              </p>
            </div>

            <div className="text-center p-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_alumni-hub-28/artifacts/33jxbg83_5.png" 
                alt="ICAA Community" 
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-3">Alumni Pride</h3>
              <p className="text-gray-600">
                Show your connection to the ICAA community and i.c.stars program with pride.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Shop?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Browse our collection and find the perfect ICAA merchandise to show your alumni pride.
          </p>
          <Link to="/shop/cart">
            <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              View Your Cart
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;