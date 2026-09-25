import { useState } from "react";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    return (
        <div>
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />

            <button
                onClick={async () => {
                    try {
                        const response = await fetch(
                            "http://localhost:5000/api/users/login",
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
                    }
                }}
            >
                Login
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