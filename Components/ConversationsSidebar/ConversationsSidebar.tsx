import { useNavigate } from 'react-router-dom';
import useElementsState from '../../Stores/useStates';
import useUserData from '../../Stores/userData';
import v from "../../src/StyleSheet/_variable.module.scss"
import './ConversationsSidebar.scss';
import { ConversationItem, ConversationItemSkeleton } from '../ConversationItem/ConversationItem';
import useChat from '../../Stores/useChat';

export default function ConversationsSidebar() {
    const navigate = useNavigate()
    const { user } = useUserData()
    const { chatsLoading } = useChat()
    const { toggleAddConv } = useElementsState()

    console.log(user)

    const openConversation = (conversationId: string) => {
        if (!conversationId) return

        navigate(`/inbox/${conversationId}`)
    }

    return <div className="conversations-sidebar">
        <div className="upper-content">
            <div className="username" >{user?.username}</div>
            <span className="add-conversation" onClick={() => toggleAddConv()}>
                <svg xmlns="http://www.w3.org/2000/svg" width={25} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </span>
        </div>
        <div className={`middle-content ${v.height1} ${v.pad1}`} >
            <div className="search-bar">
                <svg xmlns="http://www.w3.org/2000/svg" width={15} viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                </svg>
                <input type="text" placeholder="Search conversations..." />
            </div>
        </div>
        <div className="lower-content">
            <div className="header">
                <span className="header-text">Messages</span>
            </div>
            <div className="conversations-wrapper">
                {chatsLoading ? <ConversationItemSkeleton quantity={4} /> : user !== null && user?.chats.length > 0 ? user?.chats.map((chat: any) => (
                    <ConversationItem
                        key={chat?._id}
                        userId={(chat?.participants as any[]).find((p: any) => p._id !== user?.id)?._id}
                        username={(chat?.participants as any[]).find((p: any) => p._id !== user?.id)?.username || "Unknown User"}
                        fullname={(chat?.participants as any[]).find((p: any) => p._id !== user?.id)?.fullname || "Unknown User"}
                        defaultColor={(chat?.participants as any[]).find((p: any) => p._id !== user?.id)?.defaultProfileColor || "Unknown User"}
                        onClick={() => openConversation(chat?._id)}
                        lastMessage={chat?.lastMessage?.content || <span className="no-messages">Start a conversation...</span>}
                        timestamp={chat?.lastMessage?.timestamp ? new Date(chat?.lastMessage?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null}
                        unread={false}
                    />
                )) : null
                }
            </div>
        </div>
    </div >
}
