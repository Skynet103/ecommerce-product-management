const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { items,deliveryDetails } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        if (
            !deliveryDetails ||
            !deliveryDetails.name ||
            !deliveryDetails.phone ||
            !deliveryDetails.address ||
            !deliveryDetails.city ||
            !deliveryDetails.state ||
            !deliveryDetails.pinCode
        ) {
            return res.status(400).json({
                message: "All delivery details are required"
            });
        }

        session.startTransaction();

        // Check stock for every product first
        for (const item of items) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new Error(`Product not found: ${item.name}`);
            }

            if (product.stock < item.quantity) {
                throw new Error(
                    `Not enough stock for ${product.name}. Available stock: ${product.stock}`
                );
            }
        }

        let calculatedTotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.product).session(session);

            calculatedTotal += product.price * item.quantity;
        }

        // Reduce stock
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: -item.quantity
                    }
                },
                {
                    new: true,
                    session
                }
            );
        }

        // Create order
        const order = await Order.create(
            [
                {
                    user: req.user.id,
                    items,
                    deliveryDetails,
                    totalAmount: calculatedTotal
                }
            ],
            { session }
        );

        await session.commitTransaction();

        res.status(201).json({
            message: "Order placed successfully",
            order: order[0]
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Create order error:", error);

        res.status(400).json({
            message: error.message
        });
    }
    finally {
        session.endSession();
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.id
        })
            .populate("items.product", "name image")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("items.product", "name image")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        session.startTransaction();

        const order = await Order.findById(req.params.id).session(session);

        if (!order) {
            throw new Error("Order not found");
        }

        // Restore stock only when cancelling
        // an order that was not already cancelled
        if (status === "Cancelled" && order.status !== "Cancelled") {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.product,
                    {
                        $inc: {
                            stock: item.quantity
                        }
                    },
                    {
                        new: true,
                        session
                    }
                );
            }
        }

        order.status = status;

        await order.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Update order status error:", error);

        res.status(400).json({
            message: error.message
        });

    } finally {
        session.endSession();
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
};