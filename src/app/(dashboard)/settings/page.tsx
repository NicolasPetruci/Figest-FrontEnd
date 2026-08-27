'use client';

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Switch,
  Select,
  useColorModeValue,
  useToast,
  Divider,
  SimpleGrid,
  Avatar,
  Icon,
  Badge,
  useColorMode,
} from '@chakra-ui/react';
import { FiUser, FiLock, FiGlobe, FiMoon, FiBell, FiShield, FiSave } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';
import { useI18nStore } from '@/stores/i18nStore';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { language, toggleLanguage } = useI18nStore();
  const { colorMode, toggleColorMode } = useColorMode();

  const [name, setName] = useState(user?.name || 'Admin');
  const [email, setEmail] = useState(user?.email || 'admin@figest.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Configurações salvas com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 600);
  };

  return (
    <Box maxW="5xl" mx="auto">
      <Heading size="lg" mb={2}>Configurações do Sistema</Heading>
      <Text color="gray.500" mb={8}>Gerencie suas preferências de conta, segurança e personalização do sistema</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        {/* Left Nav / Summary Card */}
        <Box bg={cardBg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm" h="fit-content">
          <VStack spacing={4} align="center" textAlign="center">
            <Avatar size="2xl" name={name} bg="#10B981" color="white" />
            <Box>
              <Heading size="md">{name}</Heading>
              <Text fontSize="sm" color="gray.500">{email}</Text>
              <Badge colorScheme="emerald" mt={2} borderRadius="full" px={3} py={1}>
                Administrador
              </Badge>
            </Box>
          </VStack>

          <Divider my={6} />

          <VStack align="stretch" spacing={3}>
            <HStack color="emerald.500" fontWeight="semibold" fontSize="sm">
              <Icon as={FiUser} />
              <Text>Perfil do Usuário</Text>
            </HStack>
            <HStack color="gray.500" fontSize="sm">
              <Icon as={FiShield} />
              <Text>Segurança & Acesso</Text>
            </HStack>
            <HStack color="gray.500" fontSize="sm">
              <Icon as={FiGlobe} />
              <Text>Regiões & Preferências</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Right Settings Form */}
        <Box gridColumn={{ md: 'span 2' }}>
          <form onSubmit={handleSaveProfile}>
            <VStack spacing={6} align="stretch">
              {/* Profile Section */}
              <Box bg={cardBg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
                <HStack mb={4}>
                  <Icon as={FiUser} color="#10B981" boxSize={5} />
                  <Heading size="md" fontSize="lg">Informações Pessoais</Heading>
                </HStack>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Nome Completo</FormLabel>
                    <Input value={name} onChange={(e) => setName(e.target.value)} borderRadius="xl" focusBorderColor="#10B981" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Endereço de E-mail</FormLabel>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} borderRadius="xl" focusBorderColor="#10B981" />
                  </FormControl>
                </VStack>
              </Box>

              {/* Preferences Section */}
              <Box bg={cardBg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
                <HStack mb={4}>
                  <Icon as={FiGlobe} color="#3B82F6" boxSize={5} />
                  <Heading size="md" fontSize="lg">Preferências & Tema</Heading>
                </HStack>
                <VStack spacing={4} align="stretch">
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <FormLabel mb={0} fontSize="sm" fontWeight="medium">Modo Escuro (Dark Mode)</FormLabel>
                      <Text fontSize="xs" color="gray.500">Alternar entre o tema escuro e claro</Text>
                    </Box>
                    <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} colorScheme="emerald" size="lg" />
                  </FormControl>

                  <Divider />

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <FormLabel mb={0} fontSize="sm" fontWeight="medium">Idioma da Interface</FormLabel>
                      <Text fontSize="xs" color="gray.500">Português (PT-BR) / Inglês (EN)</Text>
                    </Box>
                    <Button size="sm" variant="outline" onClick={toggleLanguage} borderRadius="xl">
                      {language === 'pt' ? 'Português (PT)' : 'English (EN)'}
                    </Button>
                  </FormControl>

                  <Divider />

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Moeda Padrão</FormLabel>
                    <Select value={currency} onChange={(e) => setCurrency(e.target.value)} borderRadius="xl">
                      <option value="BRL">Real Brasileiro (R$ - BRL)</option>
                      <option value="USD">Dólar Americano ($ - USD)</option>
                      <option value="EUR">Euro (€ - EUR)</option>
                    </Select>
                  </FormControl>
                </VStack>
              </Box>

              {/* Security Section */}
              <Box bg={cardBg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
                <HStack mb={4}>
                  <Icon as={FiLock} color="#EF4444" boxSize={5} />
                  <Heading size="md" fontSize="lg">Alterar Senha</Heading>
                </HStack>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Senha Atual</FormLabel>
                    <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} borderRadius="xl" focusBorderColor="#10B981" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Nova Senha</FormLabel>
                    <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} borderRadius="xl" focusBorderColor="#10B981" />
                  </FormControl>
                </VStack>
              </Box>

              {/* Submit Button */}
              <Flex justify="end">
                <Button
                  type="submit"
                  leftIcon={<FiSave />}
                  bg="#10B981"
                  color="white"
                  _hover={{ bg: '#059669' }}
                  size="lg"
                  borderRadius="xl"
                  isLoading={isSaving}
                >
                  Salvar Alterações
                </Button>
              </Flex>
            </VStack>
          </form>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
