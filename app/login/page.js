import Header from "@/components/Header";
import "../../styles/auth.css";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faLock } from '@fortawesome/free-solid-svg-icons'

export default function LoginPage() {
    return (
        <>
            <Header />
        
            <main className="main-container">
                <div className="background">
                    <img src="/Login-Signup Background.png" className="not-mobile"/>
                    <img src="/Login-Signup Background Mobile Variation.jpeg" className="mobile"/>
                </div>
                <div className="container">
                    <div className="top-bar">
                        <button className="left button button-shape bodyFont">Log In</button>
                        <Link href="/signup" className="right button button-shape bodyFont off">Sign Up</Link>
                    </div>

                    <h1 className="titleFont header-size">Log In to FlameSpark</h1>
                    <p className="error-message titleFont">Error: This is an error</p>
                    <div className="auth-content">
                        <div className="input-container">
                            <div className="label">
                                <FontAwesomeIcon icon={faEnvelope} />
                                <p className="label-color bodyFont body-size">Email Address</p>
                            </div>
                            <input className="bodyFont input-field" type="email" placeholder="Enter text here..." />
                        </div>
                        <div className="input-container">
                            <div className="label">
                                <FontAwesomeIcon icon={faLock} />
                                <p className="label-color bodyFont body-size">Password</p>
                            </div>
                            <input className="bodyFont input-field" type="password" placeholder="Enter text here..." />
                        </div>
                        <div className="checkbox-container">
                            <input id="remember-me-checkbox" className="checkbox red" type="checkbox" defaultChecked />
                            <label htmlFor="remember-me-checkbox" className="bodyFont body-size">Remember Me</label>
                        </div>
                        <button className="button-shape input-button bodyFont red">Login</button>
                        <div className="bottom-section">
                            <button className="button-shape input-button bodyFont clear"><img src="/logo_google.png" />Login with Google</button>
                            <p className="label-color bodyFont account-if">Don't have an account? <a href="#">sign up</a></p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}