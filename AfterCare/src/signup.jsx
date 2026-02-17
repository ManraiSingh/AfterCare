import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./signup.css";
import { FaGoogle } from "react-icons/fa";

import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const provider = new GoogleAuthProvider();

  // Email signup
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  // Google signup
  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="wrapper">
      <div className="signupcard">
        <h1>Welcome to AfterCare!</h1>

        <p className="text">
          Create your account to begin your recovery journey
        </p>

        <form className="form" onSubmit={handleSignup}>
          <input type="text" placeholder="First Name" required />
          <input type="text" placeholder="Last Name" required />
          <input
            type="number"
            placeholder="Age"
            required
            onChange={(e) => localStorage.setItem("age", e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="signupbtn">
            Sign Up
          </button>

          <button
            type="button"
            className="googlebtn"
            onClick={handleGoogleSignup}
          >
            <FaGoogle className="google" />
            Sign up with Google
          </button>
        </form>

        <p className="loginlink">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}