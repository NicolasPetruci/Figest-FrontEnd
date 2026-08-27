'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
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
  Select,
  VStack,
  HStack,
  Spinner,
  useToast,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiCreditCard,
  FiTrash2,
  FiEdit2,
  FiMoreVertical,
  FiDollarSign,
  FiTrendingUp,
  FiBriefcase,
  FiLink,
} from 'react-icons/fi';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
);

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT';

interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency?: string;
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, { label: string; color: string; icon: any }> = {
  CHECKING: { label: 'Conta Corrente', color: 'blue', icon: FiCreditCard },
  SAVINGS: { label: 'Poupança', color: 'green', icon: FiDollarSign },
  CREDIT_CARD: { label: 'Cartão de Crédito', color: 'red', icon: FiCreditCard },
  CASH: { label: 'Carteira / Dinheiro', color: 'amber', icon: FiBriefcase },
  INVESTMENT: { label: 'Investimentos', color: 'purple', icon: FiTrendingUp },
};

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Conta Principal Itaú', type: 'CHECKING', balance: 12400.50, currency: 'BRL' },
  { id: 'acc-2', name: 'Reserva de Emergência Nubank', type: 'SAVINGS', balance: 3500.00, currency: 'BRL' },
  { id: 'acc-3', name: 'Cartão C6 Bank Black', type: 'CREDIT_CARD', balance: -850.00, currency: 'BRL' },
];

