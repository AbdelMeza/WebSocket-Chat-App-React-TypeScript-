import { create } from "zustand"
import useAuth from "./useAuth"

const API_URL: string | undefined = import.meta.env.VITE_API_URL

/**
 * Interface representing the basic user information 
 * retrieved from the backend.
 */

type userType = {
    username: string
    fullname: string
    defaultProfileColor: string
    avatarUrl?: string
    id: string
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
                    fullname: authState.user.fullname,
                    defaultProfileColor: authState.user.defaultProfileColor,
                    id: authState.user.id,
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
                user: {
                    username: data.user.username,
                    fullname: data.user.fullname,
                    defaultProfileColor: data.user.defaultProfileColor,
                    avatarUrl: data.user.avatar_url,
                    id: data.user.id,
                },
                isAuth: true
            })
        } catch (err) {
            console.error("Fetch error in getUserData:", err)
            set({ user: null, isAuth: false })
        }
    }
}))

export default useUserData