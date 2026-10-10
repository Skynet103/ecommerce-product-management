const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, image } = req.body;

        if (!name?.trim() || !description?.trim() || !category?.trim()) {
            return res.status(400).json({ message: "Name, description and category are required" });
        }
        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({ message: "Price must be a valid non-negative number" });
        }
        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return res.status(400).json({ message: "Stock must be a non-negative whole number" });
        }

        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category: category.trim(),
            stock: Number(stock),
            image: image?.trim() || undefined
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (category) filter.category = category;

        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.name = { $regex: escapedSearch, $options: "i" };
        }

        const hasMin = minPrice !== undefined && minPrice !== "";
        const hasMax = maxPrice !== undefined && maxPrice !== "";
        const min = Number(minPrice);
        const max = Number(maxPrice);

        if (hasMin && !Number.isFinite(min)) {
            return res.status(400).json({ message: "minPrice must be a valid number" });
        }
        if (hasMax && !Number.isFinite(max)) {
            return res.status(400).json({ message: "maxPrice must be a valid number" });
        }
        if ((hasMin && min < 0) || (hasMax && max < 0)) {
            return res.status(400).json({ message: "Price cannot be negative" });
        }
        if (hasMin && hasMax && min > max) {
            return res.status(400).json({ message: "minPrice cannot be greater than maxPrice" });
        }

        if (hasMin || hasMax) {
            filter.price = {};
            if (hasMin) filter.price.$gte = min;
            if (hasMax) filter.price.$lte = max;
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ message: "Page must be a positive integer" });
        }
        if (!Number.isInteger(limitNumber) || limitNumber < 1) {
            return res.status(400).json({ message: "Limit must be a positive integer" });
        }
        if (limitNumber > 100) {
            return res.status(400).json({ message: "Limit cannot exceed 100" });
        }

        const skip = (pageNumber - 1) * limitNumber;
        const products = await Product.find(filter).skip(skip).limit(limitNumber);
        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            products,
            page: pageNumber,
            limit: limitNumber,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNumber)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: "Invalid product ID" });
    }
};

const updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const allowedFields = ["name", "description", "price", "category", "stock", "image"];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid product fields supplied" });
        }
        if (updates.name !== undefined && !String(updates.name).trim()) {
            return res.status(400).json({ message: "Product name cannot be empty" });
        }
        if (updates.description !== undefined && !String(updates.description).trim()) {
            return res.status(400).json({ message: "Description cannot be empty" });
        }
        if (updates.category !== undefined && !String(updates.category).trim()) {
            return res.status(400).json({ message: "Category cannot be empty" });
        }
        if (updates.price !== undefined && (!Number.isFinite(Number(updates.price)) || Number(updates.price) < 0)) {
            return res.status(400).json({ message: "Price must be a valid non-negative number" });
        }
        if (updates.stock !== undefined && (!Number.isInteger(Number(updates.stock)) || Number(updates.stock) < 0)) {
            return res.status(400).json({ message: "Stock must be a non-negative whole number" });
        }

        if (updates.name !== undefined) updates.name = String(updates.name).trim();
        if (updates.description !== undefined) updates.description = String(updates.description).trim();
        if (updates.category !== undefined) updates.category = String(updates.category).trim();
        if (updates.price !== undefined) updates.price = Number(updates.price);
        if (updates.stock !== undefined) updates.stock = Number(updates.stock);
        if (updates.image !== undefined) updates.image = String(updates.image).trim();

        const product = await Product.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const referenced = await Order.exists({ "items.product": req.params.id });
        if (referenced) {
            return res.status(409).json({
                message: "Product cannot be deleted because it is referenced by an order history"
            });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
