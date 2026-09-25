import Login from "./Login";
import AddProduct from "./AddProduct";
import ProductDetails from "./ProductDetails";
import EditProduct from "./EditProduct";
import Cart from "./Cart";
import Orders from "./Orders";
import AdminOrders from "./AdminOrders";
import "./App.css";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function App() {

    const [loggedIn, setLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);

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

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState("");

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");

        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);
        const [showCart, setShowCart] = useState(false);

        const [showOrders, setShowOrders] = useState(false);
        const [showAdminOrders, setShowAdminOrders] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUserRole(payload.role);
        }
    }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(
        `http://localhost:5000/api/products?search=${search}&category=${category}&minPrice=${appliedMinPrice}&maxPrice=${appliedMaxPrice}&page=${page}&limit=6`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    )
        .then((response) => response.json())
        .then((data) => {
            if (data.products) {
                setProducts(data.products);
                setTotalPages(data.totalPages);
            } else {
                setError(data.message || "Failed to fetch products");
            }
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            setError("Unable to load products");
        })
        .finally(() => {
            setLoading(false);
        });
    }, 
    [search, category, appliedMinPrice, appliedMaxPrice, page, refresh]);

    if (!loggedIn) {
    return (
        <Login
            onLogin={() => {
                setLoggedIn(true);

                const token = localStorage.getItem("token");
                const payload = JSON.parse(atob(token.split(".")[1]));

                setUserRole(payload.role);
                setUserId(payload.id);
            }}
        />
    );
}

    if (showCart) {
        return (
            <Cart
                cart={cart}
                setCart={setCart}
                onBack={() => setShowCart(false)}
            />
        );
    }


    if (showOrders) {
        return (
            <Orders
                onBack={() => setShowOrders(false)}
            />
        );
    }


    if (showAdminOrders) {
        return (
            <AdminOrders
                onBack={() => setShowAdminOrders(false)}
            />
        );
    }
   
    return(
          

    <div className="container">
        <Navbar
            userRole={userRole}
            cartCount={cart.length}
            onProducts={() => {
                setSelectedProduct(null);
                setShowCart(false);
                setShowOrders(false);
                setShowAdminOrders(false);
            }}
            onCart={() => {
                setShowCart(true);
                setShowOrders(false);
                setShowAdminOrders(false);
            }}
            onOrders={() => {
                setShowOrders(true);
                setShowCart(false);
                setShowAdminOrders(false);
            }}
            onAdminOrders={() => {
                setShowAdminOrders(true);
                setShowCart(false);
                setShowOrders(false);
            }}
            onLogout={() => {
                localStorage.removeItem("token");
                setLoggedIn(false);
            }}
        />
    {userRole === "admin" && (
        <AddProduct
            onProductAdded={() => {
                setRefresh(refresh + 1);
            }}
        />
    )}
    <h2>Products</h2>

    <div className="filter-section">
        <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
            }}
        />

        <select
            value={category}
        onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
            }}
        >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Footwear">Footwear</option>
        </select>

        
        <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
        />

        <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
        />

        <button
             className="filter-button"
            onClick={() => {
                if (
                    minPrice !== "" &&
                    maxPrice !== "" &&
                    Number(minPrice) > Number(maxPrice)
                ) {
                    setPriceError(
                        "Minimum price cannot be greater than maximum price"
                    );
                    return;
                }

                setPriceError("");
                setAppliedMinPrice(minPrice);
                setAppliedMaxPrice(maxPrice);
                setPage(1);
            }}
        >
            Apply Price
        </button>
    </div>
    {priceError && (
        <p style={{ color: "red", fontWeight: "bold" }}>
            {priceError}
        </p>
    )}

    {editingProduct && (
        <EditProduct
            product={editingProduct}


           onUpdated={(updatedProduct) => {
            setProducts(
                products.map((product) =>
                    product._id === updatedProduct._id
                        ? updatedProduct
                        : product
                )
            );

                setEditingProduct(null);
                setProductMessage("Product updated successfully");
            }}
            onCancel={() => {
                setEditingProduct(null);
            }}
        />

    )}

        {productMessage && (
        <p style={{ color: "green", fontWeight: "bold" }}>
            {productMessage}
        </p>
        )}

    {deleteMessage && (
        <p style={{ color: "green", fontWeight: "bold" }}>
            {deleteMessage}
        </p>
    )}

    {loading && (
        <p style={{ fontWeight: "bold" }}>
            Loading products...
        </p>
    )}

    {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>
            {error}
        </p>
    )}

    {!loading && products.length === 0 && (
        <p style={{ fontWeight: "bold" }}>
            No products found.
        </p>
    )}

    {!loading && (
        <div className="product-grid">
            {products.map((product) => (
                    <div
                        key={product._id}
                        className="product-card"
                    >
                    <h3
                            onClick={() => setSelectedProduct(product)}
                            style={{ cursor: "pointer" }}
                        >
                            {product.name}
                        </h3>
                
                {product.image && (
                    <img
                        src={product.image}
                        alt={product.name}
                        onError={(event) => {
                            event.target.style.display = "none";
                        }}
                    />
                )}
                        <p>{product.description}</p>

                        <p className="product-price">
                            ₹{product.price}
                        </p>

                        <p>
                            <strong>Category:</strong> {product.category}
                        </p>

                        <p>
                            <strong>Stock:</strong> {product.stock}
                        </p>

                    {userRole === "admin" && (
                        <button
                            className="edit-button"
                            onClick={() => {
                                setProductMessage("");
                                setDeleteMessage("");
                                setEditingProduct(product);
                            }}
                        >
                            Edit
                        </button>
                    )}

                    {userRole === "user" && (
                        <button
                            className="cart-button"
                            disabled={product.stock === 0}
                            onClick={() => {
                                const existingProduct = cart.find(
                                    (item) => item._id === product._id
                                );

                                if (existingProduct) {
                                    if (existingProduct.quantity >= product.stock) {
                                        return;
                                    }

                                    setCart(
                                        cart.map((item) =>
                                            item._id === product._id
                                                ? {
                                                    ...item,
                                                    quantity: item.quantity + 1
                                                }
                                                : item
                                        )
                                    );
                                } else {
                                    setCart([
                                        ...cart,
                                        {
                                            ...product,
                                            quantity: 1
                                        }
                                    ]);
                                }
                            }}
                        >
                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                    )}

                        {userRole === "admin" && (
                            <button
                                className="delete-button"
                                onClick={async () => {

                                    const confirmed = window.confirm(
                                        "Are you sure you want to delete this product?"
                                    );

                                    if (!confirmed) {
                                        return;
                                    }

                                    setProductMessage("");
                                    setDeleteMessage("");

                                    const response = await fetch(
                                        `http://localhost:5000/api/products/${product._id}`,
                                        {
                                            method: "DELETE",
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token")}`
                                            }
                                        }
                                    );

                                    const data = await response.json();

                                    if (response.ok) {
                                        setDeleteMessage("Product deleted successfully");

                                        setProducts(
                                            products.filter(
                                                (item) => item._id !== product._id
                                            )
                                        );
                                    } else {
                                        console.error(data.message);
                                    }
                                }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
                </div>
            )}

        <div className="pagination">
            <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
            >
                Previous
            </button>

            <span>
                {" "} Page {page} of {totalPages} {" "}
            </span>

            <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
            >
                Next
            </button>
        </div>
    </div>
    
);
}

export default App;