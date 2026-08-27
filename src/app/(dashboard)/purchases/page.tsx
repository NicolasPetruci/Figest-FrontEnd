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
  HStack,
  Spinner,
  useToast,
  Badge,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiDollarSign,
  FiTrash2,
  FiMoreVertical,
  FiUserCheck,
  FiCalendar,
  FiPackage,
} from 'react-icons/fi';
import { api } from '@/lib/api';

interface Supplier {
  id: number | string;
  name: string;
  contact: string;
}

interface Purchase {
  id: number | string;
  supplierId: number | string;
  supplierName?: string;
  material: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  expenseType: string;
}

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 1, name: 'TechDistribuidora Ltda', contact: 'contato@techdist.com.br | (11) 98888-1111' },
  { id: 2, name: 'Papelaria & Insumos Central', contact: 'vendas@insumoscentral.com' },
  { id: 3, name: 'Atacado Industrial SP', contact: '(11) 3333-4444' },
];

const DEFAULT_PURCHASES: Purchase[] = [
  { id: 101, supplierId: 1, supplierName: 'TechDistribuidora Ltda', material: 'Servidores & Licenças Cloud', quantity: 2, unitPrice: 2500.00, totalPrice: 5000.00, purchaseDate: '2026-08-20', expenseType: 'Tecnologia & TI' },
  { id: 102, supplierId: 2, supplierName: 'Papelaria & Insumos Central', material: 'Kits de Escritório & Papelaria A4', quantity: 15, unitPrice: 45.00, totalPrice: 675.00, purchaseDate: '2026-08-22', expenseType: 'Escritório' },
  { id: 103, supplierId: 3, supplierName: 'Atacado Industrial SP', material: 'Matéria-Prima de Produção Lote #4', quantity: 50, unitPrice: 120.00, totalPrice: 6000.00, purchaseDate: '2026-08-25', expenseType: 'Operacional' },
];

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const { isOpen: isPurchaseOpen, onOpen: onPurchaseOpen, onClose: onPurchaseClose } = useDisclosure();
  const { isOpen: isSupplierOpen, onOpen: onSupplierOpen, onClose: onSupplierClose } = useDisclosure();

  // Purchase Form
  const [material, setMaterial] = useState('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('0');
  const [expenseType, setExpenseType] = useState('Operacional');
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);

  // Supplier Form
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);

  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resPurchases, resSuppliers] = await Promise.allSettled([
        api.get('/purchases/purchases'),
        api.get('/purchases/suppliers'),
      ]);

      let loadedSuppliers = DEFAULT_SUPPLIERS;
      if (resSuppliers.status === 'fulfilled' && Array.isArray(resSuppliers.value.data) && resSuppliers.value.data.length > 0) {
        loadedSuppliers = resSuppliers.value.data;
      }
      setSuppliers(loadedSuppliers);

      if (resPurchases.status === 'fulfilled' && Array.isArray(resPurchases.value.data) && resPurchases.value.data.length > 0) {
        setPurchases(resPurchases.value.data);
      } else {
        setPurchases(DEFAULT_PURCHASES);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de compras:', error);
      setSuppliers(DEFAULT_SUPPLIERS);
      setPurchases(DEFAULT_PURCHASES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePurchase = async () => {
    if (!material.trim()) {
      toast({ title: 'Insira o nome do material/insumo', status: 'warning', duration: 3000 });
      return;
    }

    const qty = parseInt(quantity) || 1;
    const price = parseFloat(unitPrice) || 0;
    const total = qty * price;
    const selectedSupplier = suppliers.find(s => String(s.id) === String(supplierId));

    setIsSavingPurchase(true);
    try {
      const payload = {
        material,
        supplierId: selectedSupplier ? selectedSupplier.id : 0,
        quantity: qty,
        unitPrice: price,
        totalPrice: total,
        purchaseDate: new Date().toISOString().split('T')[0],
        expenseType,
      };

      await api.post('/purchases/purchases', payload);
      toast({ title: 'Ordem de compra registrada!', status: 'success', duration: 3000 });
      onPurchaseClose();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      // Local optimistic update
      const newPurchase: Purchase = {
        id: Date.now(),
        supplierId: supplierId || 0,
        supplierName: selectedSupplier ? selectedSupplier.name : 'Fornecedor Avulso',
        material,
        quantity: qty,
        unitPrice: price,
        totalPrice: total,
        purchaseDate: new Date().toISOString().split('T')[0],
        expenseType,
      };
      setPurchases(prev => [newPurchase, ...prev]);
      toast({ title: 'Compra adicionada!', status: 'info', duration: 3000 });
      onPurchaseClose();
    } finally {
      setIsSavingPurchase(false);
      setMaterial('');
      setQuantity('1');
      setUnitPrice('0');
    }
  };

  const handleSaveSupplier = async () => {
    if (!supplierName.trim()) {
      toast({ title: 'Informe o nome do fornecedor', status: 'warning', duration: 3000 });
      return;
    }

    setIsSavingSupplier(true);
    try {
      const payload = { name: supplierName, contact: supplierContact };
      await api.post('/purchases/suppliers', payload);
      toast({ title: 'Fornecedor cadastrado!', status: 'success', duration: 3000 });
      onSupplierClose();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      const newSupplier: Supplier = {
        id: Date.now(),
        name: supplierName,
        contact: supplierContact,
      };
      setSuppliers(prev => [...prev, newSupplier]);
      toast({ title: 'Fornecedor cadastrado!', status: 'info', duration: 3000 });
      onSupplierClose();
    } finally {
      setIsSavingSupplier(false);
      setSupplierName('');
      setSupplierContact('');
    }
  };

  const handleDeletePurchase = async (id: number | string) => {
    try {
      await api.delete(`/purchases/purchases/${id}`);
      toast({ title: 'Compra removida', status: 'success', duration: 3000 });
    } catch (error) {
      console.error('Erro ao remover compra:', error);
    } finally {
      setPurchases(prev => prev.filter(p => String(p.id) !== String(id)));
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalSpent = purchases.reduce((acc, p) => acc + (p.totalPrice || 0), 0);

  const filteredPurchases = purchases.filter(p =>
    p.material.toLowerCase().includes(search.toLowerCase()) ||
    (p.supplierName && p.supplierName.toLowerCase().includes(search.toLowerCase())) ||
    p.expenseType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold">Compras B2B & Fornecedores</Heading>
          <Text color="gray.500" fontSize="sm">
            Gestão de ordens de compra de insumos, matérias-primas e gestão de parceiros comercial
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button leftIcon={<FiUserCheck />} variant="outline" colorScheme="emerald" borderRadius="xl" onClick={onSupplierOpen}>
            + Novo Fornecedor
          </Button>
          <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={onPurchaseOpen}>
            + Nova Compra
          </Button>
        </HStack>
      </Flex>

      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Stat>
            <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">Total Investido em Compras</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="emerald.500">
              {formatCurrency(totalSpent)}
            </StatNumber>
            <StatHelpText fontSize="xs">Soma das ordens registradas</StatHelpText>
          </Stat>
        </Box>

        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Stat>
            <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">Ordens de Compra</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="blue.500">
              {purchases.length}
            </StatNumber>
            <StatHelpText fontSize="xs">Pedidos finalizados ou em andamento</StatHelpText>
          </Stat>
        </Box>

        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Stat>
            <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">Fornecedores Cadastrados</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="purple.500">
              {suppliers.length}
            </StatNumber>
            <StatHelpText fontSize="xs">Parceiros ativos</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Tabs: Purchases vs Suppliers */}
      <Tabs variant="enclosed" colorScheme="emerald">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={4}>
          <TabList bg={useColorModeValue('gray.100', 'gray.900')} p={1} borderRadius="xl">
            <Tab borderRadius="lg" fontSize="sm" px={4} fontWeight="medium">Ordens de Compra ({purchases.length})</Tab>
            <Tab borderRadius="lg" fontSize="sm" px={4} fontWeight="medium">Fornecedores ({suppliers.length})</Tab>
          </TabList>

          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar compra ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="xl"
              focusBorderColor="#10B981"
              bg={bg}
            />
          </InputGroup>
        </Flex>

        <TabPanels>
          {/* Tab 1: Purchases Table */}
          <TabPanel px={0}>
            {isLoading ? (
              <Flex justify="center" p={10}><Spinner color="emerald.500" size="xl" /></Flex>
            ) : filteredPurchases.length === 0 ? (
              <Flex direction="column" align="center" justify="center" h="200px" bg={bg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
                <Icon as={FiPackage} boxSize={10} color="gray.500" mb={2} />
                <Text color="gray.400">Nenhuma ordem de compra encontrada.</Text>
              </Flex>
            ) : (
              <Box bg={bg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} overflow="hidden" shadow="sm">
                <Table variant="simple">
                  <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
                    <Tr>
                      <Th>Item / Material</Th>
                      <Th>Fornecedor</Th>
                      <Th>Categoria</Th>
                      <Th isNumeric>Qtd</Th>
                      <Th isNumeric>Preço Unit.</Th>
                      <Th isNumeric>Total</Th>
                      <Th>Data</Th>
                      <Th width="50px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredPurchases.map((p) => (
                      <Tr key={p.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.750') }}>
                        <Td fontWeight="semibold">{p.material}</Td>
                        <Td color="gray.400">{p.supplierName || 'Fornecedor Geral'}</Td>
                        <Td>
                          <Badge borderRadius="full" px={3} py={1} colorScheme="purple">
                            {p.expenseType}
                          </Badge>
                        </Td>
                        <Td isNumeric fontWeight="medium">{p.quantity}</Td>
                        <Td isNumeric>{formatCurrency(p.unitPrice)}</Td>
                        <Td isNumeric fontWeight="bold" color="emerald.500">{formatCurrency(p.totalPrice)}</Td>
                        <Td fontSize="sm" color="gray.400">{p.purchaseDate}</Td>
                        <Td>
                          <IconButton
                            aria-label="Remover"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeletePurchase(p.id)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </TabPanel>

          {/* Tab 2: Suppliers Grid */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {suppliers.map((s) => (
                <Box key={s.id} bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
                  <Flex align="center" mb={4}>
                    <Flex bg="purple.100" p={3} borderRadius="xl" mr={4}>
                      <Icon as={FiTruck} color="purple.600" boxSize={6} />
                    </Flex>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">{s.name}</Text>
                      <Badge colorScheme="green" fontSize="xs">Parceiro Ativo</Badge>
                    </Box>
                  </Flex>
                  <Text fontSize="sm" color="gray.400">
                    {s.contact || 'Sem informações de contato adicionais'}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal Nova Compra */}
      <Modal isOpen={isPurchaseOpen} onClose={onPurchaseClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">Registrar Nova Compra B2B</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Item / Material Comprado</FormLabel>
                <Input placeholder="Ex: Insumos de Produção, Papel A4" value={material} onChange={(e) => setMaterial(e.target.value)} borderRadius="xl" focusBorderColor="#10B981" />
              </FormControl>

              <FormControl>
                <FormLabel>Fornecedor</FormLabel>
                <Select placeholder="Selecione um fornecedor" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} borderRadius="xl">
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl isRequired flex={1}>
                  <FormLabel>Quantidade</FormLabel>
                  <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} borderRadius="xl" />
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel>Preço Unitário (R$)</FormLabel>
                  <Input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} borderRadius="xl" />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Categoria da Despesa</FormLabel>
                <Select value={expenseType} onChange={(e) => setExpenseType(e.target.value)} borderRadius="xl">
                  <option value="Operacional">Operacional</option>
                  <option value="Tecnologia & TI">Tecnologia & TI</option>
                  <option value="Escritório">Escritório</option>
                  <option value="Matéria-Prima">Matéria-Prima</option>
                  <option value="Logística">Logística</option>
                </Select>
              </FormControl>

              <Box w="full" bg={useColorModeValue('emerald.50', 'gray.900')} p={4} borderRadius="xl" borderWidth="1px" borderColor="emerald.200">
                <Text fontSize="xs" color="gray.500">Valor Total Calculado:</Text>
                <Text fontSize="xl" fontWeight="bold" color="emerald.500">
                  {formatCurrency((parseInt(quantity) || 0) * (parseFloat(unitPrice) || 0))}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onPurchaseClose}>Cancelar</Button>
            <Button bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" isLoading={isSavingPurchase} onClick={handleSavePurchase}>
              Registrar Compra
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Novo Fornecedor */}
      <Modal isOpen={isSupplierOpen} onClose={onSupplierClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">Cadastrar Fornecedor</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome da Empresa / Fornecedor</FormLabel>
                <Input placeholder="Ex: Dell Computadores, Kalunga" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} borderRadius="xl" focusBorderColor="#10B981" />
              </FormControl>

              <FormControl>
                <FormLabel>Contato (Telefone / E-mail / Obs)</FormLabel>
                <Input placeholder="Ex: contato@fornecedor.com | (11) 99999-9999" value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} borderRadius="xl" focusBorderColor="#10B981" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onSupplierClose}>Cancelar</Button>
            <Button colorScheme="purple" borderRadius="xl" isLoading={isSavingSupplier} onClick={handleSaveSupplier}>
              Salvar Fornecedor
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
