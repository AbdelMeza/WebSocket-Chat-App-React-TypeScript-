import { create } from "zustand"
import useAuth from "./useAuth"

const API_URL: string | undefined = import.meta.env.VITE_API_URL

/**
 * Interface representing the basic user information 
 * retrieved from the backend.
 */

export type participant = {
    _id: string
    username: string
    fullname?: string
    avatar?: string
}

export type chat = {
    _id: string
    participants: participant[]
    isGroup: boolean
}

type userType = {
    username: string
    id: string
    chats: chat[]
}

/**
 * State definition for the UserData store.
 */
type UserDataState = {
    user: null | userType
    isAuth: boolean
    getUserData: () => Promise<void>
}

/**
 * Store dedicated to fetching and managing the current user's profile data.
 */
const useUserData = create<UserDataState>((set) => ({
    user: null,
    isAuth: false,

    getUserData: async () => {
        /**
         * IMPORTANT: We use .getState() instead of the useAuth() hook.
         * Calling a hook inside an async function or another store action 
         * violates React's rules and causes an "Invalid hook call" error.
         */
        const authState = useAuth.getState()

        // Prevent redundant API calls if the user is already defined in the auth store
        if (authState.user) {
            set({
                user: {
                    username: authState.user.username,
                    id: authState.user.id,
                    chats: authState.user.chats
                },
                isAuth: true
            })
            return
        }

        // Retrieve the token from localStorage for authentication
        const userToken: string | null = localStorage.getItem("userToken")

        // If no token is found, we cannot fetch data, so we stop here
        if (!userToken) return

        try {
            const res = await fetch(`${API_URL}/user/get_data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userToken })
            })

            const data = await res.json()

            if (!res.ok) {
                set({ user: null, isAuth: false })
                return
            }

            set({
                user: { username: data.user.username, id: data.user.id, chats: data.user.chats },
                isAuth: true
            })
        } catch (err) {
            console.error("Fetch error in getUserData:", err)
            set({ user: null, isAuth: false })
        }
    }
}))

export default useUserData