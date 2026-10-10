const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const nextStatuses = {
    Pending: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: []
};

const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { items, deliveryDetails } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        if (items.length > 50) {
            return res.status(400).json({ message: "Too many items in order" });
        }

        const productIds = items.map((item) => item.product);
        if (new Set(productIds.map(String)).size !== productIds.length) {
            return res.status(400).json({ message: "Duplicate products are not allowed in an order" });
        }

        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
                return res.status(400).json({ message: "Invalid product ID" });
            }
            if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
                return res.status(400).json({ message: "Quantity must be a whole number between 1 and 100" });
            }
        }

        const details = deliveryDetails || {};
        const required = ["name", "phone", "address", "city", "state", "pinCode"];
        if (required.some((key) => !String(details[key] || "").trim())) {
            return res.status(400).json({ message: "All delivery details are required" });
        }
        if (!/^\d{10}$/.test(String(details.phone).trim())) {
            return res.status(400).json({ message: "Phone number must contain exactly 10 digits" });
        }
        if (!/^\d{6}$/.test(String(details.pinCode).trim())) {
            return res.status(400).json({ message: "PIN code must contain exactly 6 digits" });
        }

        session.startTransaction();
        const validatedItems = [];
        let calculatedTotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.product).session(session);
            if (!product) throw new Error("Product not found");
            if (product.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name}. Available stock: ${product.stock}`);
            }

            calculatedTotal += product.price * item.quantity;
            validatedItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
        }

        for (const item of validatedItems) {
            const updated = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true, session }
            );
            if (!updated) throw new Error(`Stock changed before order could be completed for ${item.name}`);
        }

        const order = await Order.create([{
            user: req.user.id,
            items: validatedItems,
            deliveryDetails: {
                name: details.name.trim(), phone: details.phone.trim(), address: details.address.trim(),
                city: details.city.trim(), state: details.state.trim(), pinCode: details.pinCode.trim()
            },
            totalAmount: calculatedTotal
        }], { session });

        await session.commitTransaction();
        res.status(201).json({ message: "Order placed successfully", order: order[0] });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate("items.product", "name image").sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").populate("items.product", "name image").sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid order ID format" });
        const { status } = req.body;
        if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid order status" });

        session.startTransaction();
        const order = await Order.findById(req.params.id).session(session);
        if (!order) throw new Error("Order not found");
        if (order.status === status) {
            await session.abortTransaction();
            return res.status(200).json({ message: "Order status unchanged", order });
        }
        if (!nextStatuses[order.status].includes(status)) {
            throw new Error(`Cannot change order status from ${order.status} to ${status}`);
        }

        if (status === "Cancelled") {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
            }
        }

        order.status = status;
        await order.save({ session });
        await session.commitTransaction();
        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally { await session.endSession(); }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
