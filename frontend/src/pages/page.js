import { useState, useEffect } from "react";
import styles from "../styles/page.module.css";
import Logo from "../assests/Zealous.png";
import '../styles/bg.css';
import axios from "axios";

export default function EnhancedSignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState({ email: false, password: false });

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    const newErrors = {
      email: email.trim() === "",
      password: password.trim() === "",
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!validateForm()) {
      return; // Prevent submission if validation fails
    }
    alert(`Email: ${email}\nPassword: ${password}`);
    const userData = {
      email,
      password,
    };
    try {
      const response = await axios.post("http://localhost:4000/user_gateway/user/login", userData);
      console.log(response);
      console.log(response.data);
      if (response && response.data) {
        sessionStorage.setItem("true", JSON.stringify(response.data));
        window.location.assign("/");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className={`${styles.container} ${mounted ? styles.mounted : ""}`}>
      {/* Decorative elements */}
      <div className={`${styles.decorativeCircle} ${styles.circle1}`}></div>
      <div className={`${styles.decorativeCircle} ${styles.circle2}`}></div>

      <div className={styles.card}>
        {/* Card pattern */}
        <div className={styles.cardPattern}></div>

        <div className={styles.cardContent}>
          {/* Logo/Brand element */}
          <div className={styles.logoContainer}>
            <div className={`${styles.logo} ${mounted ? styles.logoMounted : ""}`}>
              <img
                src={Logo}
                alt="Logo"
                className="logo"
                style={{ width: "200px", height: "100px" }}
              />
            </div>
          </div>

          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to continue</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0c83c8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0c83c8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className={styles.passwordToggle}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className={`${styles.submitButton} ${isLoading ? styles.loading : ""}`}
              disabled={isLoading}
            >
              {isLoading ? <div className={styles.spinner}></div> : "Sign In"}
            </button>

            <div className={`${styles.signupContainer} ${mounted ? styles.signupMounted : ""}`}>
              <p>Learn, Practice, Implement, Career</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
