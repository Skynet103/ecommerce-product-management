import { useState } from "react";

function EditProduct({ product, onUpdated, onCancel }) {
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [price, setPrice] = useState(product.price);
    const [category, setCategory] = useState(product.category);
    const [stock, setStock] = useState(product.stock);
    const [image, setImage] = useState(product.image || "");
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

        try {
            const response = await fetch(
                `https://ecommerce-product-management-hysx.onrender.com/api/products/${product._id}`,
                {
                    method: "PUT",
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
                console.log("Product updated successfully");
                onUpdated(data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    return (
        <div className="edit-product-section">
            <h2>Edit Product</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />

                <input
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />

                <input
                    type="number"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                />

                <input
                    type="text"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                />

                <input
                    type="number"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                />
                <input
                    type="text"
                    placeholder="Image URL"
                    value={image}
                    onChange={(event) => setImage(event.target.value)}
                />

                <button className="update-button" type="submit">
                    Update Product
                </button>

                <button className="cancel-button" type="button" onClick={onCancel}>
                    Cancel
                </button>
            </form>
            {message && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default EditProduct;