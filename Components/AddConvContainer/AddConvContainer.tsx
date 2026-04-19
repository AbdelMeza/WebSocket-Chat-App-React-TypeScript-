import { useEffect, useMemo, useState } from "react";
import './AddConvContainer.scss';
import { useSearchParams } from "react-router-dom";
import useSearch from "../../Stores/useSearch";
import Button from "../Button/Button";
import useElementsState from "../../Stores/useStates";
import useUserData from "../../Stores/userData";
import useChat from "../../Stores/useChat";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import DefaultProfile from "../DefaultProfilePicture/DefaultProfilePicture";

interface SearchUser {
    _id: string;
    username: string;
    fullname: string;
    avatarUrl?: string;
    avatar?: string;
    defaultProfileColor?: string;
}

export default function AddConvContainer() {
    const { addConvOpen, toggleAddConv } = useElementsState();
    const { user } = useUserData();
    const { createChat, setChatId } = useChat();
    const { search, searchResult, searchLoading } = useSearch();
    const [searchValue, setSearchValue] = useState<string>("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);

    const colors = [
        "196, 108, 255", "255, 108, 108", "108, 255, 157",
        "108, 196, 255", "255, 196, 108", "255, 108, 235",
        "108, 255, 255", "180, 255, 108", "255, 235, 108", "150, 150, 255"
    ];

    const randomColor = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex] || colors[0];
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);
        
        if (val === "") {
            searchParams.delete("search");
            setSearchParams(searchParams);
        } else {
            setSearchParams(prev => {
                prev.set("search", val);
                return prev;
            });
        }
    };

    useEffect(() => {
        if (!addConvOpen) {
            setSearchValue("");
            setSelectedUsers([]);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("search");
            setSearchParams(newParams);
        }
    }, [addConvOpen]);

    useEffect(() => {
        const searchBounce = setTimeout(() => {
            // Éviter de lancer une recherche vide
            if (searchValue.trim() !== "") {
                search({ searchValue, searchType: "user" });
            }
        }, 500);

        return () => clearTimeout(searchBounce);
    }, [searchValue, search]);

    const toggleUser = (userToToggle: SearchUser) => {
        if (selectedUsers.some(u => u._id === userToToggle._id)) {
            setSelectedUsers((prev) => prev.filter((u) => u._id !== userToToggle._id));
        } else {
            setSelectedUsers((prev) => [...prev, userToToggle]);
        }
    };

    const handleCreateConversation = async () => {
        if (!user?.id) return;

        const isGroup = selectedUsers.length > 1;
        // On extrait uniquement les IDs des utilisateurs sélectionnés
        const participantsIds = [...selectedUsers.map(u => u._id), user.id];
        
        const chatId = await createChat({ 
            participantsIds, 
            isGroup, 
            defaultColor: isGroup ? randomColor : null 
        });

        if (chatId) {
            setChatId(chatId);
            toggleAddConv();
        }
    };

    return (
        <div className={`add-conv-container ${addConvOpen ? "open" : ""}`}>
            <div className="content">
                <div className="upper-content">
                    <span className="upper-text">New conversation</span>
                    <div className="close-btn" onClick={() => toggleAddConv()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                <div className="middle-content">
                    <div className="search-input-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width={15} viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                        </svg>
                        <input type="text" placeholder="Search..." value={searchValue} onChange={handleSearch} />
                    </div>
                </div>

                {selectedUsers.length > 0 &&
                    <div className="selected-users-list">
                        {selectedUsers.map(u => (
                            <span key={u._id} className="selected-user" onClick={() => toggleUser(u)}>
                                {u.username}
                                <svg xmlns="http://www.w3.org/2000/svg" width={15} viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                            </span>
                        ))}
                    </div>
                }

                <div className="lower-content">
                    {searchLoading ? (
                        <LoadingSpinner />
                    ) : (searchResult && searchResult.length > 0) ? (
                        searchResult.map((u: SearchUser) => (
                            <div 
                                key={u._id} 
                                className={`search-result-item ${selectedUsers.some(sel => sel._id === u._id) ? "selected" : ""}`} 
                                onClick={() => toggleUser(u)}
                            >
                                {u.avatarUrl || u.avatar ? (
                                    <div className="avatar">
                                        <img src={u.avatar || u.avatarUrl} alt="User Avatar" />
                                    </div>
                                ) : (
                                    <DefaultProfile username={u.fullname} defaultColor={u.defaultProfileColor || randomColor} size={1} />
                                )}
                                <div className="identifiers">
                                    <div className="username">{u.username}</div>
                                    <div className="fullname">{u.fullname}</div>
                                </div>
                                <div className="selection-status">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={15} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                            </div>
                        ))
                    ) : (
                        <span className="empty-result">Search for someone to chat with</span>
                    )}
                </div>

                {selectedUsers.length > 0 && (
                    <div className="add-conv-btn">
                        <Button content="chat" type="main" isDisabled={false} size={1} onClick={handleCreateConversation} />
                    </div>
                )}
            </div>
        </div>
    );
}