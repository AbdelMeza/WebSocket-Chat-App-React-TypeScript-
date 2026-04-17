import './ConversationsOverview.scss'
import { Outlet, useNavigate } from "react-router-dom";
import AddConvContainer from "../../Components/AddConvContainer/AddConvContainer";
import ConversationsSidebar from "../../Components/ConversationsSidebar/ConversationsSidebar";
import useChat from '../../Stores/useChat';
import { useEffect } from 'react';

export default function conversationsOverview() {
    const { chatId } = useChat()
    const navigate = useNavigate()

    useEffect(() => {
        if(chatId) {
            navigate(`/inbox/${chatId}`)
        }
    }, [chatId])

    return <div className="conversations-container">
        <AddConvContainer />
        <div className="side-content left-content">
            <ConversationsSidebar />
        </div>
        <div className="side-content right-content">
            <Outlet />
        </div>
    </div>
}
