const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const connectDB = require("./config/db");

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("Missing required environment variables: MONGO_URI and JWT_SECRET");
    process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "100kb" }));

connectDB();

app.get("/", (req, res) => res.send("E-Commerce Product Management API"));
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server is running on port ${PORT}`));
