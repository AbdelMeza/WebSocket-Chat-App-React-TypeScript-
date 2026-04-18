import useActivityStore from '../../Stores/useUserActivity'
import DefaultProfile from '../DefaultProfilePicture/DefaultProfilePicture'
import './ConversationItem.scss'

type ConversationItemProps = {
    userId: string
    username: string
    fullname: string
    defaultColor: string
    avatarUrl?: string
    onClick: () => void
    lastMessage: string
    timestamp: string | null
    unread: boolean
}

export function ConversationItem({ userId, username, fullname, defaultColor, avatarUrl, onClick, lastMessage, timestamp, unread }: ConversationItemProps) {
    const isOnline = useActivityStore((state) => state.onlineUsers.has(userId))

    return <div className="conversation-item" onClick={onClick}>
        <div className="content avatar-container">
            {avatarUrl ? <div className="avatar">
                <img src={avatarUrl} alt="User Avatar" />
            </div> : <DefaultProfile username={fullname} defaultColor={defaultColor} size={3} />
            }
            <span className={`online-badge ${isOnline ? "appear" : ""}`}></span>
        </div>
        <div className="content information-container">
            <div className="conversation-info">
                <div className="conversation-name">{username}</div>
            </div>
            <div className="conversation-meta">
                <div className="last-message">{lastMessage}</div>
                <span className="separator"></span>
                <div className="timestamp">{timestamp}</div>
            </div>
        </div>

        {unread && <div className="unread"></div>}
    </div>
}

export function ConversationItemSkeleton({ quantity = 1 }: { quantity?: number }) {
    return <>
        {Array.from({ length: quantity }).map((_, index) => (
            <div className="conversation-item skeleton" key={index}>
                <div className="content avatar-container">
                    <div className="avatar">
                    </div>
                </div>
                <div className="content skeleton">
                    <div className="conversation-info">
                        <div className="conversation-name skeleton-text"></div>
                    </div>
                    <div className="conversation-meta">
                        <div className="last-message skeleton-text"></div>
                    </div>
                </div>
            </div>
        ))}
    </>
}