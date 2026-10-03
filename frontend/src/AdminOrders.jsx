import { useEffect, useState } from "react";

function AdminOrders({ onBack }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updateStatus, setUpdateStatus] = useState({}); // Track loading per order

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin`, {
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
                console.error("Admin orders error:", error);
                setError("Unable to load orders");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdateStatus(prev => ({ ...prev, [orderId]: true }));
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setOrders(
                    orders.map((item) =>
                        item._id === orderId
                            ? { ...item, status: data.order.status }
                            : item
                    )
                );
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Status update error:", error);
            alert("Unable to connect to server");
        } finally {
            setUpdateStatus(prev => ({ ...prev, [orderId]: false }));
        }
    };

    return (
        <div className="container">
            <h1>All Orders</h1>

            <button onClick={onBack}>
                ← Back to Dashboard
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
                            <strong>Customer:</strong> {order.user?.name}
                        </p>

                        <p>
                            <strong>Email:</strong> {order.user?.email}
                        </p>
                        <h3>Delivery Details</h3>

                        <p>
                            <strong>Name:</strong> {order.deliveryDetails?.name}
                        </p>

                        <p>
                            <strong>Phone:</strong> {order.deliveryDetails?.phone}
                        </p>

                        <p>
                            <strong>Address:</strong> {order.deliveryDetails?.address}
                        </p>

                        <p>
                            <strong>City:</strong> {order.deliveryDetails?.city}
                        </p>

                        <p>
                            <strong>State:</strong> {order.deliveryDetails?.state}
                        </p>

                        <p>
                            <strong>PIN Code:</strong> {order.deliveryDetails?.pinCode}
                        </p>

                        <p>
                            <strong>Date:</strong> {new Date(
                                order.createdAt
                            ).toLocaleString()}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <strong>Status:</strong>
                            <select
                                value={order.status}
                                disabled={updateStatus[order._id]}
                                onChange={(event) => handleStatusChange(order._id, event.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            {updateStatus[order._id] && <span>Updating...</span>}
                        </div>

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

export default AdminOrders;
