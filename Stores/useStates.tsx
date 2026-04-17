import { create } from "zustand";

type elementsStateType = {
    addConvOpen: boolean
    toggleAddConv: () => void
}

const useElementsState = create<elementsStateType>((set) => ({
    addConvOpen: false,

    toggleAddConv: () => set((prev: { addConvOpen: boolean }) => ({ addConvOpen: !prev.addConvOpen }))
}))

export default useElementsState