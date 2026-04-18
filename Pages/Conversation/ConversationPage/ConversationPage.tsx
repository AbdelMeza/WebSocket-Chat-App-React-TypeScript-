import './ConversationPage.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { avatarUrl } from '../../../src/App';
import { useParams } from 'react-router-dom';
import { socket } from '../../../src/socket';
import useMessagesStore from '../../../Stores/useMessages';
import useActivityStore from '../../../Stores/useUserActivity';
import LoadingSpinner from '../../../Components/LoadingSpinner/LoadingSpinner';
import { MessageTypingIndicator } from '../../../Components/MessageItem/MessageItem';
import MessageItem from '../../../Components/MessageItem/MessageItem'; // Assure-toi de l'import
import useUserData, { chat as Chat, participant as Participant } from '../../../Stores/userData';
import DefaultProfile from '../../../Components/DefaultProfilePicture/DefaultProfilePicture';

export default function ConversationPage() {
    const { user } = useUserData();
    const { conversationId } = useParams();
    const { messagesList, getMessages, createMessage, messagesLoading } = useMessagesStore();
    const [newMessage, setNewMessage] = useState("");
    const messageList = useRef<HTMLDivElement>(null);
    const isTyping = useActivityStore((state) =>
        conversationId ? state.typingUsers[conversationId] : false
    );


    useEffect(() => {
        if (!conversationId) return;
        getMessages(conversationId);
    }, [conversationId, getMessages]);

    const chats = Array.isArray(user?.chats) ? user.chats : [] as Chat[];
    const currentChat = chats.find(chat => chat._id === conversationId);
    const otherParticipant = currentChat?.participants.find((p: Participant) => p._id !== user?.id);
    const isOnline = useActivityStore(state => state.onlineUsers.has(otherParticipant?._id || ""));
    const lastSeenFromStore = useActivityStore(state =>
        otherParticipant?._id ? state.lastSeenDates[otherParticipant._id] : null
    );
    const effectiveLastSeen = lastSeenFromStore || otherParticipant?.lastSeen;
    const getRelativeTime = (lastSeen: Date | string | undefined) => {
        if (!lastSeen) return <span className="activity"><span className="activity-indicator offline-indicator"></span>Offline</span>

        const date = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;

        if (isNaN(date.getTime())) return "Invalid date";

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return <span className="activity">Online just now</span>;

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return <span className="activity">{`Online ${diffInMinutes}m ago`}</span>;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return <span className="activity">{`Online ${diffInHours}h ago`}</span>;

        const diffInDays = Math.floor(diffInHours / 24);
        return <span className="activity">{`Online ${diffInDays}d ago`}</span>;
    }

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        const messageValue = e.target.value;
        setNewMessage(messageValue);
        socket.emit("user:typing", { chatId: conversationId, receiverId: otherParticipant?._id });
    };

    const handleSendMessage = useCallback(async () => {
        if (!user || !otherParticipant || !conversationId || newMessage.trim() === "") return;

        await createMessage({
            senderId: user.id,
            receiverId: otherParticipant._id,
            chatId: conversationId,
            content: newMessage.trim()
        });

        setNewMessage("")
    }, [user, otherParticipant, conversationId, newMessage, createMessage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSendMessage]);

    useEffect(() => {
        if (!conversationId || messagesLoading) return;

        const handleScroll = () => {
            if (messageList.current) {
                messageList.current.scrollTop = messageList.current.scrollHeight;
            }
        };

        requestAnimationFrame(handleScroll);

    }, [messagesList, isTyping, messagesLoading, conversationId]);

    if (!currentChat) return null;

    return (
        <div className="conversation-page">
            <div className="content">
                <div className="upper-content informations-container">
                    <div className="user-data">
                        <div className="avatar-container">
                            {user?.avatarUrl ? <div className="avatar">
                                <img src={otherParticipant?.avatar || avatarUrl} alt="user-avatar" />
                            </div> : <DefaultProfile username={(otherParticipant as any)?.fullname} defaultColor={(otherParticipant as any)?.defaultProfileColor} size={3} />}
                        </div>
                        <div className="informations-container">
                            <span className="username">{(otherParticipant as any)?.username || "User"}</span>
                            <span className="activity-status">
                                {isOnline ?
                                    <span className="activity"><span className="activity-indicator online-indicator"></span>Online</span>
                                    : getRelativeTime(effectiveLastSeen)
                                }
                            </span>
                        </div>
                    </div>
                    <div className="call-content">
                        <div className="call-btn audio-call-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width={25} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                        </div>
                        <div className="call-btn camera-call-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width={25} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="messages-container">
                    <div className="content" ref={messageList} >
                        {messagesLoading ? (
                            <LoadingSpinner />
                        ) : messagesList && messagesList.length > 0 ? (
                            <>
                                {
                                    messagesList.map((msg: any) => (
                                        <MessageItem
                                            key={msg._id}
                                            sender={msg.senderId}
                                            content={msg.content}
                                            timestamp={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        />
                                    ))
                                }
                                {isTyping && <MessageTypingIndicator user={otherParticipant} />}
                            </>
                        ) : isTyping ? (
                            <MessageTypingIndicator user={otherParticipant} />
                        ) : (
                            <span className="empty-messages">Start a conversation with {otherParticipant?.username}</span>
                        )}
                    </div>
                </div>

                <div className="lower-content">
                    <input
                        type="text"
                        value={newMessage}
                        placeholder="Type your message here..."
                        onChange={handleTyping}
                    />
                    <div className="send-btn" onClick={handleSendMessage}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </div>
                </div>
            </div>
        </div >
    );
}