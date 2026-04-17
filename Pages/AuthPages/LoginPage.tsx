import './AuthPages.scss'
import { useEffect, useState } from "react"
import useAuth from '../../Stores/useAuth'
import { useNavigate } from 'react-router-dom'
import Input from "../../Components/Inputs/Inputs"
import Button from "../../Components/Button/Button"

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, errors, authLoading, clearErrors } = useAuth()
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        // Clear errors when the component mounts or when the user starts typing
        return () => {
            clearErrors()
        }
    }, [identifier, password])

    // Form submission handler
    const handleSubmit = async () => {
        const success = await login({ identifier, password })
        if (success) {
            navigate("/") // Redirect to home page on successful login
        }
    }

    // Helper to find a specific error message by field name
    const getFieldError = (fieldName: string) => {
        return errors?.find(e => e.field === fieldName)?.message
    }

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
    }, [identifier, password]) 

    return (
        <div className="login-page">
            <div className="form-container">
                <div className="form-content">
                    <div className="upper-content">
                        <InputsContainer
                            label="Username or email"
                            inputType="text"
                            value={identifier}
                            onChange={setIdentifier}
                            error={getFieldError("identifier")}
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
                        <span className="auth-switch">Don't have an account? <span className="switch-link" onClick={() => navigate("/signup")}>Sign up</span> </span>
                    </div>
                    <div className="lower-content">
                        {/* Using a wrapper div or a dedicated button prop for click events */}
                        <div onClick={handleSubmit}>
                            <Button type="main" size={2} content={authLoading ? "Logging in..." : "Login"} isDisabled={false} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

type InputsContainerProps = {
    label: string
    inputType: string
    value: string
    onChange: (value: string) => void
    error?: string // Changed to optional
}

function InputsContainer({ label, inputType, value, onChange, error }: InputsContainerProps) {
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
    )
}