import { useState } from "react";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="login-page">
            <h2>E-Commerce Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                disabled={isLoading}
                onChange={(event) => setEmail(event.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                disabled={isLoading}
                onChange={(event) => setPassword(event.target.value)}
            />

            <button
                disabled={isLoading}
                onClick={async () => {
                    setIsLoading(true);
                    setMessage("");
                    try {
                        const response = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/users/login`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    email,
                                    password
                                })
                            }
                        );

                        const data = await response.json();

                        if (response.ok) {
                            localStorage.setItem("token", data.token);
                            console.log("Login successful");
                            onLogin();
                        } else {
                            setMessage(data.message);
                        }
                    } catch (error) {
                        console.error("Login error:", error);
                        setMessage("Unable to connect to server");
                    } finally {
                        setIsLoading(false);
                    }
                }}
            >
                {isLoading ? "Logging in..." : "Login"}
            </button>

            {message && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                    {message}
                </p>
            )}

        </div>
    );
}

export default Login;
