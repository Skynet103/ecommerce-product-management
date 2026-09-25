import { useEffect, useState } from "react";

function Orders({ onBack }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("https://ecommerce-product-management-hysx.onrender.com/api/orders/my-orders", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    setError(data.message || "Failed to load orders");
                }
            })
            .catch((error) => {
                console.error("Order history error:", error);
                setError("Unable to load orders");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="container">
            <h1>My Orders</h1>

            <button onClick={onBack}>
                ← Back to Products
            </button>

            {loading && (
                <p style={{ fontWeight: "bold" }}>
                    Loading orders...
                </p>
            )}

            {error && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                    {error}
                </p>
            )}

            {!loading && !error && orders.length === 0 && (
                <p>No orders found.</p>
            )}

            {!loading &&
                !error &&
                orders.map((order) => (
                    <div key={order._id} className="order-card">
                        <h2>Order</h2>

                        <p>
                            <strong>Order ID:</strong> {order._id}
                        </p>

                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(order.createdAt).toLocaleString()}
                        </p>

                        <p>
                            <strong>Status:</strong> {order.status}
                        </p>

                        <h3>Items</h3>

                        {order.items.map((item, index) => (
                            <div key={index}>
                                <p>
                                    {item.name} × {item.quantity}
                                </p>

                                <p>
                                    Price: ₹{item.price}
                                </p>
                            </div>
                        ))}

                        <h3>
                            Total: ₹{order.totalAmount}
                        </h3>
                    </div>
                ))}
        </div>
    );
}

export default Orders;