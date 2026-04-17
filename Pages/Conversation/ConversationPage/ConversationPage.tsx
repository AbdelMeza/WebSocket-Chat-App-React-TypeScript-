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
                <div className="upper-content informations-conta">
                    <div className="user-data">
                        <div className="avatar-container">
                            <div className="avatar">
                                <img src={otherParticipant?.avatar || avatarUrl} alt="user-avatar" />
                            </div>
                        </div>
                        <div className="informations-container">
                            <span className="username">{(otherParticipant as any)?.username || "User"}</span>
                            <span className="activity-status">
                                {isOnline ? (
                                    <span className="activity"><span className="activity-indicator online-indicator"></span>Online</span>
                                ) : (
                                    <span className="activity"><span className="activity-indicator offline-indicator"></span>Offline</span>
                                )}
                            </span>
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
                                            senderId={msg.senderId?._id}
                                            content={msg.content}
                                            timestamp={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        />
                                    ))
                                }
                                {isTyping && <MessageTypingIndicator avatarUrl={otherParticipant?.avatar || avatarUrl} />}
                            </>
                        ) : isTyping ? (
                            <MessageTypingIndicator avatarUrl={otherParticipant?.avatar || avatarUrl} />
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