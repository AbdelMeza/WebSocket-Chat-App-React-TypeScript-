import { create } from 'zustand'

interface ActivityState {
    onlineUsers: Set<string>
    typingUsers: { [chatId: string]: boolean }
    setOnlineUsers: (users: string[]) => void
    updateUserStatus: (userId: string, status: 'online' | 'offline') => void
    setTypingStatus: (chatId: string, status: boolean) => void
}

const useActivityStore = create<ActivityState>((set) => ({
    onlineUsers: new Set(),
    typingUsers: {},

    setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),

    updateUserStatus: (userId, status) => set((state) => {
        const newSet = new Set(state.onlineUsers)
        if (status === 'online') {
            newSet.add(userId)
        } else {
            newSet.delete(userId)
        }
        return { onlineUsers: newSet }
    }),

    setTypingStatus: (chatId, status) => set((state) => ({
        typingUsers: { ...state.typingUsers, [chatId]: status }
    })),
}))

export default useActivityStore