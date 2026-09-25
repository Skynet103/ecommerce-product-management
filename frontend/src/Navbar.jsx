function Navbar({
    userRole,
    cartCount,
    onProducts,
    onCart,
    onOrders,
    onAdminOrders,
    onLogout
}) {
    return (
        <nav className="navbar">
            <h2
                className="navbar-brand"
                onClick={onProducts}
            >
                E-Commerce
            </h2>

            <div className="navbar-links">
                <button onClick={onProducts}>
                    Products
                </button>

                {userRole === "user" && (
                    <>
                        <button onClick={onCart}>
                            🛒 Cart ({cartCount})
                        </button>

                        <button onClick={onOrders}>
                            📦 My Orders
                        </button>
                    </>
                )}

                {userRole === "admin" && (
                    <button onClick={onAdminOrders}>
                        📦 All Orders
                    </button>
                )}

                <button
                    className="navbar-logout"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;