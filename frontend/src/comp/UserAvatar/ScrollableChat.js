import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";
import { Avatar, Tooltip } from "@chakra-ui/react";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";


const ScrollableChat = ({ messages, user, onEdit, onDelete }) => {
    return <ScrollableFeed>
        {messages && messages.map((m, i) => (
            <div style={{ display: "flex" }} key={m._id}>
                {(isSameSender(messages, m, i, user._id)
                    || isLastMessage(messages, i, user._id)
                ) && <Tooltip
                    label={m.sender.name}
                    placement="bottom-start"
                    hasArrow>
                        <Avatar
                            mt="7px"
                            mr={1}
                            size="sm"
                            cursor="pointer"
                            name={m.sender.name}
                            src={m.sender.pic}
                        />
                    </Tooltip>
                }
                <span
                    style={{
                        backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}`,
                        marginLeft: isSameSenderMargin(messages, m, i, user._id),
                        marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                        borderRadius: "20px",
                        padding: "5px 15px",
                        maxWidth: "75%",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <span style={{ flex: 1 }}>{m.content}</span>
                    {m.sender._id === user._id && (
                        <span style={{ marginLeft: 10, display: "flex", gap: "4px" }}>
                            <IconButton
                                size="xs"
                                icon={<EditIcon />}
                                onClick={() => onEdit(m)}
                                variant="ghost"
                                aria-label="Edit"
                            />
                            <IconButton
                                size="xs"
                                icon={<DeleteIcon />}
                                onClick={() => onDelete(m._id)}
                                variant="ghost"
                                aria-label="Delete"
                            />
                        </span>
                    )}
                </span>


            </div>
        ))}
    </ScrollableFeed>
};

export default ScrollableChat;