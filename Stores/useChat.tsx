import { create } from "zustand"

const API_URL: string | undefined = import.meta.env.VITE_API_URL

type participant = {
    _id: string
    username: string
    fullname?: string
    avatar?: string
    lastSeen: Date
    defaultProfileColor: string
}

type chat = {
    _id: string
    participants: participant[]
    defaultColor?: string
    isGroup: boolean
}

type ChatState = {
    chats: chat[] | null
    chatId: string | null
    setChatId: (id: string) => void
    chatsLoading: boolean
    getChats: () => Promise<void>
    createChat: ({ participantsIds, isGroup, defaultColor }: { participantsIds: string[], isGroup: boolean, defaultColor?: string | null }) => Promise<string | void>
    updateChats: (newChat: any) => void
}

const useChat = create<ChatState>((set) => ({
    chats: null,
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
            set({ chats: data.user_chats })
        } catch (error) {
            set({ chatsLoading: false })
            console.log(error)
        }
    },

    createChat: async ({ participantsIds, isGroup, defaultColor }) => {
        try {
            set({ chatsLoading: true })
            const res = await fetch(`${API_URL}/chat/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    participants_ids: participantsIds,
                    default_color: defaultColor,
                    is_group: isGroup
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
        set((state) => {
            const currentChats = state.chats || []
            const chatExists = currentChats.some(c => c._id === newChat._id)

            if (chatExists) return state

            return { chats: [newChat, ...currentChats] }
        });
    },
}))

export default useChat