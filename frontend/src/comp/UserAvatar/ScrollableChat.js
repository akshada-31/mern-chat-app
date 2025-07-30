import {
    isLastMessage,
    isSameSender,
    isSameSenderMargin,
    isSameUser,
} from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";
import {
    Avatar,
    Tooltip,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from "@chakra-ui/react";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";

const ScrollableChat = ({ messages, user, onEdit, onDelete }) => {
    const { user: loggedInUser } = ChatState();

    return (
        <ScrollableFeed>
            {messages &&
                messages.map((m, i) => (
                    <div style={{ display: "flex" }} key={m._id}>
                        {(isSameSender(messages, m, i, loggedInUser._id) ||
                            isLastMessage(messages, i, loggedInUser._id)) && (
                                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                                    <Avatar
                                        mt="7px"
                                        mr={1}
                                        size="sm"
                                        cursor="pointer"
                                        name={m.sender.name}
                                        src={m.sender.pic}
                                    />
                                </Tooltip>
                            )}
                        <span
                            style={{
                                backgroundColor: m.sender._id === loggedInUser._id ? "#BEE3F8" : "#B9F5D0",
                                marginLeft: isSameSenderMargin(messages, m, i, loggedInUser._id),
                                marginTop: isSameUser(messages, m, i, loggedInUser._id) ? 3 : 10,
                                borderRadius: "20px",
                                padding: "5px 15px",
                                maxWidth: "75%",
                                position: "relative",
                                display: "flex",
                                flexWrap: "wrap",                    // ✅ allow wrapping
                                overflowWrap: "anywhere",            // ✅ break long words
                                wordBreak: "break-word",             // ✅ force wrap when needed
                            }}
                        >

                            <span style={{ flex: 1 }}>
                                {m.content}
                                {m.edited && (
                                    <span style={{ fontSize: "0.75rem", marginLeft: 6, color: "#555" }}>
                                        (edited)
                                    </span>
                                )}
                            </span>

                            {m.sender._id === loggedInUser._id && (
                                <Menu>
                                    <MenuButton
                                        as={IconButton}
                                        size="xs"
                                        icon={<BsThreeDotsVertical />}
                                        variant="ghost"
                                        aria-label="Options"
                                        ml={2}
                                    />
                                    <MenuList>
                                        <MenuItem icon={<EditIcon />} onClick={() => onEdit(m)}>
                                            Edit
                                        </MenuItem>
                                        <MenuItem icon={<DeleteIcon />} onClick={() => onDelete(m._id)}>
                                            Delete
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            )}
                        </span>
                    </div>
                ))}
        </ScrollableFeed>
    );
};

export default ScrollableChat;
