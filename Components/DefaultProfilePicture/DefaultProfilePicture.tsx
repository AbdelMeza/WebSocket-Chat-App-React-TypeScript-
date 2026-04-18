import './DefaultProfilePicture.scss'
import p from './Profile.module.scss'

type DefaultProfileProps = {
    username: string
    defaultColor: string
    size: number
}

export default function DefaultProfile({ username, defaultColor, size }: DefaultProfileProps) {
    const nameParts = username.trim().split(/\s+/)
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "?"
    const secondInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : ""

    const sizeClass = p[`profileSize-${size}`]

    return (
        <div className={`default-profile-picture ${sizeClass}`}>
            <div className="avatar" style={{ backgroundColor: `rgb(${defaultColor}, 0.2)`, borderColor: `rgb(${defaultColor}, 0.3)` }}>
                <span className="initial" style={{ color: `rgb(${defaultColor})` }}>
                    {firstInitial}{secondInitial}
                </span>
            </div>
        </div>
    )
}