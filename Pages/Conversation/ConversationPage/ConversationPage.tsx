import './ConversationPage.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../../../src/socket';
import useMessagesStore from '../../../Stores/useMessages';
import useActivityStore from '../../../Stores/useUserActivity';
import LoadingSpinner from '../../../Components/LoadingSpinner/LoadingSpinner';
import { MessageTypingIndicator } from '../../../Components/MessageItem/MessageItem';
import MessageItem from '../../../Components/MessageItem/MessageItem';
import useUserData from '../../../Stores/userData';
import DefaultProfile, { DefaultGroupProfile } from '../../../Components/DefaultProfilePicture/DefaultProfilePicture';
import useChat from '../../../Stores/useChat';

export default function ConversationPage() {
    const { user } = useUserData();
    const { chats } = useChat();
    const { conversationId } = useParams();
    const { messagesList, getMessages, createMessage, messagesLoading } = useMessagesStore();
    const [newMessage, setNewMessage] = useState("");
    const messageListRef = useRef<HTMLDivElement>(null);
    const lastTypingEmit = useRef<number>(0);

    const isTyping = useActivityStore((state) =>
        conversationId ? state.typingUsers[conversationId] : false
    );

    useEffect(() => {
        if (conversationId) {
            getMessages(conversationId);
        }
    }, [conversationId, getMessages]);

    const chatsList = Array.isArray(chats) ? chats : [];
    const currentChat = chatsList.find(chat => chat._id === conversationId);
    const otherParticipants = currentChat?.participants.filter((p) => p._id !== user?.id) || [];

    const isOnline = useActivityStore(state =>
        !currentChat?.isGroup && otherParticipants[0]?._id ? state.onlineUsers.has(otherParticipants[0]._id) : false
    );

    const onlineMembersCount = otherParticipants.filter(p =>
        useActivityStore.getState().onlineUsers.has(p._id)
    ).length;

    const lastSeenFromStore = useActivityStore(state =>
        otherParticipants[0]?._id ? state.lastSeenDates[otherParticipants[0]._id] : null
    );
    const effectiveLastSeen = lastSeenFromStore || otherParticipants[0]?.lastSeen;

    const isGroup = currentChat?.isGroup;
    const displayName = isGroup
        ? (otherParticipants.map((p: any) => p?.username).join(', '))
        : (otherParticipants[0]?.username || "User");

    const getRelativeTime = (lastSeen: Date | string | undefined) => {
        if (isGroup) {
            if (onlineMembersCount > 0) {
                return <span className="activity"><span className="activity-indicator online-indicator"></span>{onlineMembersCount} online</span>;
            }
            return <span className="activity"><span className="activity-indicator offline-indicator"></span>Offline</span>;
        }

        if (!lastSeen) return <span className="activity"><span className="activity-indicator offline-indicator"></span>Offline</span>;

        const date = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
        if (isNaN(date.getTime())) return "Invalid date";

        const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (diffInSeconds < 60) return <span className="activity">Online just now</span>;

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return <span className="activity">{`Online ${diffInMinutes}m ago`}</span>;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return <span className="activity">{`Online ${diffInHours}h ago`}</span>;

        const diffInDays = Math.floor(diffInHours / 24);
        return <span className="activity">{`Online ${diffInDays}d ago`}</span>;
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        const now = Date.now();
        if (now - lastTypingEmit.current > 2000) {
            socket.emit("user:typing", { chatId: conversationId, receiversIds: otherParticipants.map(p => p._id) });
            lastTypingEmit.current = now;
        }
    };

    const handleSendMessage = useCallback(async () => {
        if (!user || !conversationId || newMessage.trim() === "") return;
        const receiversIds = otherParticipants.map(p => p._id);

        await createMessage({
            senderId: user.id,
            receiversIds: receiversIds,
            chatId: conversationId,
            content: newMessage.trim()
        });

        setNewMessage("");
    }, [user, otherParticipants, conversationId, newMessage, createMessage]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTo({
                top: messageListRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messagesList, isTyping]);

    if (!currentChat) return null;

    return (
        <div className="conversation-page">
            <div className="content">
                <div className="upper-content informations-container">
                    <div className="user-data">
                        <div className="avatar-container">
                            {isGroup ?
                                <DefaultGroupProfile size={2} defaultColor={currentChat?.defaultColor ?? null} /> :
                                <DefaultProfile
                                    username={(otherParticipants[0] as any)?.fullname}
                                    defaultColor={(otherParticipants[0] as any)?.defaultProfileColor}
                                    size={3}
                                />
                            }
                        </div>
                        <div className="informations-container">
                            <span className="username">{displayName}</span>
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
                            <svg xmlns="http://www.w3.org/2000/svg" width={25} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                        </div>
                        <div className="call-btn camera-call-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width={25} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="messages-container">
                    <div className="content" ref={messageListRef}>
                        {messagesLoading ? (
                            <LoadingSpinner />
                        ) : messagesList && messagesList.length > 0 ? (
                            <>
                                {messagesList.map((msg: any) => (
                                    <MessageItem
                                        key={msg._id}
                                        sender={msg.senderId}
                                        content={msg.content}
                                        fromGroup={isGroup}
                                        timestamp={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    />
                                ))}
                                {isTyping && <MessageTypingIndicator user={otherParticipants[0]} />}
                            </>
                        ) : (
                            <div className="empty-chat-container">
                                {isTyping && <MessageTypingIndicator user={otherParticipants[0]} />}
                                <span className="empty-messages">
                                    {isGroup ? "Start the group conversation" : `Start a conversation with ${otherParticipants[0]?.username || 'this user'}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lower-content">
                    <input
                        type="text"
                        value={newMessage}
                        placeholder="Type your message here..."
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="send-btn" onClick={handleSendMessage}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}