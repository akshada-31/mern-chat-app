import { useState } from "react";
import ChatBox from "../comp/ChatBox";
import SideDrawer from "../comp/miscellaneous/SideDrawer";
import MyChats from "../comp/MyChats";
import { ChatState } from "../Context/ChatProvider";
import { Box } from "@chakra-ui/react";

const Chatpage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

    return <div style={{ width: "100%" }}>
        {user && <SideDrawer />}
        <Box display="flex" justifyContent='space-between' w='100%' h='91.5vh' p='10px'>
            {user && <MyChats fetchAgain={fetchAgain} />}
            {user && (<ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />)}
        </Box>

    </div>;
};

export default Chatpage;