'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  Heading,
  Flex,
  useColorModeValue,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiCreditCard } from 'react-icons/fi';
import { api } from '@/lib/api';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bank Account',
    initialBalance: '0',
  });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/finance/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts', error);
      // Fallback mock data
      setAccounts([
        { id: 'acc1', name: 'Main Checking', type: 'Bank Account', balance: 12400.50 },
        { id: 'acc2', name: 'Savings', type: 'Savings', balance: 3000.00 },
        { id: 'acc3', name: 'Credit Card', type: 'Credit', balance: -540.00 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSave = async () => {
    try {
      await api.post('/finance/accounts', {
        name: formData.name,
        type: formData.type,
        balance: Number(formData.initialBalance),
      });
      onClose();
      fetchAccounts();
    } catch (error) {
      console.error('Failed to save account', error);
      // Mock optimistic update
      setAccounts([...accounts, { 
        id: Math.random().toString(),
        name: formData.name,
        type: formData.type,
        balance: Number(formData.initialBalance),
      }]);
      onClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const handleConnectBank = async () => {
    setIsConnecting(true);
    try {
      await api.get('/integrations/pluggy/token');
      // Just simulating successful response for MVP
      toast({
        title: 'Bank Connected Successfully (Mock)',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to connect bank', error);
      toast({
        title: 'Failed to connect bank',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Accounts</Heading>
        <Flex gap={3}>
          <Button leftIcon={<Icon as={FiCreditCard} />} colorScheme="blue" onClick={handleConnectBank} isLoading={isConnecting}>
            Connect Bank Account
          </Button>
          <Button leftIcon={<FiPlus />} colorScheme="emerald" onClick={onOpen}>
            Add Account
          </Button>
        </Flex>
      </Flex>

      {isLoading ? (
        <Flex justify="center" p={10}><Spinner color="emerald.500" /></Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {accounts.map(account => (
            <Box 
              key={account.id} 
              bg={bg} 
              p={6} 
              borderRadius="xl" 
              borderWidth="1px" 
              borderColor={borderColor}
              shadow="sm"
              position="relative"
              overflow="hidden"
            >
              <Flex align="center" mb={4}>
                <Flex bg="emerald.100" p={3} borderRadius="lg" mr={4}>
                  <Icon as={FiCreditCard} color="emerald.600" boxSize={6} />
                </Flex>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{account.name}</Text>
                  <Text fontSize="sm" color="gray.500">{account.type}</Text>
                </Box>
              </Flex>
              
              <Text fontSize="2xl" fontWeight="bold" color={account.balance >= 0 ? 'emerald.500' : 'red.500'}>
                {formatCurrency(account.balance)}
              </Text>

              <Box 
                position="absolute" 
                top={0} 
                right={0} 
                w="100px" 
                h="100px" 
                bg="emerald.50" 
                borderRadius="full" 
                transform="translate(40%, -40%)" 
                opacity={0.5} 
                zIndex={0}
              />
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Account Name</FormLabel>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Chase Checking"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Account Type</FormLabel>
                <Input 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})} 
                  placeholder="e.g. Bank Account"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Initial Balance</FormLabel>
                <Input 
                  type="number" 
                  step="0.01"
                  value={formData.initialBalance} 
                  onChange={(e) => setFormData({...formData, initialBalance: e.target.value})} 
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="emerald" onClick={handleSave}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
