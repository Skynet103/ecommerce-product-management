const Product = require("../models/Product");

// Create a product
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// Get all products
const getProducts = async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10
        } = req.query;

        let filter = {};

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

       if (minPrice || maxPrice) {
    const minPriceNumber = Number(minPrice);
    const maxPriceNumber = Number(maxPrice);

    if (minPrice && !Number.isFinite(minPriceNumber)) {
        return res.status(400).json({
            message: "minPrice must be a valid number"
        });
    }

    if (maxPrice && !Number.isFinite(maxPriceNumber)) {
        return res.status(400).json({
            message: "maxPrice must be a valid number"
        });
    }

    if (minPriceNumber < 0 || maxPriceNumber < 0) {
        return res.status(400).json({
            message: "Price cannot be negative"
        });
    }

    if (
        minPrice &&
        maxPrice &&
        minPriceNumber > maxPriceNumber
    ) {
        return res.status(400).json({
            message: "minPrice cannot be greater than maxPrice"
        });
    }

    filter.price = {};

    if (minPrice) {
        filter.price.$gte = minPriceNumber;
    }

    if (maxPrice) {
        filter.price.$lte = maxPriceNumber;
    }
}

      const pageNumber = Number(page);
const limitNumber = Number(limit);

if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return res.status(400).json({
        message: "Page must be a positive integer"
    });
}

if (!Number.isInteger(limitNumber) || limitNumber < 1) {
    return res.status(400).json({
        message: "Limit must be a positive integer"
    });
}

const skip = (pageNumber - 1) * limitNumber;

        const products = await Product.find(filter)
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / Number(limit));

        res.status(200).json({
            products,
            page: Number(page),
            limit: Number(limit),
            totalProducts,
            totalPages
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get one product
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({
            message: "Invalid product ID"
        });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: "Invalid product ID"
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};