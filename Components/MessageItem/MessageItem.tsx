import { avatarUrl } from "../../src/App"
import useUserData from "../../Stores/userData"
import DefaultProfile from "../DefaultProfilePicture/DefaultProfilePicture"
import "./MessageItem.scss"

type messageItemProps = {
    sender: any
    content: string
    timestamp: string
    fromGroup: boolean | undefined
}

export default function MessageItem({ sender, content, timestamp, fromGroup }: messageItemProps) {
    const currentUserId = useUserData((state) => state.user?.id)
    const currentUserIsSender = currentUserId === sender?._id

    return <div className={`message-item ${currentUserIsSender ? "sender" : "receiver"}`}>
        {!currentUserIsSender ? sender?.avatarUrl ?
            <div className="avatar">
                <img src={`${avatarUrl}`} alt="user-avatar" />
            </div> :
            <DefaultProfile username={sender?.fullname} defaultColor={sender?.defaultProfileColor} size={1} /> : null
        }
        <div className="content-container">
            {fromGroup && !currentUserIsSender && <span className="username">{sender.username}</span>}
            <div className="message-content" style={fromGroup ? { backgroundColor: `rgba(${sender?.defaultProfileColor}, 0.1)` } : {}}>{content}</div>
        </div>
        <span className="timestamp">{timestamp}</span>
    </div>
}

export function MessageTypingIndicator({ user }: { user?: any }) {
    return <span className="message-item typing">
        {user.avatarUrl ?
            <div className="avatar">
                <img src={avatarUrl} alt="user-avatar" />
            </div> :
            <DefaultProfile username={user.fullname} defaultColor={user.defaultProfileColor} size={1} />
        }
        <div className="message-content">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
        </div>
    </span>
}