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
  TabPanels,
  Tab,
  TabPanel,
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
  Tag,
  TagLabel,
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
  FiLayers,
} from 'react-icons/fi';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
}

interface CustomTag {
  id: string;
  name: string;
  color: string;
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
  '#8A05BE', // Nubank Purple
  '#EC0000', // Santander Red
  '#21C25E', // PicPay Green
];

const DEFAULT_SUBTAGS: CustomTag[] = [
  { id: 't-1', name: 'Nubank', color: '#8A05BE' },
  { id: 't-2', name: 'Santander', color: '#EC0000' },
  { id: 't-3', name: 'PicPay', color: '#21C25E' },
  { id: 't-4', name: 'Itaú', color: '#EC7000' },
  { id: 't-5', name: 'BancoDoBrasil', color: '#FFCC00' },
  { id: 't-6', name: 'Ifood', color: '#EA1D2C' },
  { id: 't-7', name: 'Uber', color: '#000000' },
  { id: 't-8', name: 'Mercado', color: '#3B82F6' },
  { id: 't-9', name: 'FaturaCartão', color: '#8B5CF6' },
  { id: 't-10', name: 'Viagem', color: '#06B6D4' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subtags, setSubtags] = useState<CustomTag[]>(DEFAULT_SUBTAGS);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  
  // Modal State for Category
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Modal State for Subtag
  const { isOpen: isTagOpen, onOpen: onTagOpen, onClose: onTagClose } = useDisclosure();
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#8B5CF6');

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
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories from backend', error);
      setCategories([]);
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
      toast({ title: 'Nome obrigatório', status: 'warning', duration: 3000 });
      return;
    }

    setIsSaving(true);
    try {
      const payload = { name, type, color, icon: iconName };
      if (editingCategory) {
        await api.patch(`/finance/categories/${editingCategory.id}`, payload);
        toast({ title: 'Categoria atualizada!', status: 'success', duration: 3000 });
      } else {
        await api.post('/finance/categories', payload);
        toast({ title: 'Categoria criada com sucesso!', status: 'success', duration: 3000 });
      }
      onClose();
      fetchCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSubtag = () => {
    if (!tagName.trim()) {
      toast({ title: 'Informe o nome da tag', status: 'warning', duration: 3000 });
      return;
    }

    const cleanTag = tagName.replace(/^#/, '').trim();
    setSubtags(prev => [...prev, { id: `tag-${Date.now()}`, name: cleanTag, color: tagColor }]);
    toast({ title: `Tag #${cleanTag} criada!`, status: 'success', duration: 3000 });
    onTagClose();
    setTagName('');
  };

  const handleDeleteCategory = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/finance/categories/${deleteId}`);
      toast({ title: 'Categoria removida', status: 'success', duration: 3000 });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    } finally {
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteSubtag = (id: string) => {
    setSubtags(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Subtag removida', status: 'info', duration: 3000 });
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
          <Heading size="lg" fontWeight="bold">Categorias & Subtags</Heading>
          <Text color="gray.500" fontSize="sm">
            Gerencie categorias principais e subtags por banco (Nubank, Santander, PicPay)
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button leftIcon={<FiTag />} colorScheme="purple" borderRadius="xl" onClick={onTagOpen}>
            Criar Subtag de Banco
          </Button>
          <Button leftIcon={<FiPlus />} bg="#10B981" color="white" _hover={{ bg: '#059669' }} borderRadius="xl" onClick={handleOpenCreateModal}>
            Nova Categoria
          </Button>
        </HStack>
      </Flex>

      {/* Tabs */}
      <Tabs variant="soft-rounded" colorScheme="emerald" mb={6}>
        <TabList bg={cardBg} p={1.5} borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
          <Tab borderRadius="xl" fontWeight="bold" fontSize="sm">
            <Icon as={FiLayers} mr={2} /> Categorias Principais ({categories.length})
          </Tab>
          <Tab borderRadius="xl" fontWeight="bold" fontSize="sm">
            <Icon as={FiTag} mr={2} /> Subtags & Tags de Banco ({subtags.length})
          </Tab>
        </TabList>

        <TabPanels mt={4}>
          {/* TAB 1: CATEGORIAS */}
          <TabPanel p={0}>
            {/* Filters and Search */}
            <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="center" gap={4} mb={6}>
              <HStack spacing={2}>
                <Button size="sm" borderRadius="xl" variant={activeTab === 'ALL' ? 'solid' : 'ghost'} colorScheme="emerald" onClick={() => setActiveTab('ALL')}>
                  Todas ({categories.length})
                </Button>
                <Button size="sm" borderRadius="xl" variant={activeTab === 'EXPENSE' ? 'solid' : 'ghost'} colorScheme="red" onClick={() => setActiveTab('EXPENSE')}>
                  Despesas
                </Button>
                <Button size="sm" borderRadius="xl" variant={activeTab === 'INCOME' ? 'solid' : 'ghost'} colorScheme="green" onClick={() => setActiveTab('INCOME')}>
                  Receitas
                </Button>
              </HStack>

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
                          bg={`${cat.color || '#10B981'}20`}
                          style={{ color: cat.color || '#10B981' }}
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
          </TabPanel>

          {/* TAB 2: SUBTAGS & TAGS DE BANCOS */}
          <TabPanel p={0}>
            <Box bg={cardBg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
              <Text fontWeight="bold" fontSize="lg" mb={2}>Subtags & Tags por Banco</Text>
              <Text fontSize="sm" color="gray.500" mb={6}>
                Utilize estas subtags para classificar transações específicas no seu extrato ou dashboard
              </Text>

              <Flex wrap="wrap" gap={3}>
                {subtags.map(t => (
                  <Tag 
                    key={t.id} 
                    size="lg" 
                    borderRadius="full" 
                    p={3}
                    bg={`${t.color}25`} 
                    style={{ color: t.color, borderColor: t.color }}
                    borderWidth="1px"
                    boxShadow="xs"
                  >
                    <TagLabel fontWeight="bold" fontSize="sm">#{t.name}</TagLabel>
                    <IconButton
                      aria-label="Excluir tag"
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      ml={2}
                      onClick={() => handleDeleteSubtag(t.id)}
                    />
                  </Tag>
                ))}
              </Flex>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal Nova Subtag */}
      <Modal isOpen={isTagOpen} onClose={onTagClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader fontWeight="bold">Criar Nova Subtag / Tag de Banco</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome da Subtag</FormLabel>
                <Input 
                  placeholder="Ex: Nubank, Santander, Ifood, FaturaCartão"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  borderRadius="xl"
                  focusBorderColor="#10B981"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Cor da Tag</FormLabel>
                <HStack spacing={3}>
                  <Input 
                    type="color" 
                    value={tagColor} 
                    onChange={(e) => setTagColor(e.target.value)} 
                    w="60px" 
                    h="40px" 
                    p={1} 
                    borderRadius="lg" 
                  />
                  <Text fontSize="sm" color="gray.500">{tagColor}</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onTagClose}>Cancelar</Button>
            <Button colorScheme="purple" borderRadius="xl" onClick={handleSaveSubtag}>
              Salvar Subtag
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
