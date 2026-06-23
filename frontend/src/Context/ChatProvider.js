import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const ChatContext = createContext();
let socket;

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("userInfo"));
    });
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [notification, setNotification] = useState([]);
    const [onlineUserIds, setOnlineUserIds] = useState(new Set());

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);

        if (!userInfo) {
            navigate("/");
        } else {
            socket = io("https://talk-a-tive-g20h.onrender.com", {
                transports: ["websocket", "polling"],
                withCredentials: true,
            }); // uses default from frontend proxy
            socket.emit("setup", userInfo);

            socket.on("onlineUsers", (userIds) => {
                setOnlineUserIds(new Set(userIds));
            });
        }

        return () => {
            if (socket) {
                socket.off("onlineUsers");
                socket.disconnect();
            }
        };
    }, [navigate]);

    return (
        <ChatContext.Provider
            value={{
                user,
                setUser,
                selectedChat,
                setSelectedChat,
                chats,
                setChats,
                notification,
                setNotification,
                onlineUserIds,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => useContext(ChatContext);
export default ChatProvider;
