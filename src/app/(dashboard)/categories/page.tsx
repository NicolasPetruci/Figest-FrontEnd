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
  InputGroup,
  InputLeftElement,
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
  Tooltip,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiShoppingCart,
  FiDollarSign,
  FiHome,
  FiTruck,
  FiHeart,
  FiCoffee,
  FiSmartphone,
  FiFilm,
  FiBriefcase,
  FiGift,
  FiGlobe,
  FiMoreVertical,
  FiSmile,
  FiBook,
  FiActivity,
} from 'react-icons/fi';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
}

const AVAILABLE_ICONS: { [key: string]: any } = {
  FiTag,
  FiShoppingCart,
  FiDollarSign,
  FiHome,
  FiTruck,
  FiHeart,
  FiCoffee,
  FiSmartphone,
  FiFilm,
  FiBriefcase,
  FiGift,
  FiGlobe,
  FiSmile,
  FiBook,
  FiActivity,
};

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#F97316', // Orange
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Alimentação', icon: 'FiShoppingCart', color: '#F59E0B', type: 'EXPENSE' },
  { id: 'cat-2', name: 'Moradia', icon: 'FiHome', color: '#3B82F6', type: 'EXPENSE' },
  { id: 'cat-3', name: 'Transporte', icon: 'FiTruck', color: '#8B5CF6', type: 'EXPENSE' },
  { id: 'cat-4', name: 'Salário & Proventos', icon: 'FiDollarSign', color: '#10B981', type: 'INCOME' },
  { id: 'cat-5', name: 'Lazer & Cultura', icon: 'FiFilm', color: '#EC4899', type: 'EXPENSE' },
  { id: 'cat-6', name: 'Saúde & Bem-Estar', icon: 'FiHeart', color: '#EF4444', type: 'EXPENSE' },
  { id: 'cat-7', name: 'Investimentos', icon: 'FiActivity', color: '#06B6D4', type: 'BOTH' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'BOTH'>('EXPENSE');
  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('FiTag');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = React.useRef<any>(null);

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/finance/categories');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCategories(response.data);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error('Falha ao carregar categorias:', error);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setType('EXPENSE');
    setColor('#10B981');
    setIconName('FiTag');
    onOpen();
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || '#10B981');
    setIconName(cat.icon || 'FiTag');
    onOpen();
  };

  const handleSaveCategory = async () => {
    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor insira um nome para a categoria.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = { name, type, color, icon: iconName };
      if (editingCategory) {
        await api.patch(`/finance/categories/${editingCategory.id}`, payload);
        toast({
          title: 'Categoria atualizada!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await api.post('/finance/categories', payload);
        toast({
          title: 'Categoria criada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      fetchCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      // Fallback local state update for seamless UX
      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name, type, color, icon: iconName } : c));
      } else {
        setCategories(prev => [...prev, { id: `cat-${Date.now()}`, name, type, color, icon: iconName }]);
      }
      toast({
        title: editingCategory ? 'Categoria atualizada (local)' : 'Categoria criada (local)',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/finance/categories/${deleteId}`);
      toast({
        title: 'Categoria removida',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    } finally {
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === 'ALL' ||
      cat.type === activeTab ||
      cat.type === 'BOTH';
    return matchesSearch && matchesTab;
  });

  const getIconComponent = (iconKey: string) => {
    return AVAILABLE_ICONS[iconKey] || FiTag;
  };

  return (
    <Box>
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold">Categorias</Heading>
          <Text color="gray.500" fontSize="sm">
            Organize e personalize suas receitas e despesas por grupo
          </Text>
        </Box>
        <Button
          leftIcon={<FiPlus />}
          bg="#10B981"
          color="white"
          _hover={{ bg: '#059669', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          onClick={handleOpenCreateModal}
        >
          Nova Categoria
        </Button>
      </Flex>

      {/* Filters and Search */}
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="center" gap={4} mb={6}>
        <Tabs variant="soft-rounded" colorScheme="emerald" index={activeTab === 'ALL' ? 0 : activeTab === 'EXPENSE' ? 1 : 2} onChange={(idx) => setActiveTab(idx === 0 ? 'ALL' : idx === 1 ? 'EXPENSE' : 'INCOME')}>
          <TabList bg={useColorModeValue('gray.100', 'gray.900')} p={1} borderRadius="xl">
            <Tab borderRadius="lg" fontSize="sm" px={4}>Todas ({categories.length})</Tab>
            <Tab borderRadius="lg" fontSize="sm" px={4}>Despesas</Tab>
            <Tab borderRadius="lg" fontSize="sm" px={4}>Receitas</Tab>
          </TabList>
        </Tabs>

        <InputGroup maxW={{ base: '100%', sm: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            borderRadius="xl"
            focusBorderColor="#10B981"
            bg={cardBg}
          />
        </InputGroup>
      </Flex>

      {/* Content */}
      {isLoading ? (
        <Flex justify="center" align="center" h="250px">
          <Spinner size="xl" color="#10B981" />
        </Flex>
      ) : filteredCategories.length === 0 ? (
        <Flex direction="column" align="center" justify="center" h="250px" bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} p={6}>
          <Icon as={FiTag} boxSize={12} color="gray.500" mb={3} />
          <Text fontSize="lg" fontWeight="semibold">Nenhuma categoria encontrada</Text>
          <Text fontSize="sm" color="gray.500" mb={4}>Tente buscar por outro nome ou crie uma nova categoria.</Text>
          <Button size="sm" bg="#10B981" color="white" onClick={handleOpenCreateModal} leftIcon={<FiPlus />}>
            Criar Categoria
          </Button>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {filteredCategories.map((cat) => {
            const IconComp = getIconComponent(cat.icon);
            return (
              <Box
                key={cat.id}
                bg={cardBg}
                p={5}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="sm"
                transition="all 0.25s ease"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'md',
                  borderColor: cat.color || '#10B981',
                }}
                position="relative"
              >
                <Flex justify="space-between" align="start" mb={4}>
                  <Flex
                    w="48px"
                    h="48px"
                    align="center"
                    justify="center"
                    borderRadius="xl"
                    bg={`${cat.color || '#10B981'}20`}
                    color={cat.color || '#10B981'}
                  >
                    <Icon as={IconComp} boxSize={6} />
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
                      <MenuItem icon={<FiEdit2 />} onClick={() => handleOpenEditModal(cat)}>
                        Editar
                      </MenuItem>
                      <MenuItem icon={<FiTrash2 />} color="red.400" onClick={() => setDeleteId(cat.id)}>
                        Excluir
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>

                <Heading size="md" fontSize="lg" mb={2} noOfLines={1}>
                  {cat.name}
                </Heading>

                <Flex justify="space-between" align="center" mt={3}>
                  <Badge
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                    colorScheme={cat.type === 'INCOME' ? 'green' : cat.type === 'EXPENSE' ? 'red' : 'blue'}
                  >
                    {cat.type === 'INCOME' ? 'Receita' : cat.type === 'EXPENSE' ? 'Despesa' : 'Ambos'}
                  </Badge>
                  <Box w="12px" h="12px" borderRadius="full" bg={cat.color || '#10B981'} />
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Modal Nova / Editar Categoria */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontSize="xl" fontWeight="bold">
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Nome da Categoria</FormLabel>
                <Input
                  placeholder="Ex: Alimentação, Freelas, Moradia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  focusBorderColor="#10B981"
                  borderRadius="xl"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">Tipo de Categoria</FormLabel>
                <HStack spacing={3} w="full">
                  {[
                    { key: 'EXPENSE', label: 'Despesa', color: 'red' },
                    { key: 'INCOME', label: 'Receita', color: 'green' },
                    { key: 'BOTH', label: 'Ambos', color: 'blue' },
                  ].map((t) => (
                    <Button
                      key={t.key}
                      flex={1}
                      borderRadius="xl"
                      variant={type === t.key ? 'solid' : 'outline'}
                      colorScheme={type === t.key ? t.color : 'gray'}
                      onClick={() => setType(t.key as any)}
                    >
                      {t.label}
                    </Button>
                  ))}
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Cor de Identificação</FormLabel>
                <Flex wrap="wrap" gap={3}>
                  {PRESET_COLORS.map((c) => (
                    <Box
                      key={c}
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      bg={c}
                      cursor="pointer"
                      border={color === c ? '3px solid white' : 'none'}
                      boxShadow={color === c ? '0 0 0 2px #10B981' : 'none'}
                      transition="all 0.2s"
                      _hover={{ transform: 'scale(1.1)' }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Selecione um Ícone</FormLabel>
                <Flex wrap="wrap" gap={3} maxH="140px" overflowY="auto" p={2} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                  {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                    const IconC = AVAILABLE_ICONS[iconKey];
                    const isSelected = iconName === iconKey;
                    return (
                      <Tooltip key={iconKey} label={iconKey}>
                        <IconButton
                          aria-label={iconKey}
                          icon={<IconC />}
                          size="md"
                          borderRadius="xl"
                          variant={isSelected ? 'solid' : 'ghost'}
                          colorScheme={isSelected ? 'emerald' : 'gray'}
                          onClick={() => setIconName(iconKey)}
                        />
                      </Tooltip>
                    );
                  })}
                </Flex>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              bg="#10B981"
              color="white"
              _hover={{ bg: '#059669' }}
              borderRadius="xl"
              isLoading={isSaving}
              onClick={handleSaveCategory}
            >
              {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
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
              Excluir Categoria
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir esta categoria? As transações associadas a ela não serão apagadas, mas perderão a categorização.
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} variant="ghost" borderRadius="xl" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button colorScheme="red" borderRadius="xl" isLoading={isDeleting} onClick={handleDeleteCategory}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