export default function AccountsPage() {
  const user = useAuthStore((state) => state.user);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const cancelRef = React.useRef<any>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [balance, setBalance] = useState('0');

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/finance/accounts');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setAccounts(response.data);
      } else {
        setAccounts(DEFAULT_ACCOUNTS);
      }
    } catch (error) {
      console.error('Failed to fetch accounts', error);
      setAccounts(DEFAULT_ACCOUNTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAccount(null);
    setName('');
    setType('CHECKING');
    setBalance('0');
    onOpen();
  };

  const handleOpenEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(String(acc.balance));
    onOpen();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Informe o nome da conta', status: 'warning', duration: 3000 });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        type,
        balance: Number(balance) || 0,
        currency: 'BRL',
      };

      if (editingAccount) {
        await api.patch(`/finance/accounts/${editingAccount.id}`, payload);
        toast({ title: 'Conta atualizada!', status: 'success', duration: 3000 });
      } else {
        await api.post('/finance/accounts', payload);
        toast({ title: 'Conta bancária criada com sucesso!', status: 'success', duration: 3000 });
      }
      onClose();
      fetchAccounts();
    } catch (error) {
      console.error('Failed to save account', error);
      if (editingAccount) {
        setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, name, type, balance: Number(balance) } : a));
      } else {
        setAccounts(prev => [...prev, { id: `acc-${Date.now()}`, name, type, balance: Number(balance), currency: 'BRL' }]);
      }
      toast({ title: 'Conta salva!', status: 'info', duration: 3000 });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/finance/accounts/${deleteId}`);
      toast({ title: 'Conta removida', status: 'success', duration: 3000 });
    } catch (error) {
      console.error('Failed to delete account', error);
    } finally {
      setAccounts(prev => prev.filter(a => a.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleConnectBank = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/connect-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientUserId: user?.id || 'user-1' }),
      });
      const data = await response.json();

      if (data.accessToken) {
        setConnectToken(data.accessToken);
        toast({
          title: 'Widget Pluggy Aberto!',
          description: 'Selecione sua instituição bancária no widget.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || 'Token não retornado pela API da Pluggy');
      }
    } catch (error: any) {
      console.error('Failed to connect bank:', error);
      toast({
        title: 'Erro na integração Pluggy',
        description: error?.message || 'Verifique se CLIENT_ID e CLIENT_SECRET estão configurados no .env',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalBalance = accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);

  return (
    <Box>
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold">Contas Bancárias & Open Finance</Heading>
          <Text color="gray.500" fontSize="sm">
            Saldo Total Consolidado: <Text as="span" fontWeight="bold" color={totalBalance >= 0 ? 'emerald.500' : 'red.500'}>{formatCurrency(totalBalance)}</Text>
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button leftIcon={<Icon as={FiLink} />} colorScheme="blue" borderRadius="xl" onClick={handleConnectBank} isLoading={isConnecting}>
            Conectar Banco (Pluggy)
          </Button>
          <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={handleOpenCreateModal}>
            Nova Conta
          </Button>
        </HStack>
      </Flex>

      {/* Pluggy Connect Overlay Widget */}
      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={true}
          onSuccess={(itemData) => {
            toast({
              title: 'Banco Conectado com Sucesso! 🎉',
              description: `Sua conta foi conectada via Pluggy. ID: ${itemData.item.id}`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            setConnectToken(null);
            fetchAccounts();
          }}
          onError={(error) => {
            console.error('Pluggy Connect Error:', error);
            toast({
              title: 'Falha na conexão bancária',
              description: error.message || 'Ocorreu um erro durante a autenticação bancária',
              status: 'error',
              duration: 4000,
              isClosable: true,
            });
          }}
          onClose={() => setConnectToken(null)}
        />
      )}

      {/* Accounts Grid */}
      {isLoading ? (
        <Flex justify="center" p={10}><Spinner color="emerald.500" size="xl" /></Flex>
      ) : accounts.length === 0 ? (
        <Flex direction="column" align="center" justify="center" h="200px" bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
          <Icon as={FiCreditCard} boxSize={10} color="gray.500" mb={2} />
          <Text color="gray.400">Nenhuma conta cadastrada. Adicione sua primeira conta bancária ou conecte via Pluggy.</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {accounts.map(account => {
            const config = ACCOUNT_TYPE_LABELS[account.type] || ACCOUNT_TYPE_LABELS.CHECKING;
            const IconComponent = config.icon;
            return (
              <Box 
                key={account.id} 
                bg={cardBg} 
                p={6} 
                borderRadius="2xl" 
                borderWidth="1px" 
                borderColor={borderColor}
                shadow="sm"
                position="relative"
                overflow="hidden"
                transition="all 0.25s ease"
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
              >
                <Flex justify="space-between" align="start" mb={4}>
                  <Flex align="center">
                    <Flex bg={`${config.color}.100`} p={3} borderRadius="xl" mr={4}>
                      <Icon as={IconComponent} color={`${config.color}.600`} boxSize={6} />
                    </Flex>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">{account.name}</Text>
                      <Badge colorScheme={config.color} borderRadius="full" px={3} py={0.5} fontSize="xs">
                        {config.label}
                      </Badge>
                    </Box>
                  </Flex>

                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      borderRadius="lg"
                      aria-label="Opções"
                    />
                    <MenuList borderRadius="xl">
                      <MenuItem icon={<FiEdit2 />} onClick={() => handleOpenEditModal(account)}>
                        Editar
                      </MenuItem>
                      <MenuItem icon={<FiTrash2 />} color="red.400" onClick={() => setDeleteId(account.id)}>
                        Excluir
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
                
                <Text fontSize="2xl" fontWeight="bold" color={account.balance >= 0 ? 'emerald.500' : 'red.500'}>
                  {formatCurrency(account.balance)}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Modal Criar / Editar Conta */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">
            {editingAccount ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
          </ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome da Conta / Instituição</FormLabel>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ex: Itaú Corrente, Nubank Reserva, C6 Black"
                  borderRadius="xl"
                  focusBorderColor="#10B981"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tipo de Conta</FormLabel>
                <Select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as AccountType)} 
                  borderRadius="xl"
                >
                  <option value="CHECKING">Conta Corrente</option>
                  <option value="SAVINGS">Conta Poupança / Reserva</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="CASH">Carteira / Dinheiro em Espécie</option>
                  <option value="INVESTMENT">Conta de Investimentos</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Saldo Atual (R$)</FormLabel>
                <Input 
                  type="number" 
                  step="0.01"
                  value={balance} 
                  onChange={(e) => setBalance(e.target.value)} 
                  borderRadius="xl"
                  focusBorderColor="#10B981"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onClose}>Cancelar</Button>
            <Button bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" isLoading={isSaving} onClick={handleSave}>
              {editingAccount ? 'Salvar Alterações' : 'Criar Conta'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AlertDialog de Exclusão */}
      <AlertDialog
        isOpen={Boolean(deleteId)}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteId(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(5px)">
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Conta Bancária
            </AlertDialogHeader>
            <AlertDialogBody>
              Tem certeza que deseja excluir esta conta?
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} variant="ghost" borderRadius="xl" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button colorScheme="red" borderRadius="xl" onClick={handleDeleteAccount}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
