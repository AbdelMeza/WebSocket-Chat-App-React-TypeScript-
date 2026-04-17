import { io } from "socket.io-client"
const API_URL: string | undefined = import.meta.env.VITE_API_URL

export const socket = io(`${API_URL}`)