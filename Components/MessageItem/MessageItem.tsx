import { avatarUrl } from "../../src/App"
import useUserData from "../../Stores/userData"
import "./MessageItem.scss"

type messageItemProps = {
    senderId: string
    content: string
    timestamp: string
}

export default function MessageItem({ senderId, content, timestamp }: messageItemProps) {
    const currentUserId = useUserData((state) => state.user?.id)
    const currentUserIsSender = currentUserId === senderId

    return <div className={`message-item ${currentUserIsSender ? "sender" : "receiver"}`}>
        {!currentUserIsSender && <div className="avatar">
            <img src={`${avatarUrl}`} alt="user-avatar" />
        </div>}
        <div className="message-content">{content}</div>
        <span className="timestamp">{timestamp}</span>
    </div>
}

export function MessageTypingIndicator({ avatarUrl }: { avatarUrl?: string }) {
    return <span className="message-item typing">
        <div className="avatar">
            <img src={avatarUrl} alt="user-avatar" />
        </div>
        <div className="message-content">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
        </div>
    </span>
}