import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserData from "../Stores/userData";
import LoadingSpinner from "../Components/LoadingSpinner/LoadingSpinner";

export default function AuthProtection({ children }: any) {
    const { user, getUserData } = useUserData();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                if (!user?.id) {
                    await getUserData();
                }
            } catch (error) {
                console.error("Erreur auth:", error);
            } finally {
                setIsLoading(false);
            }
        };

        verifyUser();
    }, [])

    useEffect(() => {
        if (!isLoading && !user?.id) {
            navigate("/login", { replace: true });
        }
    }, [isLoading, user, navigate]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return user?.id ? <>{children}</> : null;
}