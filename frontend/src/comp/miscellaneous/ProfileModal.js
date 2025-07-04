import {
    ViewIcon,
} from "@chakra-ui/icons";
import {
    Button,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
    Box,
    Flex,
} from "@chakra-ui/react";
import React from "react";

const ProfileModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            {children ? (
                <Box as="span" onClick={onOpen}>
                    {children}
                </Box>
            ) : (
                <IconButton
                    display={{ base: "flex" }}
                    icon={<ViewIcon />}
                    onClick={onOpen}
                    aria-label="View Profile"
                />
            )}
            <Modal size="md" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="2xl"
                        fontFamily="Work sans"
                        textAlign="center"
                    >
                        {user.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex direction="column" align="center" justify="center">
                            <Image
                                borderRadius="full"
                                boxSize="100px"
                                src={user.pic}
                                alt={user.name}
                                mb={4}
                            />
                            <Text fontSize="md" fontFamily="Work sans">
                                Email: {user.email}
                            </Text>
                        </Flex>
                    </ModalBody>
                    <ModalFooter justifyContent="center">
                        <Button onClick={onClose} colorScheme="blue">
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ProfileModal;
