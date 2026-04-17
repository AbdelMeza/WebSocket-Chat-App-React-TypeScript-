import './ConversationsOverview.scss';

export default function ConversationNeutralPage() {
    return <div className="conversations-neutral-page">
        <div className="content">
            <div className="icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" width={50} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
            </div>
            <span className="upper-text">No Conversation Selected</span>
            <span className="lower-text">Select a conversation from the left to start chatting</span>
        </div>
    </div>
}