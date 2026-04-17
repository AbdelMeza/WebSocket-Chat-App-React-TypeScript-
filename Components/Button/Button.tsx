import b from './Button.module.scss'

type ButtonProps = {
    content: string
    type: string
    size: number // Expected: 1, 2..etc
    isDisabled: boolean
    onClick?: () => void
}

export default function Button({ content, type, size, isDisabled, onClick }: ButtonProps) {
    // We construct the key string and access it via bracket notation
    const sizeClass = b[`buttonSize-${size}`]
    const typeClass = b[`buttonType-${type}`]
    const disabledClass = isDisabled ? b.disabled : ""

    return (
        <button 
            // Combining static classes and dynamic CSS module classes
            className={`button-element ${b.mainButton} ${typeClass} ${sizeClass} ${disabledClass}`}
            disabled={isDisabled}
            onClick={onClick}
        >
            {content}
        </button>
    )
}