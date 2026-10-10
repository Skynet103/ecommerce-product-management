import { useEffect, useState } from "react";
import Login from "./Login";
import AddProduct from "./AddProduct";
import ProductDetails from "./ProductDetails";
import EditProduct from "./EditProduct";
import Cart from "./Cart";
import Orders from "./Orders";
import AdminOrders from "./AdminOrders";
import Navbar from "./Navbar";
import { apiRequest } from "./api";
import "./App.css";

function getTokenPayload() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!payload.id || !payload.role) return null;
        if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
        return payload;
    } catch {
        localStorage.removeItem("token");
        return null;
    }
}

function App() {
    const initialPayload = getTokenPayload();
    const [loggedIn, setLoggedIn] = useState(Boolean(initialPayload));
    const [userRole, setUserRole] = useState(initialPayload?.role || "");
    const [userId, setUserId] = useState(initialPayload?.id || "");
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [appliedMinPrice, setAppliedMinPrice] = useState("");
    const [appliedMaxPrice, setAppliedMaxPrice] = useState("");
    const [priceError, setPriceError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refresh, setRefresh] = useState(0);
    const [productMessage, setProductMessage] = useState("");
    const [deleteMessage, setDeleteMessage] = useState("");
    const [deleteLoading, setDeleteLoading] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [showAdminOrders, setShowAdminOrders] = useState(false);

    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("cart");
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            localStorage.removeItem("cart");
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const controller = new AbortController();
        const loadProducts = async () => {
            setLoading(true);
            setError("");
            const params = new URLSearchParams({
                search,
                category,
                minPrice: appliedMinPrice,
                maxPrice: appliedMaxPrice,
                page: String(page),
                limit: "6"
            });
            try {
                const { response, data } = await apiRequest(`/api/products?${params}`, {
                    signal: controller.signal
                });
                if (response.ok && data.products) {
                    setProducts(data.products);
                    setTotalPages(Math.max(1, data.totalPages || 1));
                } else {
                    setError(data.message || "Failed to fetch products");
                    if (response.status === 401) handleLogout();
                }
            } catch (err) {
                if (err.name !== "AbortError") setError("Unable to load products");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        if (loggedIn) loadProducts();
        return () => controller.abort();
    }, [loggedIn, search, category, appliedMinPrice, appliedMaxPrice, page, refresh]);

    const handleLogin = () => {
        const payload = getTokenPayload();
        if (!payload) return;
        setLoggedIn(true);
        setUserRole(payload.role);
        setUserId(payload.id);
    };

    function handleLogout() {
        localStorage.removeItem("token");
        setLoggedIn(false);
        setUserRole("");
        setUserId("");
        setShowCart(false);
        setShowOrders(false);
        setShowAdminOrders(false);
        setSelectedProduct(null);
    }

    if (!loggedIn) return <Login onLogin={handleLogin} />;

    if (showCart) return <Cart cart={cart} setCart={setCart} onBack={() => setShowCart(false)} />;
    if (showOrders) return <Orders onBack={() => setShowOrders(false)} />;
    if (showAdminOrders) return <AdminOrders onBack={() => setShowAdminOrders(false)} />;
    if (selectedProduct) return <ProductDetails product={selectedProduct} onBack={() => setSelectedProduct(null)} />;

    const deleteProduct = async (product) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        setDeleteLoading(product._id);
        setDeleteMessage("");
        try {
            const { response, data } = await apiRequest(`/api/products/${product._id}`, { method: "DELETE" });
            if (response.ok) {
                setProducts((current) => current.filter((item) => item._id !== product._id));
                setDeleteMessage("Product deleted successfully");
            } else {
                setDeleteMessage(data.message || "Failed to delete product");
            }
        } catch {
            setDeleteMessage("Unable to connect to server");
        } finally {
            setDeleteLoading("");
        }
    };

    return (
        <div className="container">
            <Navbar
                userRole={userRole}
                cartCount={cart.length}
                onProducts={() => { setSelectedProduct(null); setShowCart(false); setShowOrders(false); setShowAdminOrders(false); }}
                onCart={() => { setShowCart(true); setShowOrders(false); setShowAdminOrders(false); }}
                onOrders={() => { setShowOrders(true); setShowCart(false); setShowAdminOrders(false); }}
                onAdminOrders={() => { setShowAdminOrders(true); setShowCart(false); setShowOrders(false); }}
                onLogout={handleLogout}
            />

            {userRole === "admin" && <AddProduct onProductAdded={() => setRefresh((value) => value + 1)} />}

            <h2>Products</h2>
            <div className="filter-section">
                <input type="text" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Footwear">Footwear</option>
                </select>
                <input type="number" min="0" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <input type="number" min="0" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                <button className="filter-button" onClick={() => {
                    if (minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice)) {
                        setPriceError("Minimum price cannot be greater than maximum price");
                        return;
                    }
                    setPriceError("");
                    setAppliedMinPrice(minPrice);
                    setAppliedMaxPrice(maxPrice);
                    setPage(1);
                }}>Apply Price</button>
            </div>

            {priceError && <p style={{ color: "red", fontWeight: "bold" }}>{priceError}</p>}

            {editingProduct && (
                <EditProduct
                    product={editingProduct}
                    onUpdated={(updatedProduct) => {
                        setProducts((current) => current.map((product) => product._id === updatedProduct._id ? updatedProduct : product));
                        setEditingProduct(null);
                        setProductMessage("Product updated successfully");
                    }}
                    onCancel={() => setEditingProduct(null)}
                />
            )}

            {productMessage && <p style={{ color: "green", fontWeight: "bold" }}>{productMessage}</p>}
            {deleteMessage && <p style={{ color: deleteMessage.includes("successfully") ? "green" : "red", fontWeight: "bold" }}>{deleteMessage}</p>}
            {loading && <p style={{ fontWeight: "bold" }}>Loading products...</p>}
            {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
            {!loading && products.length === 0 && <p style={{ fontWeight: "bold" }}>No products found.</p>}

            {!loading && (
                <div className="product-grid">
                    {products.map((product) => (
                        <div key={product._id} className="product-card">
                            <h3 onClick={() => setSelectedProduct(product)} style={{ cursor: "pointer" }}>{product.name}</h3>
                            {product.image && <img src={product.image} alt={product.name} onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                            <p>{product.description}</p>
                            <p className="product-price">₹{product.price}</p>
                            <p><strong>Category:</strong> {product.category}</p>
                            <p><strong>Stock:</strong> {product.stock}</p>

                            {userRole === "admin" && (
                                <>
                                    <button className="edit-button" onClick={() => { setProductMessage(""); setDeleteMessage(""); setEditingProduct(product); }}>Edit</button>
                                    <button className="delete-button" disabled={deleteLoading === product._id} onClick={() => deleteProduct(product)}>
                                        {deleteLoading === product._id ? "Deleting..." : "Delete"}
                                    </button>
                                </>
                            )}

                            {userRole === "user" && (
                                <button className="cart-button" disabled={product.stock === 0} onClick={() => {
                                    const existing = cart.find((item) => item._id === product._id);
                                    if (existing) {
                                        if (existing.quantity >= product.stock) return;
                                        setCart(cart.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1, stock: product.stock, price: product.price } : item));
                                    } else {
                                        setCart([...cart, { ...product, quantity: 1 }]);
                                    }
                                }}>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="pagination">
                <button onClick={() => setPage((value) => value - 1)} disabled={page === 1}>Previous</button>
                <span> Page {page} of {totalPages} </span>
                <button onClick={() => setPage((value) => value + 1)} disabled={page >= totalPages}>Next</button>
            </div>
        </div>
    );
}

export default App;
