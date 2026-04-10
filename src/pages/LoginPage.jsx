import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {
    event.preventDefault();
    navigate("/app", {
      state: {
        username,
        hasPassword: Boolean(password)
      }
    });
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>DMP Shohayok</h1>
        <p>Duty Officer Login (Demo)</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="officer.username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
