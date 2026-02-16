import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="wrapper">
      <div className="logincard">
        <h1>Welcome to AfterCare!</h1>
        <p className="text">
          Login to continue your recovery journey.
        </p>

        <form className="form">
          <input type="text" placeholder="First Name" required />
          <input type="email" placeholder="Email Address" required />
          <div className="password">
            <input
              type={showPassword ? "text" : "password"} placeholder="Password" required/>
            <span className="eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" className="loginbtn">
            Login
          </button>
        </form>

        <p className="signuplink">
          Don't have an account?
          <Link to="/signup"> Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

