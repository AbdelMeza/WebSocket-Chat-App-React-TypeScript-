import { useEffect, useState } from "react";
import './AddConvContainer.scss'
import { useSearchParams } from "react-router-dom";
import useSearch from "../../Stores/useSearch";
import Button from "../Button/Button";
import useElementsState from "../../Stores/useStates";
import useUserData from "../../Stores/userData";
import useChat from "../../Stores/useChat";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

export default function AddConvContainer() {
    const { addConvOpen, toggleAddConv } = useElementsState()
    const { user } = useUserData()
    const { createChat, setChatId } = useChat()
    const { search, searchResult, searchLoading } = useSearch()
    const [searchValue, setSearchValue] = useState<string>("")
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "") {
            setSearchValue("")
            searchParams.delete("search")
            setSearchParams(searchParams)
            return
        }

        setSearchValue(e.target.value)
        setSearchParams(prev => {
            prev.set("search", e.target.value)
            return prev
        })
    }

    useEffect(() => {
        if (!addConvOpen) {
            setSearchValue("")
            setSelectedUsers([])
            searchParams.delete("search")
            setSearchParams(searchParams)
        }
    }, [addConvOpen])

    useEffect(() => {
        const searchBounce = setTimeout(() => {
            search({ searchValue, searchType: "user" })
            setSelectedUsers([])
        }, 500)

        return () => {
            clearTimeout(searchBounce)
        }
    }, [searchValue])

    const addUser = (id: string) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers((prev) => prev.filter((userId) => userId !== id))
            return
        }

        setSelectedUsers((prev) => [...prev, id])
    }

    const handleCreateConversation = async () => {
        const participantId = selectedUsers[0]
        const chatId = await createChat({ participantId, currentUserId: user?.id || "" })

        if (chatId) {
            setChatId(chatId)
            toggleAddConv()
        }
    }

    return <div className={`add-conv-container ${addConvOpen ? "open" : ""}`}>
        <div className="content">
            <div className="upper-content">
                <span className="upper-text">New conversation</span>
                <div className="close-btn" onClick={() => toggleAddConv()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={20} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>
            <div className="middle-content">
                <div className="search-input-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width={15} viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                    </svg>
                    <input type="text" placeholder="Search..." value={searchValue} onChange={(e) => handleSearch(e)} />
                </div>
            </div>
            <div className="lower-content">
                {searchLoading ? <LoadingSpinner /> : searchResult && searchResult.length > 0 ?
                    searchResult?.map((user: any) => (
                        <div key={user._id} className={`search-result-item ${selectedUsers.includes(user._id) ? "selected" : ""}`} onClick={() => addUser(user._id)}>
                            <div className="avatar">
                                <img src={user.avatar || "https://scontent.falg6-2.fna.fbcdn.net/v/t1.30497-1/84628273_176159830277856_972693363922829312_n.jpg?stp=c379.0.1290.1290a_dst-jpg_s200x200_tt6&_nc_cat=1&ccb=1-7&_nc_sid=7565cd&_nc_ohc=NyOlW9FwyRUQ7kNvwH27lEK&_nc_oc=AdoQSqrWqErCQOp_GpEGZHKftaif_R_rDOPQcvvr9BEGyFNMTOqezFIhAvIYWcPcz2E&_nc_zt=24&_nc_ht=scontent.falg6-2.fna&_nc_ss=7a30f&oh=00_AfxgC7Qg0Y0y79PVeX_3bU-r7FtSHDUS-i5unRsCKqrdog&oe=69F042D9"} alt="User Avatar" />
                            </div>
                            <div className="identifiers">
                                <div className="username">{user.username}</div>
                                <div className="fullname">{user.fullname}</div>
                            </div>
                            <div className="selection-status">
                                <svg xmlns="http://www.w3.org/2000/svg" width={15} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                        </div>
                    )) : <span className="empty-result">Search for someone to chat with</span>}
            </div>
            {selectedUsers.length > 0 && <div className="add-conv-btn">
                <Button content="chat" type={"main"} isDisabled={false} size={1} onClick={handleCreateConversation} />
            </div>}
        </div>
    </div>
}