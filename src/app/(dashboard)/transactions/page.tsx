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
  Checkbox,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiArrowUpRight,
  FiArrowDownRight,
  FiUploadCloud,
  FiFileText,
  FiInbox,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiCheckSquare,
  FiFolder,
  FiLayers,
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
  categoryId?: string;
  account?: Account | string;
  accountId?: string;
  subtag?: string;
  importBatchId?: string;
  date: string;
}

interface ImportLog {
  ID: number;
  BatchID: string;
  FileName: string;
  FileType: string;
  AccountID: string;
  Subtag: string;
  TotalTransactions: number;
  CreatedAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Filters State
  const [periodMode, setPeriodMode] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedSubtag, setSelectedSubtag] = useState<string>('');

  // Selection & Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAccountId, setBulkAccountId] = useState('');
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [bulkSubtag, setBulkSubtag] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // OFX Batch Edit State
  const [editingBatch, setEditingBatch] = useState<ImportLog | null>(null);
  const [editBatchAccountId, setEditBatchAccountId] = useState('');
  const [editBatchSubtag, setEditBatchSubtag] = useState('');
  const [isUpdatingBatch, setIsUpdatingBatch] = useState(false);

  // Modals State
  const { isOpen, onOpen, onClose } = useDisclosure(); // Create/Edit Modal
  const { isOpen: isOfxOpen, onOpen: onOfxOpen, onClose: onOfxClose } = useDisclosure();
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();
  const { isOpen: isBatchEditOpen, onOpen: onBatchEditOpen, onClose: onBatchEditClose } = useDisclosure();

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

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
      }

      if (resAcc.status === 'fulfilled' && Array.isArray(resAcc.value.data)) {
        setAccounts(resAcc.value.data);
        if (resAcc.value.data.length > 0 && !ofxAccountId) {
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

  const fetchImportLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await api.get('/integrations/import/history');
      if (Array.isArray(res.data)) {
        setImportLogs(res.data);
      } else {
        setImportLogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch import logs', error);
      setImportLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchImportLogs();
  }, [periodMode, selectedMonth, selectedYear, selectedAccountId, selectedSubtag]);

  const handleOpenCreateModal = () => {
    setEditingTx(null);
    setFormData({
      type: 'EXPENSE',
      amount: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      accountId: accounts.length > 0 ? accounts[0].id : '',
      subtag: '',
      date: new Date().toISOString().split('T')[0],
    });
    onOpen();
  };

  const handleOpenEditModal = (t: Transaction) => {
    setEditingTx(t);
    const catId = typeof t.category === 'object' ? t.category?.id : (t.categoryId || '');
    const accId = typeof t.account === 'object' ? t.account?.id : (t.accountId || '');
    setFormData({
      type: t.type,
      amount: String(t.amount),
      description: t.description,
      categoryId: catId || (categories.length > 0 ? categories[0].id : ''),
      accountId: accId || (accounts.length > 0 ? accounts[0].id : ''),
      subtag: t.subtag || '',
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!formData.amount || !formData.description) {
      toast({ title: 'Preencha o valor e a descrição', status: 'warning', duration: 3000 });
      return;
    }

    try {
      const payload = {
        type: formData.type as 'INCOME' | 'EXPENSE',
        amount: Number(formData.amount),
        description: formData.description,
        categoryId: formData.categoryId || undefined,
        accountId: formData.accountId || undefined,
        subtag: formData.subtag || undefined,
        date: new Date(formData.date).toISOString(),
      };

      if (editingTx) {
        await api.patch(`/finance/transactions/${editingTx.id}`, payload);
        toast({ title: 'Transação atualizada com sucesso!', status: 'success', duration: 3000 });
      } else {
        await api.post('/finance/transactions', payload);
        toast({ title: 'Transação criada com sucesso!', status: 'success', duration: 3000 });
      }
      onClose();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save transaction', error);
      toast({ title: 'Erro ao salvar transação', status: 'error', duration: 4000 });
    }
  };

  const handleDeleteTx = async (id: string) => {
    try {
      await api.delete(`/finance/transactions/${id}`);
      toast({ title: 'Transação excluída', status: 'success', duration: 3000 });
      fetchData();
    } catch (error) {
      console.error('Failed to delete transaction', error);
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
        description: `${res.data?.inserted ?? 0} transações cadastradas no banco selecionado.`,
        status: 'success',
        duration: 4000,
      });
      onOfxClose();
      fetchData();
      fetchImportLogs();
    } catch (error: any) {
      console.error('Erro ao importar OFX:', error);
      toast({ title: 'Erro ao importar extrato OFX', status: 'error', duration: 4000 });
    } finally {
      setIsUploadingOfx(false);
      setOfxFile(null);
    }
  };

  // Open Edit OFX Batch Modal
  const handleOpenBatchEditModal = (log: ImportLog) => {
    setEditingBatch(log);
    setEditBatchAccountId(log.AccountID || (accounts.length > 0 ? accounts[0].id : ''));
    setEditBatchSubtag(log.Subtag || '');
    onBatchEditOpen();
  };

  // Execute OFX Batch Reclassification
  const handleSaveBatchEdit = async () => {
    if (!editingBatch) return;
    setIsUpdatingBatch(true);
    try {
      await api.patch(`/integrations/import/history/${editingBatch.BatchID}`, {
        accountId: editBatchAccountId,
        subtag: editBatchSubtag,
      });

      toast({
        title: 'Extrato OFX Reclassificado!',
        description: `Todas as transações do extrato ${editingBatch.FileName} foram atualizadas para o novo banco.`,
        status: 'success',
        duration: 4000,
      });
      onBatchEditClose();
      fetchData();
      fetchImportLogs();
    } catch (error) {
      console.error('Failed to update OFX batch', error);
      toast({ title: 'Erro ao reclassificar extrato OFX', status: 'error', duration: 4000 });
    } finally {
      setIsUpdatingBatch(false);
    }
  };

  // Checkbox selection logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(transactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Edit Execution
  const handleApplyBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await api.post('/finance/transactions/bulk-update', {
        transactionIds: selectedIds,
        accountId: bulkAccountId || undefined,
        categoryId: bulkCategoryId || undefined,
        subtag: bulkSubtag.trim() !== '' ? bulkSubtag : undefined,
      });
      toast({
        title: 'Transações Reclassificadas!',
        description: `${selectedIds.length} transações atualizadas com sucesso.`,
        status: 'success',
        duration: 4000,
      });
      setSelectedIds([]);
      onBulkClose();
      fetchData();
    } catch (error) {
      console.error('Failed to bulk update transactions', error);
      toast({ title: 'Erro na reclassificação em massa', status: 'error', duration: 4000 });
    } finally {
      setIsBulkUpdating(false);
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

  const getAccountInfo = (accOrId?: Account | string) => {
    if (!accOrId) return { name: 'Conta Principal', bankName: 'Banco Geral', color: '#10B981' };
    if (typeof accOrId === 'string') {
      const found = accounts.find(a => a.id === accOrId);
      if (found) return { name: found.name, bankName: found.bankName || found.name, color: found.color || '#10B981' };
      return { name: accOrId, bankName: 'Banco Geral', color: '#10B981' };
    }
    return {
      name: accOrId.name,
      bankName: accOrId.bankName || accOrId.name,
      color: accOrId.color || '#10B981',
    };
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, t) => {
    const d = new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const allSelected = transactions.length > 0 && selectedIds.length === transactions.length;

  return (
    <Box position="relative" minH="100%" pb={28}>
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold">Gestão & Extratos OFX</Heading>
          <Text color="gray.500" fontSize="sm">Altere o banco ou subtag de arquivos `.OFX` inteiros ou transações individuais</Text>
        </Box>
        
        <HStack spacing={3}>
          <Button leftIcon={<FiUploadCloud />} variant="outline" colorScheme="blue" borderRadius="xl" onClick={onOfxOpen}>
            Importar Extrato OFX
          </Button>
          <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={handleOpenCreateModal}>
            Nova Transação
          </Button>
        </HStack>
      </Flex>

      {/* Tabs */}
      <Tabs variant="soft-rounded" colorScheme="emerald" mb={6}>
        <TabList bg={bg} p={1.5} borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
          <Tab borderRadius="xl" fontWeight="bold" fontSize="sm">
            <Icon as={FiLayers} mr={2} /> Todas as Transações ({transactions.length})
          </Tab>
          <Tab borderRadius="xl" fontWeight="bold" fontSize="sm">
            <Icon as={FiFolder} mr={2} /> Extratos OFX Importados ({importLogs.length})
          </Tab>
        </TabList>

        <TabPanels mt={4}>
          {/* TAB 1: TRANSAÇÕES */}
          <TabPanel p={0}>
            {/* Filter Bar */}
            <Box bg={bg} p={4} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} mb={6} shadow="sm">
              <Flex direction={{ base: 'column', lg: 'row' }} gap={4} align={{ base: 'stretch', lg: 'center' }}>
                <HStack spacing={2}>
                  <Icon as={FiFilter} color="gray.500" />
                  <Text fontSize="sm" fontWeight="bold">Filtros:</Text>
                </HStack>

                {transactions.length > 0 && (
                  <Checkbox 
                    isChecked={allSelected} 
                    isIndeterminate={selectedIds.length > 0 && !allSelected} 
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    colorScheme="emerald"
                  >
                    <Text fontSize="xs" fontWeight="bold" color="gray.500">Selecionar Todos</Text>
                  </Checkbox>
                )}

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

                <Select 
                  value={selectedAccountId} 
                  onChange={(e) => setSelectedAccountId(e.target.value)} 
                  w={{ base: 'full', lg: '180px' }} 
                  borderRadius="xl" 
                  size="sm"
                >
                  <option value="">Todos os Bancos</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.bankName || a.name}</option>
                  ))}
                </Select>

                <Input 
                  placeholder="Filtrar por Subtag (ex: Ifood)" 
                  value={selectedSubtag} 
                  onChange={(e) => setSelectedSubtag(e.target.value)} 
                  w={{ base: 'full', lg: '200px' }} 
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
                <Text fontSize="lg" fontWeight="bold">Nenhuma transação encontrada</Text>
                <Text fontSize="sm" color="gray.500" mb={6} textAlign="center" maxW="400px">
                  Seu extrato está vazio no filtro atual. Importe um extrato `.OFX` ou adicione uma transação manual.
                </Text>
                <HStack spacing={4}>
                  <Button leftIcon={<FiUploadCloud />} colorScheme="blue" variant="outline" borderRadius="xl" onClick={onOfxOpen}>
                    Importar Extrato .OFX
                  </Button>
                  <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={handleOpenCreateModal}>
                    Criar Lançamento
                  </Button>
                </HStack>
              </Flex>
            ) : (
              <VStack spacing={6} align="stretch">
                {Object.entries(groupedTransactions).map(([date, items]) => (
                  <Box key={date}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase" letterSpacing="wider">
                      {date}
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {items.map(t => {
                        const accInfo = getAccountInfo(t.account);
                        const isSelected = selectedIds.includes(t.id);

                        return (
                          <Flex 
                            key={t.id} 
                            bg={isSelected ? useColorModeValue('emerald.50', 'gray.700') : bg} 
                            p={4} 
                            borderRadius="2xl" 
                            borderWidth="1px" 
                            borderColor={isSelected ? '#10B981' : borderColor}
                            align="center"
                            justify="space-between"
                            shadow="sm"
                            transition="all 0.2s"
                            _hover={{ boxShadow: 'md' }}
                          >
                            <Flex align="center">
                              <Checkbox 
                                isChecked={isSelected} 
                                onChange={() => handleToggleSelect(t.id)} 
                                colorScheme="emerald" 
                                mr={4}
                              />

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
                                    px={2.5} 
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

                            <HStack spacing={4}>
                              <Text 
                                fontWeight="bold" 
                                fontSize="lg"
                                color={t.type === 'INCOME' ? 'emerald.500' : 'red.500'}
                              >
                                {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                              </Text>

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
                                  <MenuItem icon={<FiEdit2 />} onClick={() => handleOpenEditModal(t)}>
                                    Editar / Tagear
                                  </MenuItem>
                                  <MenuItem icon={<FiTrash2 />} color="red.400" onClick={() => handleDeleteTx(t.id)}>
                                    Excluir Lançamento
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>
                          </Flex>
                        );
                      })}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>

          {/* TAB 2: HISTÓRICO DE EXTRATOS OFX */}
          <TabPanel p={0}>
            {isLoadingLogs ? (
              <Flex justify="center" p={10}><Spinner color="emerald.500" size="xl" /></Flex>
            ) : importLogs.length === 0 ? (
              <Flex direction="column" align="center" justify="center" minH="280px" bg={bg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} p={8}>
                <Icon as={FiFileText} boxSize={12} color="gray.400" mb={3} />
                <Text fontSize="lg" fontWeight="bold">Nenhum extrato OFX importado</Text>
                <Text fontSize="sm" color="gray.500" mb={4}>Importe um arquivo `.OFX` do seu banco para gerenciá-lo como um lote único.</Text>
                <Button leftIcon={<FiUploadCloud />} colorScheme="blue" borderRadius="xl" onClick={onOfxOpen}>
                  Importar Primeiro Extrato
                </Button>
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {importLogs.map(log => {
                  const accInfo = getAccountInfo(log.AccountID);
                  const formattedDate = log.CreatedAt ? new Date(log.CreatedAt).toLocaleString('pt-BR') : 'Data recente';

                  return (
                    <Box 
                      key={log.ID} 
                      bg={bg} 
                      p={6} 
                      borderRadius="2xl" 
                      borderWidth="1px" 
                      borderColor={borderColor}
                      shadow="sm"
                      position="relative"
                    >
                      <Flex justify="space-between" align="start" mb={3}>
                        <Flex align="center">
                          <Flex bg="blue.100" p={3} borderRadius="xl" mr={3}>
                            <Icon as={FiFileText} color="blue.600" boxSize={6} />
                          </Flex>
                          <Box>
                            <Text fontWeight="bold" fontSize="md" noOfLines={1}>{log.FileName}</Text>
                            <Text fontSize="xs" color="gray.400">{formattedDate}</Text>
                          </Box>
                        </Flex>
                      </Flex>

                      <VStack align="stretch" spacing={2} my={4} bg={useColorModeValue('gray.50', 'gray.900')} p={3} borderRadius="xl" fontSize="xs">
                        <Flex justify="space-between">
                          <Text color="gray.500">Transações Lidas:</Text>
                          <Text fontWeight="bold">{log.TotalTransactions} lançamentos</Text>
                        </Flex>
                        <Flex justify="space-between" align="center">
                          <Text color="gray.500">Banco Vinculado:</Text>
                          <Badge bg={`${accInfo.color}20`} style={{ color: accInfo.color }} borderRadius="full" px={2} py={0.5}>
                            {accInfo.bankName}
                          </Badge>
                        </Flex>
                        {log.Subtag && (
                          <Flex justify="space-between" align="center">
                            <Text color="gray.500">Subtag do Extrato:</Text>
                            <Tag size="sm" colorScheme="purple" borderRadius="full">
                              <TagLabel>#{log.Subtag}</TagLabel>
                            </Tag>
                          </Flex>
                        )}
                      </VStack>

                      <Button 
                        w="full" 
                        size="sm" 
                        leftIcon={<FiEdit2 />} 
                        colorScheme="blue" 
                        variant="outline" 
                        borderRadius="xl"
                        onClick={() => handleOpenBatchEditModal(log)}
                      >
                        Reclassificar Extrato Inteiro
                      </Button>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Floating Action Bar for Bulk Tagging */}
      {selectedIds.length > 0 && (
        <Box 
          position="fixed" 
          bottom="24px" 
          left="50%" 
          transform="translateX(-50%)" 
          bg={useColorModeValue('gray.900', 'gray.800')} 
          color="white" 
          px={6} 
          py={4} 
          borderRadius="2xl" 
          shadow="2xl" 
          zIndex={100}
          w={{ base: '90%', md: '600px' }}
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={FiCheckSquare} color="emerald.400" boxSize={5} />
              <Text fontWeight="bold" fontSize="sm">
                {selectedIds.length} transaç{selectedIds.length > 1 ? 'ões selecionadas' : 'ão selecionada'}
              </Text>
            </HStack>
            
            <HStack spacing={3}>
              <Button size="sm" colorScheme="emerald" borderRadius="xl" onClick={onBulkOpen}>
                Classificar / Tagear em Massa
              </Button>
              <Button size="sm" variant="ghost" color="gray.400" _hover={{ color: 'white' }} onClick={() => setSelectedIds([])}>
                Cancelar
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}

      {/* Modal Editar Extrato Inteiro (Batch) */}
      <Modal isOpen={isBatchEditOpen} onClose={onBatchEditClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">
            Reclassificar Extrato OFX Inteiro
          </ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.500">
                Altere o banco ou a subtag do extrato `{editingBatch?.FileName}`. Isso atualizará automaticamente todas as **{editingBatch?.TotalTransactions} transações** trazidas por este arquivo!
              </Text>

              <FormControl isRequired>
                <FormLabel>Novo Banco / Conta Bancária</FormLabel>
                <Select
                  value={editBatchAccountId}
                  onChange={(e) => setEditBatchAccountId(e.target.value)}
                  borderRadius="xl"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName || a.name}</option>)}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Nova Subtag do Extrato (Opcional)</FormLabel>
                <Input
                  placeholder="Ex: Fatura Nubank, Viagem Julho, Extrato Itaú"
                  value={editBatchSubtag}
                  onChange={(e) => setEditBatchSubtag(e.target.value)}
                  borderRadius="xl"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onBatchEditClose}>Cancelar</Button>
            <Button bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" isLoading={isUpdatingBatch} onClick={handleSaveBatchEdit}>
              Atualizar Todo o Extrato
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Criar / Editar Transação Individual */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">
            {editingTx ? 'Editar / Tagear Transação' : 'Adicionar Nova Transação'}
          </ModalHeader>
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
                  <FormLabel>Banco / Conta Bancária</FormLabel>
                  <Select
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    borderRadius="xl"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName || a.name}</option>)}
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Categoria Principal</FormLabel>
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
                <FormLabel>Subtag de Categoria</FormLabel>
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
              {editingTx ? 'Salvar Alterações' : 'Salvar Lançamento'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Reclassificação em Massa */}
      <Modal isOpen={isBulkOpen} onClose={onBulkClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">
            Classificar {selectedIds.length} Transaç{selectedIds.length > 1 ? 'ões' : 'ão'} em Massa
          </ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.500">
                Selecione os campos que deseja alterar para todas as transações selecionadas.
              </Text>

              <FormControl>
                <FormLabel>Alterar Banco / Conta</FormLabel>
                <Select
                  value={bulkAccountId}
                  onChange={(e) => setBulkAccountId(e.target.value)}
                  borderRadius="xl"
                >
                  <option value="">-- Não alterar banco --</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.bankName || a.name}</option>)}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Alterar Categoria Principal</FormLabel>
                <Select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  borderRadius="xl"
                >
                  <option value="">-- Não alterar categoria --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Atribuir Subtag de Categoria</FormLabel>
                <Input
                  placeholder="Ex: Fatura Nubank, Viagem Julho, Alimentação"
                  value={bulkSubtag}
                  onChange={(e) => setBulkSubtag(e.target.value)}
                  borderRadius="xl"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onBulkClose}>Cancelar</Button>
            <Button bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" isLoading={isBulkUpdating} onClick={handleApplyBulkUpdate}>
              Aplicar em Massa
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
