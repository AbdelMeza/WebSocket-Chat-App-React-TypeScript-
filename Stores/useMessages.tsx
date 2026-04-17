import { create } from "zustand";
import API_URL from "./api_url";

type MessageType = {
    _id: string
    receiverId: string
    content: string
    timestamp: Date
}

type MessageState = {
    messagesList: MessageType[]
    messagesLoading: boolean
    getMessages: (chatId: string) => Promise<void>
    createMessage: ({ senderId, receiverId, chatId, content }: { senderId: string, receiverId: string, chatId: string, content: string }) => Promise<void>
}

const useMessagesStore = create<MessageState>((set) => ({
    messagesList: [],
    messagesLoading: false,

    getMessages: async (chatId) => {
        try {
            set({ messagesLoading: true })

            const res = await fetch(`${API_URL}/messages/get`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId })
            })

            const data = await res.json()

            if (!res.ok) {
                set({ messagesLoading: false })
                return
            }

            set({ messagesLoading: false })
            set({ messagesList: data })
        } catch (error) {
            console.log(error)
        } finally {
            set({ messagesLoading: false })
        }
    },

    createMessage: async ({ senderId, receiverId, chatId, content }) => {
        try {
            await fetch(`${API_URL}/messages/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senderId, receiverId, chatId, content })
            })
        } catch (error) {
            console.log(error)
        }
    }
}))

export default useMessagesStore