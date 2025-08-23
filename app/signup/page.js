import Header from "@/components/Header";
import "../../styles/auth.css";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <>
      <Header />

      <main className="main-container">
        <div className="background">
          <img
            src="/Login-Signup Background.png"
            alt="Background"
            className="not-mobile"
          />
          <img
            src="/Login-Signup Background Mobile Variation.jpeg"
            alt="Background Mobile"
            className="mobile"
          />
        </div>

        <div className="container">
          <div className="top-bar">
            <Link href="/login" className="left button button-shape bodyFont off">Log In</Link>
            <button className="right button button-shape bodyFont">Sign Up</button>
          </div>

          <h1 className="titleFont header-size">Sign Up for FlameSpark</h1>
          <p className="error-message titleFont">Error: This is an error</p>

          <div className="auth-content">
            <div className="email-and-user">
              <div className="input-container">
                <div className="label">
                  <i className="fa fa-envelope"></i>
                  <p className="label-color bodyFont body-size">Email Address</p>
                </div>
                <input
                  className="bodyFont input-field"
                  type="email"
                  placeholder="Enter text here..."
                />
              </div>

              <div className="input-container">
                <div className="label">
                  <i className="fa fa-tag"></i>
                  <p className="label-color bodyFont body-size">Username</p>
                </div>
                <input
                  className="bodyFont input-field"
                  type="text"
                  placeholder="Enter text here..."
                />
              </div>
            </div>

            <div className="input-container">
              <div className="label">
                <i className="fa fa-lock"></i>
                <p className="label-color bodyFont body-size">Password</p>
              </div>
              <input
                className="bodyFont input-field"
                type="password"
                placeholder="Enter text here..."
              />
            </div>

            <div className="input-container">
              <div className="label">
                <i className="fa fa-lock"></i>
                <p className="label-color bodyFont body-size">Confirm Password</p>
              </div>
              <input
                className="bodyFont input-field"
                type="password"
                placeholder="Enter text here..."
              />
            </div>

            <div className="checkbox-container">
              <input
                id="remember-me-checkbox"
                className="checkbox blue"
                type="checkbox"
                defaultChecked
              />
              <label
                htmlFor="remember-me-checkbox"
                className="bodyFont body-size"
              >
                Remember Me
              </label>
            </div>

            <button className="button-shape input-button bodyFont blue">
              Signup
            </button>

            <div className="bottom-section">
              <button className="button-shape input-button bodyFont clear">
                <img
                  src="/logo_google.png"
                  alt="Google Logo"
                />
                Signup with Google
              </button>
              <p className="label-color bodyFont account-if">
                Already have an account? <Link href="/login">log in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}