import { Link } from "react-router-dom";
import "./signup.css";
import { FaGoogle } from "react-icons/fa";

export default function Signup() {
  return (
    <div className="wrapper">
      <div className="signupcard">
        <h1>Welcome to AfterCare!</h1>
        <p className="text">
          Create your account to begin your recovery journey
        </p>

        <form className="form">
          <input type="text" placeholder="First Name" required />
          <input type="text" placeholder="Last Name" required />
          <input type="number" placeholder="Age" required />
          <input type="email" placeholder="Email Address" required />

          <button type="submit" className="signupbtn">
            Sign Up
          </button>

          <button type="button" className="googlebtn">
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

