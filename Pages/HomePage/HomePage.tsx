import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import './HomePage.scss'
import useUserData from "../../Stores/userData";
import { useEffect } from "react";
import useChat from "../../Stores/useChat";

export default function HomePage() {
    const { getUserData } = useUserData()
    const { getChats } = useChat()

    useEffect(() => {
        const fetchData = async () => {
            await getUserData()
            await getChats()
        }

        fetchData()
    }, [getUserData, getChats])

    return <div className="home-page">
        <Sidebar />
        <div className="content">
            <Outlet />
        </div>
    </div>
}