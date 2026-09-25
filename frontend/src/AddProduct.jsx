import { useState } from "react";

function AddProduct({ onProductAdded }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [stock, setStock] = useState("");
    const [image, setImage] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name || !description || !price || !category || !stock) {
            setMessage("Please fill in all fields");
            return;
        }

        if (!name.trim()) {
            setMessage("Product name cannot be empty");
            return;
        }

        if (!description.trim()) {
            setMessage("Description cannot be empty");
            return;
        }

        if (!category.trim()) {
            setMessage("Category cannot be empty");
            return;
        }

        if (image) {
            try {
                const imageUrl = new URL(image);

                if (
                    imageUrl.protocol !== "http:" &&
                    imageUrl.protocol !== "https:"
                ) {
                    setMessage("Please enter a valid image URL");
                    return;
                }
            } catch (error) {
                setMessage("Please enter a valid image URL");
                return;
            }
        }

        if (Number(price) <= 0) {
            setMessage("Price must be greater than 0");
            return;
        }

        if (Number(stock) < 0) {
            setMessage("Stock cannot be negative");
            return;
        }

        if (!Number.isInteger(Number(stock))) {
            setMessage("Stock must be a whole number");
            return;
        }

        const response = await fetch(
            "https://ecommerce-product-management-hysx.onrender.com/api/products",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    price: Number(price),
                    category,
                    stock: Number(stock),
                    image
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            setMessage("Product added successfully");
            onProductAdded();
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="add-product-section">
            <h2>Add Product</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Product name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />

                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />

                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                />

                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                />

                <input
                    type="number"
                    placeholder="Stock"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                />

                <input
                    type="text"
                    placeholder="Image URL"
                    value={image}
                    onChange={(event) => setImage(event.target.value)}
                />

                <button className="add-button" type="submit">
                    Add Product
                </button>
            </form>

            {message && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                    {message}
                </p>
            )}

        </div>
    );
}

export default AddProduct;