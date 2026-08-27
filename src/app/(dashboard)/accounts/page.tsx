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
  FiBriefcase as FiBank,
} from 'react-icons/fi';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
);

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT';

export interface Account {
  id: string;
  name: string;
  bankName: string;
  agency?: string;
  accountNumber?: string;
  type: AccountType;
  balance: number;
  currency?: string;
  color?: string;
}

const PRESET_BANKS = [
  { name: 'Banco Nubank', color: '#8A05BE' },
  { name: 'Banco Santander', color: '#EC0000' },
  { name: 'PicPay', color: '#21C25E' },
  { name: 'Itaú Unibanco', color: '#EC7000' },
  { name: 'Banco do Brasil', color: '#FFCC00' },
  { name: 'Banco Bradesco', color: '#CC092F' },
  { name: 'Banco Inter', color: '#FF7A00' },
  { name: 'C6 Bank', color: '#1B1B1B' },
  { name: 'Caixa Econômica', color: '#005CA9' },
  { name: 'Outro Banco / Carteira', color: '#10B981' },
];

const ACCOUNT_TYPE_LABELS: Record<AccountType, { label: string; icon: any }> = {
  CHECKING: { label: 'Conta Corrente', icon: FiCreditCard },
  SAVINGS: { label: 'Poupança / Reserva', icon: FiDollarSign },
  CREDIT_CARD: { label: 'Cartão de Crédito', icon: FiCreditCard },
  CASH: { label: 'Carteira / Espécie', icon: FiBriefcase },
  INVESTMENT: { label: 'Investimentos', icon: FiTrendingUp },
};

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

  // Form Fields
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('Banco Nubank');
  const [agency, setAgency] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState('#8A05BE');

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/finance/accounts');
      if (Array.isArray(response.data)) {
        setAccounts(response.data);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to fetch accounts from backend', error);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleBankSelect = (selectedName: string) => {
    setBankName(selectedName);
    const found = PRESET_BANKS.find(b => b.name === selectedName);
    if (found) setColor(found.color);
  };

  const handleOpenCreateModal = () => {
    setEditingAccount(null);
    setName('');
    setBankName('Banco Nubank');
    setAgency('');
    setAccountNumber('');
    setType('CHECKING');
    setBalance('0');
    setColor('#8A05BE');
    onOpen();
  };

  const handleOpenEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setBankName(acc.bankName || 'Banco Nubank');
    setAgency(acc.agency || '');
    setAccountNumber(acc.accountNumber || '');
    setType(acc.type);
    setBalance(String(acc.balance));
    setColor(acc.color || '#10B981');
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
        bankName,
        agency,
        accountNumber,
        type,
        balance: Number(balance) || 0,
        currency: 'BRL',
        color,
      };

      if (editingAccount) {
        await api.patch(`/finance/accounts/${editingAccount.id}`, payload);
        toast({ title: 'Conta bancária atualizada!', status: 'success', duration: 3000 });
      } else {
        await api.post('/finance/accounts', payload);
        toast({ title: 'Conta bancária cadastrada com sucesso!', status: 'success', duration: 3000 });
      }
      onClose();
      fetchAccounts();
    } catch (error: any) {
      console.error('Failed to save account', error);
      toast({ title: 'Erro ao salvar conta bancária', status: 'error', duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/finance/accounts/${deleteId}`);
      toast({ title: 'Conta removida com sucesso', status: 'success', duration: 3000 });
      fetchAccounts();
    } catch (error) {
      console.error('Failed to delete account', error);
    } finally {
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
          <Heading size="lg" fontWeight="bold">Cadastro de Bancos & Contas</Heading>
          <Text color="gray.500" fontSize="sm">
            Gerencie suas contas manuais (Nubank, Santander, PicPay, etc.) e integrações Open Finance
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button leftIcon={<Icon as={FiLink} />} colorScheme="blue" borderRadius="xl" onClick={handleConnectBank} isLoading={isConnecting}>
            Conectar Open Finance (Pluggy)
          </Button>
          <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={handleOpenCreateModal}>
            Cadastrar Conta Bancária
          </Button>
        </HStack>
      </Flex>

      {/* Saldo Consolidado Card */}
      <Box bg={cardBg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} mb={6} shadow="sm">
        <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={1}>Saldo Total Consolidado em Bancos</Text>
        <Text fontSize="3xl" fontWeight="bold" color={totalBalance >= 0 ? 'emerald.500' : 'red.500'}>
          {formatCurrency(totalBalance)}
        </Text>
      </Box>

      {/* Pluggy Connect Overlay Widget */}
      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={true}
          onSuccess={(itemData) => {
            toast({
              title: 'Banco Conectado com Sucesso! 🎉',
              description: `Conexão via Pluggy efetuada. ID: ${itemData.item.id}`,
              status: 'success',
              duration: 5000,
            });
            setConnectToken(null);
            fetchAccounts();
          }}
          onError={(error) => {
            console.error('Pluggy Connect Error:', error);
            toast({
              title: 'Falha na conexão bancária',
              description: error.message || 'Erro durante a autorização bancária',
              status: 'error',
              duration: 4000,
            });
          }}
          onClose={() => setConnectToken(null)}
        />
      )}

      {/* Accounts Grid */}
      {isLoading ? (
        <Flex justify="center" p={10}><Spinner color="emerald.500" size="xl" /></Flex>
      ) : accounts.length === 0 ? (
        <Flex direction="column" align="center" justify="center" h="240px" bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} p={6}>
          <Icon as={FiCreditCard} boxSize={12} color="gray.400" mb={3} />
          <Text fontWeight="bold" fontSize="lg">Nenhuma conta bancária cadastrada</Text>
          <Text color="gray.500" fontSize="sm" mb={4} textAlign="center">
            Cadastre suas contas manuais (Nubank, Santander, PicPay) com agência e conta para organizar suas transações.
          </Text>
          <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={handleOpenCreateModal}>
            Cadastrar Primeira Conta
          </Button>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {accounts.map(account => {
            const typeConfig = ACCOUNT_TYPE_LABELS[account.type] || ACCOUNT_TYPE_LABELS.CHECKING;
            const IconComponent = typeConfig.icon;
            const bankBgColor = account.color || '#10B981';

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
                <Box position="absolute" top={0} left={0} right={0} h="6px" bg={bankBgColor} />
                
                <Flex justify="space-between" align="start" mb={4} mt={1}>
                  <Flex align="center">
                    <Flex bg={`${bankBgColor}20`} p={3} borderRadius="xl" mr={3}>
                      <Icon as={IconComponent} style={{ color: bankBgColor }} boxSize={6} />
                    </Flex>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">{account.name}</Text>
                      <Badge bg={`${bankBgColor}15`} style={{ color: bankBgColor }} borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="bold">
                        {account.bankName || 'Banco'}
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
                        Editar Conta
                      </MenuItem>
                      <MenuItem icon={<FiTrash2 />} color="red.400" onClick={() => setDeleteId(account.id)}>
                        Excluir Conta
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>

                {(account.agency || account.accountNumber) && (
                  <HStack spacing={4} fontSize="xs" color="gray.500" mb={4} bg={useColorModeValue('gray.50', 'gray.900')} p={2.5} borderRadius="lg">
                    {account.agency && <Text><Text as="span" fontWeight="bold">Agência:</Text> {account.agency}</Text>}
                    {account.accountNumber && <Text><Text as="span" fontWeight="bold">Conta:</Text> {account.accountNumber}</Text>}
                  </HStack>
                )}
                
                <Text fontSize="2xl" fontWeight="bold" color={account.balance >= 0 ? 'emerald.500' : 'red.500'}>
                  {formatCurrency(Number(account.balance) || 0)}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Tipo: {typeConfig.label}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Modal Criar / Editar Conta */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">
            {editingAccount ? 'Editar Conta Bancária' : 'Cadastrar Nova Conta Bancária'}
          </ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Instituição Bancária</FormLabel>
                <Select 
                  value={bankName} 
                  onChange={(e) => handleBankSelect(e.target.value)} 
                  borderRadius="xl"
                >
                  {PRESET_BANKS.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nome da Conta / Identificação</FormLabel>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ex: Nubank Conta Principal, Santander Cartão, PicPay Rendimentos"
                  borderRadius="xl"
                  focusBorderColor="#10B981"
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl flex={1}>
                  <FormLabel>Agência (Opcional)</FormLabel>
                  <Input 
                    value={agency} 
                    onChange={(e) => setAgency(e.target.value)} 
                    placeholder="Ex: 0001"
                    borderRadius="xl"
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Número da Conta (Opcional)</FormLabel>
                  <Input 
                    value={accountNumber} 
                    onChange={(e) => setAccountNumber(e.target.value)} 
                    placeholder="Ex: 123456-7"
                    borderRadius="xl"
                  />
                </FormControl>
              </HStack>

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
              {editingAccount ? 'Salvar Alterações' : 'Cadastrar Conta'}
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
              Tem certeza que deseja excluir esta conta bancária? As transações vinculadas continuarão registradas.
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
