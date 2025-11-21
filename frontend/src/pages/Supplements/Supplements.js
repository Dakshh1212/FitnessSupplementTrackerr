import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Heart, 
  Info, 
  DollarSign, 
  Award, 
  Shield, 
  Zap, 
  Target, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  X, 
  Plus, 
  Minus, 
  Eye, 
  ArrowRight, 
  Package, 
  Truck, 
  RefreshCw, 
  AlertTriangle, 
  ThumbsUp, 
  MessageCircle, 
  Calendar, 
  Bookmark,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Supplements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const categories = [
    { id: 'all', name: 'All Supplements', icon: Package, count: 48 },
    { id: 'protein', name: 'Protein Powder', icon: Zap, count: 12 },
    { id: 'creatine', name: 'Creatine', icon: Target, count: 8 },
    { id: 'vitamins', name: 'Vitamins & Minerals', icon: Shield, count: 15 },
    { id: 'pre-workout', name: 'Pre-Workout', icon: Clock, count: 6 },
    { id: 'post-workout', name: 'Post-Workout', icon: RefreshCw, count: 4 },
    { id: 'fat-burners', name: 'Fat Burners', icon: TrendingUp, count: 3 }
  ];

  const brands = [
    { id: 'all', name: 'All Brands' },
    { id: 'optimum', name: 'Optimum Nutrition' },
    { id: 'dymatize', name: 'Dymatize' },
    { id: 'muscletech', name: 'MuscleTech' },
    { id: 'bsn', name: 'BSN' },
    { id: 'cellucor', name: 'Cellucor' },
    { id: 'universal', name: 'Universal Nutrition' }
  ];

  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: 'budget', name: 'Budget Friendly ($10-30)' },
    { id: 'mid', name: 'Mid Range ($30-60)' },
    { id: 'premium', name: 'Premium ($60+)' }
  ];

  const sortOptions = [
    { id: 'popularity', name: 'Most Popular' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'newest', name: 'Newest First' }
  ];

  const [supplements] = useState([
    // Protein Powders
    {
      id: 1,
      name: 'Whey Protein Isolate',
      brand: 'Optimum Nutrition',
      category: 'protein',
      price: 45.99,
      originalPrice: 59.99,
      rating: 4.8,
      reviews: 2847,
      image: '/api/placeholder/300/300',
      description: 'Fast-absorbing whey protein isolate with 25g protein per serving',
      benefits: ['Muscle Growth', 'Recovery', 'Lean Mass'],
      ingredients: ['Whey Protein Isolate', 'Natural Flavors', 'Lecithin'],
      servings: 30,
      flavor: 'Vanilla',
      sideEffects: 'Generally well tolerated. May cause digestive issues in lactose intolerant individuals.',
      dosage: '1 scoop (30g) mixed with 6-8 oz of water or milk',
      timing: 'Post-workout or between meals',
      budgetFriendly: false,
      featured: true,
      inStock: true,
      fastShipping: true
    },
    {
      id: 2,
      name: 'Plant-Based Protein',
      brand: 'Universal Nutrition',
      category: 'protein',
      price: 28.99,
      originalPrice: 35.99,
      rating: 4.5,
      reviews: 1234,
      image: '/api/placeholder/300/300',
      description: 'Complete plant-based protein blend with 22g protein per serving',
      benefits: ['Muscle Growth', 'Vegan Friendly', 'Digestive Health'],
      ingredients: ['Pea Protein', 'Rice Protein', 'Hemp Protein', 'Natural Flavors'],
      servings: 25,
      flavor: 'Chocolate',
      sideEffects: 'Minimal side effects. May cause mild bloating initially.',
      dosage: '1 scoop (32g) mixed with 8-10 oz of plant milk',
      timing: 'Post-workout or as a meal replacement',
      budgetFriendly: true,
      featured: false,
      inStock: true,
      fastShipping: true
    },
    {
      id: 3,
      name: 'Casein Protein',
      brand: 'Dymatize',
      category: 'protein',
      price: 52.99,
      originalPrice: 65.99,
      rating: 4.7,
      reviews: 987,
      image: '/api/placeholder/300/300',
      description: 'Slow-digesting casein protein perfect for nighttime recovery',
      benefits: ['Overnight Recovery', 'Muscle Preservation', 'Satiety'],
      ingredients: ['Micellar Casein', 'Natural Flavors', 'Digestive Enzymes'],
      servings: 28,
      flavor: 'Strawberry',
      sideEffects: 'May cause digestive discomfort in some individuals.',
      dosage: '1 scoop (35g) mixed with 6-8 oz of water',
      timing: 'Before bed or between meals',
      budgetFriendly: false,
      featured: true,
      inStock: true,
      fastShipping: false
    },

    // Creatine
    {
      id: 4,
      name: 'Creatine Monohydrate',
      brand: 'MuscleTech',
      category: 'creatine',
      price: 19.99,
      originalPrice: 24.99,
      rating: 4.9,
      reviews: 3456,
      image: '/api/placeholder/300/300',
      description: 'Pure creatine monohydrate for strength and power enhancement',
      benefits: ['Increased Strength', 'Power Output', 'Muscle Volume'],
      ingredients: ['Creatine Monohydrate'],
      servings: 100,
      flavor: 'Unflavored',
      sideEffects: 'May cause water retention. Rare cases of stomach upset.',
      dosage: '5g daily mixed with water or juice',
      timing: 'Post-workout or anytime',
      budgetFriendly: true,
      featured: true,
      inStock: true,
      fastShipping: true
    },
    {
      id: 5,
      name: 'Creatine HCL',
      brand: 'Cellucor',
      category: 'creatine',
      price: 32.99,
      originalPrice: 39.99,
      rating: 4.6,
      reviews: 876,
      image: '/api/placeholder/300/300',
      description: 'Advanced creatine hydrochloride with better solubility',
      benefits: ['Enhanced Absorption', 'No Loading Phase', 'Reduced Bloating'],
      ingredients: ['Creatine Hydrochloride'],
      servings: 60,
      flavor: 'Unflavored',
      sideEffects: 'Minimal side effects compared to monohydrate.',
      dosage: '2-3g daily mixed with water',
      timing: 'Pre or post-workout',
      budgetFriendly: false,
      featured: false,
      inStock: true,
      fastShipping: true
    },

    // Vitamins & Minerals
    {
      id: 6,
      name: 'Multivitamin for Athletes',
      brand: 'Optimum Nutrition',
      category: 'vitamins',
      price: 24.99,
      originalPrice: 29.99,
      rating: 4.4,
      reviews: 1567,
      image: '/api/placeholder/300/300',
      description: 'Complete multivitamin formula designed for active individuals',
      benefits: ['Energy Support', 'Immune Health', 'Recovery'],
      ingredients: ['Vitamin A, C, D, E', 'B-Complex', 'Minerals', 'Antioxidants'],
      servings: 60,
      flavor: 'N/A',
      sideEffects: 'May cause nausea if taken on empty stomach.',
      dosage: '2 tablets daily with food',
      timing: 'With breakfast and dinner',
      budgetFriendly: true,
      featured: false,
      inStock: true,
      fastShipping: true
    },
    {
      id: 7,
      name: 'Vitamin D3 + K2',
      brand: 'Universal Nutrition',
      category: 'vitamins',
      price: 18.99,
      originalPrice: 22.99,
      rating: 4.7,
      reviews: 892,
      image: '/api/placeholder/300/300',
      description: 'High-potency Vitamin D3 with K2 for bone and immune health',
      benefits: ['Bone Health', 'Immune Support', 'Calcium Absorption'],
      ingredients: ['Vitamin D3', 'Vitamin K2 (MK-7)', 'MCT Oil'],
      servings: 90,
      flavor: 'N/A',
      sideEffects: 'Generally safe. Consult doctor if on blood thinners.',
      dosage: '1 softgel daily with fat-containing meal',
      timing: 'With breakfast or lunch',
      budgetFriendly: true,
      featured: false,
      inStock: true,
      fastShipping: true
    },

    // Pre-Workout
    {
      id: 8,
      name: 'Pre-Workout Extreme',
      brand: 'BSN',
      category: 'pre-workout',
      price: 39.99,
      originalPrice: 49.99,
      rating: 4.5,
      reviews: 2134,
      image: '/api/placeholder/300/300',
      description: 'High-stimulant pre-workout for intense energy and focus',
      benefits: ['Explosive Energy', 'Enhanced Focus', 'Muscle Pumps'],
      ingredients: ['Caffeine', 'Beta-Alanine', 'Citrulline', 'Creatine'],
      servings: 30,
      flavor: 'Fruit Punch',
      sideEffects: 'May cause jitters, tingling sensation. Not for caffeine sensitive.',
      dosage: '1 scoop (15g) mixed with 6-8 oz water',
      timing: '15-30 minutes before workout',
      budgetFriendly: false,
      featured: true,
      inStock: true,
      fastShipping: true
    },
    {
      id: 9,
      name: 'Natural Pre-Workout',
      brand: 'Universal Nutrition',
      category: 'pre-workout',
      price: 26.99,
      originalPrice: 32.99,
      rating: 4.3,
      reviews: 654,
      image: '/api/placeholder/300/300',
      description: 'Natural pre-workout with organic caffeine and adaptogens',
      benefits: ['Clean Energy', 'No Crash', 'Natural Ingredients'],
      ingredients: ['Organic Caffeine', 'Green Tea Extract', 'Rhodiola', 'Ginseng'],
      servings: 25,
      flavor: 'Green Apple',
      sideEffects: 'Minimal side effects. Mild energy boost.',
      dosage: '1 scoop (12g) mixed with 8 oz water',
      timing: '20-30 minutes before workout',
      budgetFriendly: true,
      featured: false,
      inStock: true,
      fastShipping: true
    },

    // Post-Workout
    {
      id: 10,
      name: 'Post-Workout Recovery',
      brand: 'Dymatize',
      category: 'post-workout',
      price: 34.99,
      originalPrice: 42.99,
      rating: 4.6,
      reviews: 743,
      image: '/api/placeholder/300/300',
      description: 'Complete post-workout formula with protein and carbs',
      benefits: ['Muscle Recovery', 'Glycogen Replenishment', 'Reduced Soreness'],
      ingredients: ['Whey Protein', 'Dextrose', 'BCAAs', 'Glutamine'],
      servings: 20,
      flavor: 'Orange',
      sideEffects: 'Generally well tolerated. May cause digestive upset in large doses.',
      dosage: '1 scoop (45g) mixed with 10-12 oz water',
      timing: 'Within 30 minutes post-workout',
      budgetFriendly: false,
      featured: false,
      inStock: true,
      fastShipping: true
    },

    // Fat Burners
    {
      id: 11,
      name: 'Thermogenic Fat Burner',
      brand: 'MuscleTech',
      category: 'fat-burners',
      price: 29.99,
      originalPrice: 37.99,
      rating: 4.2,
      reviews: 1098,
      image: '/api/placeholder/300/300',
      description: 'Advanced thermogenic formula for enhanced fat burning',
      benefits: ['Increased Metabolism', 'Energy Boost', 'Appetite Control'],
      ingredients: ['Green Coffee Extract', 'Garcinia Cambogia', 'Caffeine', 'L-Carnitine'],
      servings: 60,
      flavor: 'N/A',
      sideEffects: 'May cause jitters, increased heart rate. Not for stimulant sensitive.',
      dosage: '2 capsules twice daily with meals',
      timing: 'With breakfast and lunch',
      budgetFriendly: true,
      featured: false,
      inStock: true,
      fastShipping: true
    }
  ]);

  useEffect(() => {
    const loadSupplementsData = async () => {
      setIsLoading(true);
      
      // Load user's favorites and cart from localStorage
      const savedFavorites = JSON.parse(localStorage.getItem('supplement_favorites') || '[]');
      const savedCart = JSON.parse(localStorage.getItem('supplement_cart') || '[]');
      
      setFavorites(savedFavorites);
      setCart(savedCart);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadSupplementsData();
  }, []);

  const toggleFavorite = (productId) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('supplement_favorites', JSON.stringify(newFavorites));
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }
    
    setCart(newCart);
    localStorage.setItem('supplement_cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('supplement_cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('supplement_cart', JSON.stringify(newCart));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredSupplements = supplements.filter(supplement => {
    const matchesSearch = supplement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplement.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || supplement.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || supplement.brand.toLowerCase().includes(selectedBrand);
    
    let matchesPrice = true;
    if (priceRange === 'budget') matchesPrice = supplement.price <= 30;
    else if (priceRange === 'mid') matchesPrice = supplement.price > 30 && supplement.price <= 60;
    else if (priceRange === 'premium') matchesPrice = supplement.price > 60;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'newest': return b.id - a.id;
      default: return b.reviews - a.reviews; // popularity
    }
  });

  const ProductCard = ({ product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-400" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.budgetFriendly && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Budget Friendly
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
              Featured
            </span>
          )}
          {product.fastShipping && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              Fast Ship
            </span>
          )}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(product.id)}
          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.rating} ({product.reviews})
          </span>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedProduct(product);
              setShowProductModal(true);
            }}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-sm font-medium"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            View
          </button>
          <button
            onClick={() => addToCart(product)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
          >
            <ShoppingCart className="w-4 h-4 inline mr-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  );

  const ProductModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image and Basic Info */}
          <div>
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Brand</h3>
                <p className="text-gray-600 dark:text-gray-400">{product.brand}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Price</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rating</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed Information */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Key Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {product.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Main Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Servings</h4>
                <p className="text-gray-600 dark:text-gray-400">{product.servings}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Flavor</h4>
                <p className="text-gray-600 dark:text-gray-400">{product.flavor}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dosage & Timing</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Dosage:</strong> {product.dosage}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Best Time:</strong> {product.timing}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Side Effects</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.sideEffects}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  addToCart(product);
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                Add to Cart
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium ${
                  favorites.includes(product.id)
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Heart className="w-5 h-5 inline mr-2" />
                {favorites.includes(product.id) ? 'Favorited' : 'Favorite'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CartModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Your cart is empty</p>
            <p className="text-sm text-gray-400">Add some supplements to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.brand}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">${item.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 font-medium">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading supplements..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up animation-delay-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 animate-fade-in-up animation-delay-400">
              Supplements Store 💊
            </h1>
            <p className="text-purple-100 animate-fade-in-up animation-delay-600">
              Premium supplements for your fitness journey
            </p>
          </div>
          <div className="flex items-center space-x-4 animate-fade-in-up animation-delay-800">
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
            >
              <ShoppingCart className="w-6 h-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
            <div className="text-right">
              <div className="text-sm text-purple-100">Cart Total</div>
              <div className="text-lg font-semibold">${getCartTotal().toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in-up animation-delay-400">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search supplements, brands, or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
            
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            >
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            >
              {priceRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="animate-fade-in-up animation-delay-600">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.slice(1).map((category, index) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-${700 + (index * 100)} ${
                selectedCategory === category.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-3 rounded-lg ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 dark:bg-purple-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <category.icon className={`w-6 h-6 ${
                    selectedCategory === category.id
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${
                    selectedCategory === category.id
                      ? 'text-purple-900 dark:text-purple-100'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.count} items
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="animate-fade-in-up animation-delay-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedCategory === 'all' ? 'All Supplements' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredSupplements.length} products found
          </p>
        </div>
        
        {filteredSupplements.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No supplements found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSupplements.map((supplement, index) => (
              <div key={supplement.id} className={`animate-fade-in-up animation-delay-${900 + (index * 100)}`}>
                <ProductCard product={supplement} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showProductModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
      
      {showCart && (
        <CartModal onClose={() => setShowCart(false)} />
      )}

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-700 { animation-delay: 700ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-900 { animation-delay: 900ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1100 { animation-delay: 1100ms; }
        .animation-delay-1200 { animation-delay: 1200ms; }
        .animation-delay-1300 { animation-delay: 1300ms; }
        .animation-delay-1400 { animation-delay: 1400ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Supplements;