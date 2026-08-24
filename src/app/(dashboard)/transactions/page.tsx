'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
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
  Select,
  VStack,
  HStack,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { FiPlus, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { api } from '@/lib/api';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  accountId: string;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    description: '',
    category: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/finance/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      // Fallback mock data
      setTransactions([
        { id: '1', type: 'EXPENSE', amount: 45.9, description: 'Groceries', category: 'Food', accountId: 'acc1', date: new Date().toISOString() },
        { id: '2', type: 'INCOME', amount: 3000, description: 'Salary', category: 'Income', accountId: 'acc1', date: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSave = async () => {
    try {
      await api.post('/finance/transactions', {
        ...formData,
        amount: Number(formData.amount)
      });
      onClose();
      fetchTransactions();
    } catch (error) {
      console.error('Failed to save transaction', error);
      // Mock optimistic update
      setTransactions([{ 
        id: Math.random().toString(),
        type: formData.type as 'INCOME' | 'EXPENSE',
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category,
        accountId: formData.accountId,
        date: new Date(formData.date).toISOString()
      }, ...transactions]);
      onClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Group by date
  const groupedTransactions = transactions.reduce((acc, t) => {
    const d = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <Box position="relative" minH="100%">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Transactions</Heading>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="emerald" 
          onClick={onOpen}
          display={{ base: 'none', md: 'flex' }}
        >
          Add Transaction
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center" p={10}><Spinner color="emerald.500" /></Flex>
      ) : (
        <VStack spacing={6} align="stretch" pb={20}>
          {Object.entries(groupedTransactions).map(([date, items]) => (
            <Box key={date}>
              <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
                {date}
              </Text>
              <VStack spacing={3} align="stretch">
                {items.map(t => (
                  <Flex 
                    key={t.id} 
                    bg={bg} 
                    p={4} 
                    borderRadius="lg" 
                    borderWidth="1px" 
                    borderColor={borderColor}
                    align="center"
                    justify="space-between"
                  >
                    <Flex align="center">
                      <Flex 
                        bg={t.type === 'INCOME' ? 'emerald.100' : 'red.100'} 
                        p={2} 
                        borderRadius="full" 
                        mr={4}
                      >
                        <Icon 
                          as={t.type === 'INCOME' ? FiArrowUpRight : FiArrowDownRight} 
                          color={t.type === 'INCOME' ? 'emerald.500' : 'red.500'} 
                          boxSize={5} 
                        />
                      </Flex>
                      <Box>
                        <Text fontWeight="semibold">{t.description}</Text>
                        <Text fontSize="sm" color="gray.500">{t.category}</Text>
                      </Box>
                    </Flex>
                    <Text 
                      fontWeight="bold" 
                      color={t.type === 'INCOME' ? 'emerald.500' : 'red.500'}
                    >
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* FAB for Mobile */}
      <IconButton
        aria-label="Add Transaction"
        icon={<FiPlus />}
        colorScheme="emerald"
        size="lg"
        isRound
        position="fixed"
        bottom={8}
        right={8}
        shadow="lg"
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <Select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input 
                  type="number" 
                  step="0.01"
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </FormControl>
              <HStack w="100%" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Input 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Account ID</FormLabel>
                  <Input 
                    value={formData.accountId} 
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})} 
                  />
                </FormControl>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
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
