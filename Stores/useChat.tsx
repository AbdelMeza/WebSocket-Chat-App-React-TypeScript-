import { create } from "zustand"
import useUserData from "./userData"

const API_URL: string | undefined = import.meta.env.VITE_API_URL

type ChatState = {
    chatId: string | null
    setChatId: (id: string) => void
    chatsLoading: boolean
    getChats: () => Promise<void>
    createChat: ({ participantId, currentUserId }: { participantId: string; currentUserId: string }) => Promise<string | void>
    updateChats: (newChat: any) => void
}

const useChat = create<ChatState>((set) => ({
    chatId: null,
    setChatId: (id: string) => set({ chatId: id }),
    chatsLoading: false,

    getChats: async () => {
        const user_token: string | null = localStorage.getItem("userToken")

        try {
            set({ chatsLoading: true })
            const res = await fetch(`${API_URL}/chat/get/all`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userToken: user_token })
            })

            const data = await res.json()

            if (!res.ok) {
                console.error("Error getting chats:", data.message)
                return
            }

            set({ chatsLoading: false })
            useUserData.setState((state) => ({
                user: state.user
                    ? {
                        ...state.user,
                        chats: Array.isArray(data.user_chats) ? data.user_chats : []
                    }
                    : null
            }))

        } catch (error) {
            set({ chatsLoading: false })
            console.log(error)
        }
    },

    createChat: async ({ participantId, currentUserId }) => {
        try {
            set({ chatsLoading: true })
            const res = await fetch(`${API_URL}/chat/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: participantId,
                    current_user_id: currentUserId
                })
            })

            const data = await res.json()

            if (!res.ok) {
                console.error("Error creating chat:", data.message)
                return
            }

            set({ chatsLoading: false })

            return data.new_chat._id
        } catch (err) {
            console.error("Fetch error in createChat:", err)
            set({ chatsLoading: false })
        }
    },

    updateChats: (newChat) => {
        useUserData.setState((state) => {
            if (!state.user) return state

            const chatExists = state.user.chats.some(c => c._id === newChat._id)
            if (chatExists) return state

            return {
                user: {
                    ...state.user,
                    chats: [newChat, ...state.user.chats]
                }
            }
        })
    },
}))

export default useChat