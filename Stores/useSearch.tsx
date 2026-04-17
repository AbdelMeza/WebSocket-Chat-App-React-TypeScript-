import { create } from "zustand";
const API_URL: string | undefined = import.meta.env.VITE_API_URL

type searchType = {
    searchResult: [] | null
    searchLoading: boolean
    search: (params: { searchValue: string, searchType: string }) => Promise<void>
}

const userToken = localStorage.getItem("userToken")

const useSearch = create<searchType>((set) => ({
    searchResult: null,
    searchLoading: false,

    search: async ({ searchValue, searchType }) => {
        try {
            if (searchValue === "") {
                set({ searchResult: [] })
                return
            }

            set({ searchLoading: true })
            const res = await fetch(`${API_URL}/search?search=${searchValue}&type=${searchType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userToken })
            })

            const data = await res.json()

            set({ searchLoading: false })
            set({ searchResult: data })
        } catch (error) {
            set({ searchLoading: false })
            console.log(error)
        }
    }
}))

export default useSearch