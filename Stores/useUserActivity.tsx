import { create } from 'zustand'

interface ActivityState {
    onlineUsers: Set<string>
    typingUsers: { [chatId: string]: boolean }
    lastSeenDates: { [userId: string]: string | Date }
    setOnlineUsers: (users: string[]) => void
    updateUserStatus: (userId: string, status: 'online' | 'offline', lastSeen: Date) => void
    setTypingStatus: (chatId: string, status: boolean) => void
}

const useActivityStore = create<ActivityState>((set) => ({
    onlineUsers: new Set(),
    typingUsers: {},
    lastSeenDates: {},

    setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),

    updateUserStatus: (userId, status, lastSeen) => set((state) => {
        const newSet = new Set(state.onlineUsers)
        const newDates = { ...state.lastSeenDates };

        if (status === 'online') {
            newSet.add(userId)
        } else {
            newSet.delete(userId)

            if (lastSeen) {
                newDates[userId] = lastSeen;
            }
        }
        return { onlineUsers: newSet, lastSeenDates: newDates }
    }),

    setTypingStatus: (chatId, status) => set((state) => ({
        typingUsers: { ...state.typingUsers, [chatId]: status }
    })),
}))

export default useActivityStore