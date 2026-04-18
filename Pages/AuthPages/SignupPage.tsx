import "./AuthPages.scss";
import useAuth from "../../Stores/useAuth";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../Components/Inputs/Inputs";
import Button from "../../Components/Button/Button";

export default function SignupPage() {
  const { signup, errors, authLoading, clearErrors } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const colors = [
    "196, 108, 255",
    "255, 108, 108",
    "108, 255, 157",
    "108, 196, 255",
    "255, 196, 108",
    "255, 108, 235",
    "108, 255, 255",
    "180, 255, 108",
    "255, 235, 108",
    "150, 150, 255"
  ]

  const randomColor = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
  }, [])

  useEffect(() => {
    // Clear errors when the component mounts or when the user starts typing
    return () => {
      clearErrors();
    };
  }, [username, email, password, fullname]);


  // Form submission handler
  const handleSubmit = async () => {
    const success = await signup({ username, email, password, fullname, defaultProfileColor: randomColor });
    if (success) {
      navigate("/"); // Redirect to home page on successful signup
    }
  };

  // Helper to find a specific error message by field name
  const getFieldError = (fieldName: string) => {
    return errors?.find((e) => e.field === fieldName)?.message;
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        handleSubmit()
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [username, email, password, fullname])

  return (
    <div className="signup-page">
      <div className="form-container">
        <div className="form-content">
          <div className="upper-content">
            <div className="inputs-group">
              <InputsContainer
                label="Username"
                inputType="text"
                value={username}
                onChange={setUsername}
                error={getFieldError("username")}
              />
              <InputsContainer
                label="Fullname"
                inputType="text"
                value={fullname}
                onChange={setFullname}
                error={getFieldError("fullname")}
              />
            </div>
            <InputsContainer
              label="Email"
              inputType="text"
              value={email}
              onChange={setEmail}
              error={getFieldError("email")}
            />
            <InputsContainer
              label="Password"
              inputType="password"
              value={password}
              onChange={setPassword}
              error={getFieldError("password")}
            />
          </div>
          <div className="middle-content">
            <span className="auth-switch">Already have an account? <span className="switch-link" onClick={() => navigate("/login")}>Log in</span> </span>
          </div>
          <div className="lower-content">
            {/* Using a wrapper div or a dedicated button prop for click events */}
            <div onClick={handleSubmit}>
              <Button type="main" size={2} content={authLoading ? "Creating account..." : "Create account"} isDisabled={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type InputsContainerProps = {
  label: string;
  inputType: string;
  value: string;
  onChange: (value: string) => void;
  error?: string; // Changed to optional
};

function InputsContainer({
  label,
  inputType,
  value,
  onChange,
  error,
}: InputsContainerProps) {
  return (
    <div className="inputs-container">
      <label htmlFor={label}>{label}</label>
      <Input
        id={label}
        placeholder={""}
        inputType={inputType}
        value={value}
        hasError={!!error}
        onChange={onChange}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
