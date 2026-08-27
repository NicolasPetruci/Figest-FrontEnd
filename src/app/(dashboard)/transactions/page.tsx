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
  Spinner,
  useToast,
  Badge,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiArrowUpRight,
  FiArrowDownRight,
  FiUploadCloud,
  FiFileText,
  FiInbox,
  FiFilter,
  FiCalendar,
} from 'react-icons/fi';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
  bankName: string;
  color?: string;
}

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category?: Category | string;
  account?: Account | string;
  accountId?: string;
  subtag?: string;
  tags?: string[];
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [periodMode, setPeriodMode] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedSubtag, setSelectedSubtag] = useState<string>('');

  // Modals
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOfxOpen, onOpen: onOfxOpen, onClose: onOfxClose } = useDisclosure();

  // Form State
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    description: '',
    categoryId: '',
    accountId: '',
    subtag: '',
    date: new Date().toISOString().split('T')[0],
  });

  // OFX State
  const [ofxFile, setOfxFile] = useState<File | null>(null);
  const [ofxAccountId, setOfxAccountId] = useState('');
  const [ofxSubtag, setOfxSubtag] = useState('');
  const [isUploadingOfx, setIsUploadingOfx] = useState(false);

  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let query = `/finance/transactions?period=${periodMode}&year=${selectedYear}`;
      if (periodMode === 'MONTHLY') {
        query += `&month=${selectedMonth}`;
      }
      if (selectedAccountId) {
        query += `&accountId=${selectedAccountId}`;
      }
      if (selectedSubtag) {
        query += `&subtag=${encodeURIComponent(selectedSubtag)}`;
      }

      const [resTx, resCat, resAcc] = await Promise.allSettled([
        api.get(query),
        api.get('/finance/categories'),
        api.get('/finance/accounts'),
      ]);

      if (resCat.status === 'fulfilled' && Array.isArray(resCat.value.data)) {
        setCategories(resCat.value.data);
        if (resCat.value.data.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: resCat.value.data[0].id }));
        }
      }

      if (resAcc.status === 'fulfilled' && Array.isArray(resAcc.value.data)) {
        setAccounts(resAcc.value.data);
        if (resAcc.value.data.length > 0 && !formData.accountId) {
          setFormData(prev => ({ ...prev, accountId: resAcc.value.data[0].id }));
          setOfxAccountId(resAcc.value.data[0].id);
        }
      }

      if (resTx.status === 'fulfilled' && Array.isArray(resTx.value.data)) {
        setTransactions(resTx.value.data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions from backend', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [periodMode, selectedMonth, selectedYear, selectedAccountId, selectedSubtag]);

  const handleSave = async () => {
    if (!formData.amount || !formData.description) {
      toast({ title: 'Preencha o valor e a descrição', status: 'warning', duration: 3000 });
      return;
    }

    try {
      await api.post('/finance/transactions', {
        type: formData.type,
        amount: Number(formData.amount),
        description: formData.description,
        categoryId: formData.categoryId || undefined,
        accountId: formData.accountId || undefined,
        subtag: formData.subtag || undefined,
        date: new Date(formData.date).toISOString(),
      });
      toast({ title: 'Transação salva com sucesso!', status: 'success', duration: 3000 });
      onClose();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save transaction to backend', error);
      toast({ title: 'Erro ao salvar transação', status: 'error', duration: 4000 });
    }
  };

  const handleUploadOfx = async () => {
    if (!ofxFile) {
      toast({ title: 'Selecione um arquivo .OFX', status: 'warning', duration: 3000 });
      return;
    }

    setIsUploadingOfx(true);
    try {
      const data = new FormData();
      data.append('file', ofxFile);
      if (ofxAccountId) data.append('accountId', ofxAccountId);
      if (ofxSubtag) data.append('subtag', ofxSubtag);

      const res = await api.post('/integrations/import/ofx', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({
        title: 'Extrato OFX importado com sucesso!',
        description: `Transações cadastradas no banco selecionado: ${res.data?.inserted ?? 0}`,
        status: 'success',
        duration: 4000,
      });
      onOfxClose();
      fetchData();
    } catch (error: any) {
      console.error('Erro ao importar OFX:', error);
      toast({ title: 'Erro ao importar extrato OFX', status: 'error', duration: 4000 });
    } finally {
      setIsUploadingOfx(false);
      setOfxFile(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getCategoryName = (cat?: Category | string) => {
    if (!cat) return 'Geral';
    if (typeof cat === 'string') return cat;
    return cat.name;
  };

  const getAccountInfo = (acc?: Account | string) => {
    if (!acc) return { name: 'Conta Principal', bankName: 'Banco', color: '#10B981' };
    if (typeof acc === 'string') return { name: acc, bankName: 'Banco', color: '#10B981' };
    return {
      name: acc.name,
      bankName: acc.bankName || acc.name,
      color: acc.color || '#10B981',
    };
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, t) => {
    const d = new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <Box position="relative" minH="100%">
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold">Transações Financeiras</Heading>
          <Text color="gray.500" fontSize="sm">Filtre por banco (Nubank, Santander, etc.), subtags e período mensal/anual</Text>
        </Box>
        
        <HStack spacing={3}>
          <Button leftIcon={<FiUploadCloud />} variant="outline" colorScheme="blue" borderRadius="xl" onClick={onOfxOpen}>
            Importar Extrato OFX
          </Button>
          <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={onOpen}>
            Nova Transação
          </Button>
        </HStack>
      </Flex>

      {/* Filter Bar */}
      <Box bg={bg} p={4} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} mb={6} shadow="sm">
        <Flex direction={{ base: 'column', lg: 'row' }} gap={4} align={{ base: 'stretch', lg: 'center' }}>
          <HStack spacing={2}>
            <Icon as={FiFilter} color="gray.500" />
            <Text fontSize="sm" fontWeight="bold">Filtros:</Text>
          </HStack>

          {/* Period Mode */}
          <Select 
            value={periodMode} 
            onChange={(e) => setPeriodMode(e.target.value as 'MONTHLY' | 'ANNUAL')} 
            w={{ base: 'full', lg: '160px' }} 
            borderRadius="xl" 
            size="sm"
          >
            <option value="MONTHLY">Visão Mensal</option>
            <option value="ANNUAL">Visão Anual</option>
          </Select>

          {/* Month Selector (if monthly) */}
          {periodMode === 'MONTHLY' && (
            <Select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              w={{ base: 'full', lg: '140px' }} 
              borderRadius="xl" 
              size="sm"
            >
              <option value="1">Janeiro</option>
              <option value="2">Fevereiro</option>
              <option value="3">Março</option>
              <option value="4">Abril</option>
              <option value="5">Maio</option>
              <option value="6">Junho</option>
              <option value="7">Julho</option>
              <option value="8">Agosto</option>
              <option value="9">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </Select>
          )}

          {/* Year Selector */}
          <Select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)} 
            w={{ base: 'full', lg: '110px' }} 
            borderRadius="xl" 
            size="sm"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </Select>

          {/* Bank Filter */}
          <Select 
            value={selectedAccountId} 
            onChange={(e) => setSelectedAccountId(e.target.value)} 
            w={{ base: 'full', lg: '200px' }} 
            borderRadius="xl" 
            size="sm"
          >
            <option value="">Todos os Bancos</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.bankName || a.name}</option>
            ))}
          </Select>

          {/* Subtag Filter */}
          <Input 
            placeholder="Filtrar por Subtag (ex: Ifood)" 
            value={selectedSubtag} 
            onChange={(e) => setSelectedSubtag(e.target.value)} 
            w={{ base: 'full', lg: '220px' }} 
            borderRadius="xl" 
            size="sm"
          />
        </Flex>
      </Box>

      {/* Transactions List */}
      {isLoading ? (
        <Flex justify="center" p={10}><Spinner color="emerald.500" size="xl" /></Flex>
      ) : transactions.length === 0 ? (
        <Flex direction="column" align="center" justify="center" minH="280px" bg={bg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} p={8}>
          <Icon as={FiInbox} boxSize={12} color="gray.400" mb={3} />
          <Text fontSize="lg" fontWeight="bold">Nenhuma transação para este filtro</Text>
          <Text fontSize="sm" color="gray.500" mb={6} textAlign="center" maxW="400px">
            Não foram encontrados lançamentos no período ou banco selecionado.
          </Text>
          <HStack spacing={4}>
            <Button leftIcon={<FiUploadCloud />} colorScheme="blue" variant="outline" borderRadius="xl" onClick={onOfxOpen}>
              Importar Extrato .OFX
            </Button>
            <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={onOpen}>
              Criar Lançamento
            </Button>
          </HStack>
        </Flex>
      ) : (
        <VStack spacing={6} align="stretch" pb={20}>
          {Object.entries(groupedTransactions).map(([date, items]) => (
            <Box key={date}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase" letterSpacing="wider">
                {date}
              </Text>
              <VStack spacing={3} align="stretch">
                {items.map(t => {
                  const accInfo = getAccountInfo(t.account);
                  return (
                    <Flex 
                      key={t.id} 
                      bg={bg} 
                      p={4} 
                      borderRadius="2xl" 
                      borderWidth="1px" 
                      borderColor={borderColor}
                      align="center"
                      justify="space-between"
                      shadow="sm"
                      transition="all 0.2s"
                      _hover={{ boxShadow: 'md' }}
                    >
                      <Flex align="center">
                        <Flex 
                          bg={t.type === 'INCOME' ? 'emerald.100' : 'red.100'} 
                          p={3} 
                          borderRadius="xl" 
                          mr={4}
                        >
                          <Icon 
                            as={t.type === 'INCOME' ? FiArrowUpRight : FiArrowDownRight} 
                            color={t.type === 'INCOME' ? 'emerald.600' : 'red.600'} 
                            boxSize={5} 
                          />
                        </Flex>
                        <Box>
                          <HStack spacing={2} mb={1}>
                            <Text fontWeight="bold">{t.description}</Text>
                            <Badge 
                              bg={`${accInfo.color}20`} 
                              style={{ color: accInfo.color }} 
                              borderRadius="full" 
                              px={2} 
                              py={0.5} 
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              {accInfo.bankName}
                            </Badge>
                          </HStack>
                          <HStack spacing={2}>
                            <Badge colorScheme="gray" fontSize="xs" borderRadius="md">
                              {getCategoryName(t.category)}
                            </Badge>
                            {t.subtag && (
                              <Tag size="sm" colorScheme="purple" borderRadius="full">
                                <TagLabel>#{t.subtag}</TagLabel>
                              </Tag>
                            )}
                          </HStack>
                        </Box>
                      </Flex>
                      <Text 
                        fontWeight="bold" 
                        fontSize="lg"
                        color={t.type === 'INCOME' ? 'emerald.500' : 'red.500'}
                      >
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </Text>
                    </Flex>
                  );
                })}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* Modal Nova Transacao */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">Adicionar Nova Transação</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Tipo de Lançamento</FormLabel>
                <Select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  borderRadius="xl"
                >
                  <option value="EXPENSE">Saída / Despesa</option>
                  <option value="INCOME">Entrada / Receita</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Valor (R$)</FormLabel>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  borderRadius="xl"
                  focusBorderColor="#10B981"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Descrição</FormLabel>
                <Input 
                  placeholder="Ex: Almoço Restaurante, Fatura Nubank, Salário"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  borderRadius="xl"
                  focusBorderColor="#10B981"
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl flex={1} isRequired>
                  <FormLabel>Banco / Conta</FormLabel>
                  <Select
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    borderRadius="xl"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName || a.name}</option>)}
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    borderRadius="xl"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Subtag de Categoria (Opcional)</FormLabel>
                <Input 
                  placeholder="Ex: Ifood, Uber, Fatura Cartão, Projeto A"
                  value={formData.subtag} 
                  onChange={(e) => setFormData({...formData, subtag: e.target.value})} 
                  borderRadius="xl"
                  focusBorderColor="#10B981"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Data do Lançamento</FormLabel>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  borderRadius="xl"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onClose}>Cancelar</Button>
            <Button bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={handleSave}>
              Salvar Lançamento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Importar OFX */}
      <Modal isOpen={isOfxOpen} onClose={onOfxClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">Importar Extrato Bancário (.OFX)</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.500">
                Selecione o banco de destino para vincular as transações do extrato `.ofx`.
              </Text>
              
              <FormControl isRequired>
                <FormLabel>Vincular ao Banco / Conta</FormLabel>
                <Select 
                  value={ofxAccountId} 
                  onChange={(e) => setOfxAccountId(e.target.value)}
                  borderRadius="xl"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.bankName || a.name}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Subtag de Categoria para o Extrato (Opcional)</FormLabel>
                <Input 
                  placeholder="Ex: Fatura Nubank, Extrato Santander, Viagem"
                  value={ofxSubtag} 
                  onChange={(e) => setOfxSubtag(e.target.value)} 
                  borderRadius="xl"
                />
              </FormControl>

              <Box
                border="2px dashed"
                borderColor="blue.300"
                borderRadius="2xl"
                p={6}
                textAlign="center"
                bg={useColorModeValue('blue.50', 'gray.900')}
              >
                <Icon as={FiFileText} boxSize={10} color="blue.500" mb={2} />
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  {ofxFile ? ofxFile.name : 'Clique para selecionar o arquivo .ofx'}
                </Text>
                <Input
                  type="file"
                  accept=".ofx"
                  onChange={(e) => setOfxFile(e.target.files?.[0] || null)}
                  display="block"
                  mx="auto"
                  size="sm"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onOfxClose}>Cancelar</Button>
            <Button colorScheme="blue" borderRadius="xl" isLoading={isUploadingOfx} onClick={handleUploadOfx}>
              Enviar Extrato
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
