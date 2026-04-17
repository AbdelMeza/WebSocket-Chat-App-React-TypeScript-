import { socket } from './socket'
import './StyleSheet/common.scss'
import useChat from '../Stores/useChat'
import { lazy, useEffect } from 'react'
import useTheme from '../Stores/useTheme'
import useUserData from '../Stores/userData'
import useActivityStore from '../Stores/useUserActivity'
import { Route, Routes, Navigate } from "react-router-dom"
import useMessagesStore from '../Stores/useMessages'

const HomePage = lazy(() => import("../Pages/HomePage/HomePage"))
const LoginPage = lazy(() => import("../Pages/AuthPages/LoginPage"))
const SignupPage = lazy(() => import("../Pages/AuthPages/SignupPage"))
const ConversationsOverview = lazy(() => import("../Pages/Conversation/ConversationsOverview"))
const ConversationPage = lazy(() => import("../Pages/Conversation/ConversationPage/ConversationPage"))
const ConversationNeutralPage = lazy(() => import("../Pages/Conversation/ConversationNeutralPage"))
export const avatarUrl = import.meta.env.VITE_AVATAR_URL

function App() {
  const { theme } = useTheme()
  const { user } = useUserData()
  const { updateUserStatus, setOnlineUsers, typingUsers, setTypingStatus } = useActivityStore()
  const { updateChats } = useChat()

  useEffect(() => {
    if (!theme) {
      const savedTheme = localStorage.getItem("theme") || "light"
      document.body.setAttribute("data-theme", savedTheme)
    } else {
      document.body.setAttribute("data-theme", theme)
    }

  }, [theme])


  useEffect(() => {
    if (!user?.id) return

    socket.connect()
    socket.emit("user:join", { userId: user.id })

    const handleChatCreated = (newChat: any) => updateChats(newChat)
    const handleOnlineList = (users: string[]) => setOnlineUsers(users)
    const handleStatusChange = ({ userId, status }: { userId: string, status: 'online' | 'offline' }) => {
      updateUserStatus(userId, status);
    }

    let typingTimeout: any
    const handleTypingStatus = ({ chatId, isTyping }: { chatId: string, isTyping: boolean }) => {
      setTypingStatus(chatId, isTyping);

      if (isTyping) {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          setTypingStatus(chatId, false);
        }, 3000);
      }
    };

    socket.on("chat:created", handleChatCreated)
    socket.on("user:online_list", handleOnlineList)
    socket.on("user:status_changed", handleStatusChange)
    socket.on("user:typing_status", handleTypingStatus)
    socket.on("message:received", (message: any) => {
      useMessagesStore.setState((state) => {
        const exists = state.messagesList.some(m => m?._id === message._id);
        if (exists) return state;

        return {
          messagesList: [...state.messagesList, message]
        };
      });
    });

    return () => {
      socket.off("chat:created", handleChatCreated)
      socket.off("user:online_list", handleOnlineList)
      socket.off("user:status_changed", handleStatusChange)
      socket.off("user:typing_status", handleTypingStatus)
      clearTimeout(typingTimeout);
      socket.disconnect()
    };
  }, [user, updateUserStatus, updateChats, setOnlineUsers, setTypingStatus])

  return (
    <Routes>
      <Route path="/" element={<HomePage />}>
        <Route index element={<Navigate to="/inbox" replace />} />
        <Route path="inbox" element={<ConversationsOverview />}>
          <Route index element={<ConversationNeutralPage />} />
          <Route path=":conversationId" element={<ConversationPage />} />
        </Route>

        <Route path="*" element={<div className="not-found">Page not found</div>} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  )
}

export default App