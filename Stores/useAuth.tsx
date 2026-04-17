import { create } from "zustand"
import type { chat } from "./userData"
const API_URL: string | undefined = import.meta.env.VITE_API_URL

type userType = {
    username: string
    id: string
    chats: chat[]
}

type errorType = {
    field: string
    message: string
}

type authType = {
    user: null | userType
    errors: null | errorType[]
    authLoading: boolean
    clearErrors: () => void
    login: (values: { identifier: string, password: string }) => Promise<boolean>
    signup: (values: { username: string, fullname: string, email: string, password: string }) => Promise<boolean>
}

const useAuth = create<authType>((set) => ({
    user: null,
    errors: null,
    authLoading: false,

    clearErrors: () => set({ errors: null }),

    login: async (values) => {
        try {
            set({ authLoading: true })
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })

            const data = await res.json()

            if (!res.ok) {
                set({ user: null, errors: data.errors })
                set({ authLoading: false })
                return false
            }

            console.log(data.token)

            localStorage.setItem("userToken", data.token)
            set({ user: { username: data.user.username, id: data.user._id, chats: data.user.chats } })
            set({ authLoading: false })
            return true
        } catch (err) {
            console.log(err)
            set({ authLoading: false })
            return false
        }
    },

    signup: async (values) => {
        try {
            set({ authLoading: true })
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })

            const data = await res.json()

            if (!res.ok) {
                set({ user: null, errors: data.errors })
                set({ authLoading: false })
                return false
            }

            localStorage.setItem("userToken", data.token)
            set({ user: { username: data.user.username, id: data.user.id, chats: data.user.chats } })
            set({ authLoading: false })
            return true
        } catch (err) {
            console.log(err)
            set({ authLoading: false })
            return false
        }
    }
}))

export default useAuth