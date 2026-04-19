import { avatarUrl } from '../../src/App'
import useUserData from '../../Stores/userData'
import useActivityStore from '../../Stores/useUserActivity'
import DefaultProfile, { DefaultGroupProfile } from '../DefaultProfilePicture/DefaultProfilePicture'
import './ConversationItem.scss'

type ConversationItemProps = {
    participants: any
    isGroup: boolean
    onClick: () => void
    lastMessage: string
    defaultColor: string
    timestamp: string | null
    unread: boolean
}

export function ConversationItem({ participants, isGroup, onClick, defaultColor, lastMessage, timestamp, unread }: ConversationItemProps) {
    const { user } = useUserData()
    let otherParticipants = participants.filter((p: any) => p._id !== user!.id)
    const isOnline = useActivityStore((state) =>
        otherParticipants.some((p: any) => state.onlineUsers.has(p._id))
    )

    const displayName = isGroup
        ? otherParticipants.map((p: any) => p.username).join(', ')
        : (otherParticipants[0]?.username || "User")

    return <div className={`conversation-item ${isGroup ? "group" : ""}`} onClick={onClick}>
        <div className="content avatar-container">
            {
                isGroup ? <DefaultGroupProfile size={3} defaultColor={defaultColor} />
                    : otherParticipants[0].avatarUrl ? <div className="avatar">
                        <img src={avatarUrl} alt="User Avatar" />
                    </div> : <DefaultProfile username={otherParticipants[0].fullname} defaultColor={otherParticipants[0].defaultProfileColor} size={3} />
            }
            <span className={`online-badge ${isOnline ? "appear" : ""}`}></span>
        </div>
        <div className="content information-container">
            <div className="conversation-info">
                <div className="conversation-name">{displayName}</div>
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