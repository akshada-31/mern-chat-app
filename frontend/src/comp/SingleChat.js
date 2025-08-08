import { ArrowBackIcon } from "@chakra-ui/icons";
import { ChatState } from "../Context/ChatProvider";
import {
    Box,
    FormControl,
    IconButton,
    Input,
    Spinner,
    Text,
    useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import './styles.css';
import ScrollableChat from "./UserAvatar/ScrollableChat";
import { io } from "socket.io-client";
import Lottie from "react-lottie-player";
import animationData from "../animations/typing.json";

const ENDPOINT = process.env.REACT_APP_API_URL;
let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const { user, selectedChat, setSelectedChat, notification, setNotification, onlineUserIds } = ChatState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const toast = useToast();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    useEffect(() => {
        socket = io(ENDPOINT, {
            transports: ["websocket"],
        });
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [ENDPOINT, user]);

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );
                socket.emit("new message", data);
                setMessages((prev) => [...prev, data]);
            } catch (error) {
                toast({
                    title: "Error Occurred!",
                    description: "Failed to send the message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };
    const handleEditSubmit = async () => {
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(`/api/message/${editingMessageId}`, { content: editContent }, config);

            setMessages((prev) =>
                prev.map((msg) => (msg._id === editingMessageId ? data : msg))
            );

            setEditingMessageId(null);
            setEditContent("");
        } catch (error) {
            toast({
                title: "Error Editing!",
                description: "Could not update message",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (messageId) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(`/api/message/${messageId}`, config);
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        } catch (error) {
            toast({
                title: "Error Deleting!",
                description: "Could not delete message",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
    };

    const startEdit = (message) => {
        setEditingMessageId(message._id);
        setEditContent(message.content);
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditContent("");
    };


    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true);
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to load the messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (
                !selectedChatCompare ||
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.some((n) => n._id === newMessageRecieved._id)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages((prev) => [...prev, newMessageRecieved]);
            }
        });

        socket.on("message edited", (updatedMessage) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            );
        });

        socket.on("message deleted", (deletedMessageId) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== deletedMessageId));
        });

        return () => {
            socket.off("message recieved");
            socket.off("message edited");
            socket.off("message deleted");
        };
    }, [notification, fetchAgain, selectedChatCompare]);


    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            let timeNow = new Date().getTime();
            let timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={selectedChat.isGroupChat ? "flex-start" : "space-between"}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {selectedChat?.users && (() => {
                                    const sender = getSenderFull(user, selectedChat.users);
                                    return (
                                        <ProfileModal
                                            user={sender}
                                            isOnline={onlineUserIds.has(sender._id)}
                                            lastSeen={sender.lastSeen}
                                        />
                                    );
                                })()}

                            </>
                        ) : (
                            <>
                                <Box flex="1" textAlign="left">
                                    {selectedChat.chatName.toUpperCase()}
                                </Box>
                                <Box>
                                    <UpdateGroupChatModal
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                        fetchMessages={fetchMessages}
                                    />
                                </Box>
                            </>
                        )}
                    </Text>

                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
                        ) : (
                            <div className="messages">
                                <ScrollableChat
                                    messages={messages}
                                    user={user}
                                    onEdit={startEdit}
                                    onDelete={handleDelete}
                                />

                            </div>
                        )}

                        <FormControl
                            onKeyDown={editingMessageId ? null : sendMessage}
                            isRequired
                            mt={3}
                        >
                            {isTyping && !editingMessageId && (
                                <Lottie
                                    loop
                                    play
                                    animationData={animationData}
                                    style={{ width: 70, marginBottom: 15, marginLeft: 0 }}
                                />
                            )}
                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder={
                                    editingMessageId ? "Edit message..." : "Enter a message..."
                                }
                                value={editingMessageId ? editContent : newMessage}
                                onChange={(e) =>
                                    editingMessageId
                                        ? setEditContent(e.target.value)
                                        : typingHandler(e)
                                }
                            />
                            {editingMessageId && (
                                <Box display="flex" mt={2} gap={2}>
                                    <button onClick={handleEditSubmit}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </Box>
                            )}
                        </FormControl>

                    </Box>
                </>
            ) : (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="100%"
                >
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Click on a user to start chatting
                    </Text>
                </Box>
            )}
        </>
    );
};

export default SingleChat;
