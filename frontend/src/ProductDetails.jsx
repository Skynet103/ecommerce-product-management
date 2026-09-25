function ProductDetails({ product, onBack }) {
    return (
        <div className="product-details">
            <button onClick={onBack}>
                ← Back to Products
            </button>

            {product.image && (
                <img
                    src={product.image}
                    alt={product.name}
                />
            )}

            <h2>{product.name}</h2>

            <p>{product.description}</p>

            <p>
                <strong>Price:</strong> ₹{product.price}
            </p>

            <p>
                <strong>Category:</strong> {product.category}
            </p>

            <p>
                <strong>Stock:</strong> {product.stock}
            </p>
        </div>
    );
}

export default ProductDetails;