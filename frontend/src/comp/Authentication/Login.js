import React, { useState } from "react";
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Login = () => {
    const [show, setShow] = useState(false)

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState();
    const navigate = useNavigate();
    const toast = useToast();

    const handleClick = () => setShow(!show);

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };
            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
            );


            toast({
                title: "Registration Successfull",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            navigate("/chats");
        } catch (error) {
            console.error("Login error:", error); // ✅ optional, for debugging

            toast({
                title: "Error occurred!",
                description:
                    error?.response?.data?.message || error.message || "Something went wrong.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            setLoading(false);
        }

    };
    return (
        <VStack spacing='5px' color="black">

            <FormControl id="email" isRequired>
                <FormLabel>Email
                </FormLabel>
                <Input value={email} placeholder='Enter Your Email' onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id="password" isRequired>
                <FormLabel>Password
                </FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder='Enter Your Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>

            </FormControl>


            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Login

            </Button>
            <Button
                variant="solid"
                colorScheme="red"
                width="100%"
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("123456");
                }}
            >
                Get Guest User Credentials
            </Button>

        </VStack>
    )
}

export default Login;