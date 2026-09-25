import { useState } from "react";
function Cart({ cart, setCart, onBack }) {
    const [message, setMessage] = useState("");
    const [deliveryDetails, setDeliveryDetails] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pinCode: ""
    });

    const handleDeliveryChange = (event) => {
        const { name, value } = event.target;

        setDeliveryDetails({
            ...deliveryDetails,
            [name]: value
        });
    };
    
    const increaseQuantity = (id) => {
        setCart(
            cart.map((item) =>
                item._id === id
                    ? {
                        ...item,
                        quantity:
                            item.quantity < item.stock
                                ? item.quantity + 1
                                : item.quantity
                    }
                    : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCart(
            cart
                .map((item) =>
                    item._id === id
                        ? {
                              ...item,
                              quantity: item.quantity - 1
                          }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (id) => {
        setCart(
            cart.filter((item) => item._id !== id)
        );
    };

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="container">
            <h1>Shopping Cart</h1>

            <button onClick={onBack}>
                ← Back to Products
            </button>

            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    {cart.map((item) => (
                        <div key={item._id} className="cart-item">
                            <h3>{item.name}</h3>

                            <p>
                                Price: ₹{item.price}
                            </p>

                            <p>
                                Quantity: {item.quantity}
                            </p>

                            <button
                                className="quantity-button"
                                onClick={() =>
                                    decreaseQuantity(item._id)
                                }
                            >
                                −
                            </button>

                            <button
                                className="quantity-button"
                                onClick={() =>
                                    increaseQuantity(item._id)
                                }
                            >
                                +
                            </button>

                            <button
                                className="remove-cart-button"
                                onClick={() =>
                                    removeFromCart(item._id)
                                }
                            >
                                Remove
                            </button>

                            <p>
                                Subtotal: ₹
                                {item.price * item.quantity}
                            </p>
                        </div>
                    ))}

                    <div className="cart-total">

                        <h2>Delivery Details</h2>

                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={deliveryDetails.name}
                                onChange={handleDeliveryChange}
                            />

                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone Number"
                                value={deliveryDetails.phone}
                                onChange={handleDeliveryChange}
                            />

                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={deliveryDetails.address}
                                onChange={handleDeliveryChange}
                            />

                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={deliveryDetails.city}
                                onChange={handleDeliveryChange}
                            />

                            <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={deliveryDetails.state}
                                onChange={handleDeliveryChange}
                            />

                            <input
                                type="text"
                                name="pinCode"
                                placeholder="PIN Code"
                                value={deliveryDetails.pinCode}
                                onChange={handleDeliveryChange}
                            />


                        <h2>
                            Total: ₹{total}
                        </h2>

                        <button
                            onClick={async () => {
                                try {
                                    const response = await fetch(
                                        "https://ecommerce-product-management-hysx.onrender.com/api/orders",
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${localStorage.getItem("token")}`
                                            },


                                            body: JSON.stringify({
                                                items: cart.map((item) => ({
                                                    product: item._id,
                                                    name: item.name,
                                                    price: item.price,
                                                    quantity: item.quantity
                                                })),
                                                deliveryDetails: deliveryDetails
                                            }),

                                        }
                                    );

                                    const data = await response.json();

                                    if (response.ok) {
                                        setMessage("Order placed successfully!");
                                        setCart([]);
                                    } else {
                                        setMessage(data.message || "Failed to place order");
                                    }
                                } catch (error) {
                                    console.error("Order error:", error);
                                    setMessage("Unable to connect to server");
                                }
                            }}
                        >
                            Place Order
                        </button>

                        {message && (
                            <p style={{ fontWeight: "bold" }}>
                                {message}
                            </p>
                        )}
                    </div>

                </>
            )}
        </div>
    );
}

export default Cart;