import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Star, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { sampleProducts } from '../data/sampleProducts';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${productId}`);
      setProduct(response.data);
      // Set default selections
      if (response.data.sizes_available && response.data.sizes_available.length > 0) {
        setSelectedSize(response.data.sizes_available[0]);
      }
      if (response.data.colors_available && response.data.colors_available.length > 0) {
        setSelectedColor(response.data.colors_available[0]);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      // Try to find product in sample data as fallback
      const sampleProduct = sampleProducts.find(p => p.id === productId);
      if (sampleProduct) {
        setProduct(sampleProduct);
        // Set default selections for sample product
        if (sampleProduct.sizes_available && sampleProduct.sizes_available.length > 0) {
          setSelectedSize(sampleProduct.sizes_available[0]);
        }
        if (sampleProduct.colors_available && sampleProduct.colors_available.length > 0) {
          setSelectedColor(sampleProduct.colors_available[0]);
        }
        setError(null); // Clear error since we found the product in samples
      } else {
        setError('Product not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    const sessionId = localStorage.getItem('cart_session_id') || generateSessionId();
    localStorage.setItem('cart_session_id', sessionId);

    try {
      await axios.post(`${API}/cart/add`, {
        session_id: sessionId,
        product_id: productId,
        quantity: quantity,
        size: selectedSize || null,
        color: selectedColor || null
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for could not be found.'}</p>
          <Link to="/shop">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <div className="container py-6">
        <Link to="/shop" className="inline-flex items-center text-red-600 hover:text-red-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Link>
      </div>

      {/* Product Details */}
      <section className="pb-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div>
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-xl"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-4">{getCategoryLabel(product.category)}</Badge>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <p className="text-3xl font-bold text-red-600">${product.price}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Size Selection */}
              {product.sizes_available && product.sizes_available.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size *
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes_available.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Selection */}
              {product.colors_available && product.colors_available.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors_available.map((color) => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 bg-gray-100 rounded-md font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                {product.stock_quantity > 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {product.stock_quantity} in stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Out of stock
                  </Badge>
                )}
              </div>

              {/* Add to Cart / Shop on Printful */}
              <div className="pt-6">
                {product.printful_url ? (
                  <a 
                    href={product.printful_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-lg py-6">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Shop on Printful - ${(product.price * quantity).toFixed(2)}
                    </Button>
                  </a>
                ) : (
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                    onClick={addToCart}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - ${(product.price * quantity).toFixed(2)}
                  </Button>
                )}
              </div>

              {/* Product Features */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Product Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="w-4 h-4 text-red-600 mr-2" />
                    Premium quality materials
                  </li>
                  <li className="flex items-center">
                    <Star className="w-4 h-4 text-red-600 mr-2" />
                    Professional ICAA logo embroidery
                  </li>
                  <li className="flex items-center">
                    <Star className="w-4 h-4 text-red-600 mr-2" />
                    Supports ICAA alumni programs
                  </li>
                  <li className="flex items-center">
                    <Star className="w-4 h-4 text-red-600 mr-2" />
                    Durable construction for long-lasting wear
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailsPage;