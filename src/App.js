// ReactStoreX - Go Full SpaceX Mode 🚀 without TailwindCSS
// Stack: React + FakeStore API + Framer Motion + localStorage Cart Persistence

import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import './styles.css';

const CartContext = createContext();

const App = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      <div className={`app ${darkMode ? "dark" : "light"}`}>
        <Router>
          <nav className="navbar">
            <Link to="/" className="brand">ReactStoreX 🚀</Link>
            <div className="nav-actions">
              <Link to="/cart" className="btn cart-link">Cart ({cart.length})</Link>
            </div>
          </nav>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
              <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Router>
      </div>
    </CartContext.Provider>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -40 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("https://fakestoreapi.com/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <input
        type="text"
        placeholder="Search futuristic products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />
      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => (
  <Link to={`/product/${product.id}`} className="card">
    <img src={product.image} alt={product.title} className="product-img" />
    <h2 className="title">{product.title}</h2>
    <p className="price">${product.price}</p>
  </Link>
);

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    axios.get(`https://fakestoreapi.com/products/${id}`).then((res) => {
      setProduct(res.data);
    });
  }, [id]);

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="pdp-centered">
        <div className="detail-card">
          <img src={product.image} alt={product.title} className="detail-img" />
          <div className="detail-text">
            <h1 className="title">{product.title}</h1>
            <p className="description">{product.description}</p>
            <h2 className="price">${product.price}</h2>
            <div className="button-row">
              <button onClick={() => addToCart(product)} className="btn">Add to Cart</button>
              <button onClick={() => setShowCheckout(true)} className="btn secondary">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="modal-bg"
            onClick={() => setShowCheckout(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>🚀 Mission Successful</h2>
              <p>You've initiated a mock checkout for <strong>{product.title}</strong>.</p>
              <button onClick={() => setShowCheckout(false)} className="btn">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Cart = () => {
  const { cart, removeFromCart } = useContext(CartContext);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <h3>{item.title}</h3>
                <p>${item.price}</p>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="btn danger">Remove</button>
            </div>
          ))}
          <div className="total">Total: ${total.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};

export default App;
