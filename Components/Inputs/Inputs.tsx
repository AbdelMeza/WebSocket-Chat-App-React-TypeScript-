import i from "./Inputs.module.scss"

type InputType = {
    id: string | undefined,
    inputType: string,
    value: string,
    onChange: (value: string) => void
    placeholder: string
    hasError: boolean | undefined
}

export default function Input({ id, inputType, value, onChange, placeholder, hasError }: InputType) {
    return (
        <input
            id={id}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`input-element ${i.input} ${hasError ? i.inputError : ""}`}
        />
    )
}