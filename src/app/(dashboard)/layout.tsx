'use client';

import React from 'react';
import { Box, Flex, VStack, Text, useColorModeValue, Icon, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiDollarSign, FiCreditCard, FiPieChart, FiShoppingBag, FiFileText, FiSettings } from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';

import { useI18nStore } from '@/stores/i18nStore';

const NAV_ITEMS = {
  pt: [
    { name: 'Início', icon: FiHome, path: '/' },
    { name: 'Transações', icon: FiDollarSign, path: '/transactions' },
    { name: 'Bancos & Contas', icon: FiCreditCard, path: '/accounts' },
    { name: 'Categorias', icon: FiPieChart, path: '/categories' },
    { name: 'Compras', icon: FiShoppingBag, path: '/purchases' },
    { name: 'Relatórios', icon: FiFileText, path: '/reports' },
    { name: 'Ajustes', icon: FiSettings, path: '/settings' },
  ],
  en: [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Transactions', icon: FiDollarSign, path: '/transactions' },
    { name: 'Banks & Accounts', icon: FiCreditCard, path: '/accounts' },
    { name: 'Categories', icon: FiPieChart, path: '/categories' },
    { name: 'Purchases', icon: FiShoppingBag, path: '/purchases' },
    { name: 'Reports', icon: FiFileText, path: '/reports' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ]
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, toggleLanguage } = useI18nStore();
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('emerald.50', 'emerald.900');
  const activeColor = useColorModeValue('emerald.600', 'emerald.200');
  const defaultColor = useColorModeValue('gray.600', 'gray.400');
  const currentNav = NAV_ITEMS[language];

  return (
    <ProtectedRoute>
      <Flex h="100vh" bg={useColorModeValue('gray.50', 'gray.800')}>
        {/* Sidebar */}
        <Box
          w="64"
          bg={bg}
          borderRight="1px"
          borderColor={borderColor}
          py={8}
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
        >
          <VStack spacing={4} align="stretch" px={4} flex="1">
            <Text fontSize="2xl" fontWeight="bold" color="emerald.500" mb={8} px={4}>
              Figest
            </Text>
            {currentNav.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
              return (
                <ChakraLink
                  as={NextLink}
                  key={item.name}
                  href={item.path}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Flex
                    align="center"
                    p={3}
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    bg={isActive ? activeBg : 'transparent'}
                    color={isActive ? activeColor : defaultColor}
                    _hover={{
                      bg: activeBg,
                      color: activeColor,
                    }}
                  >
                    <Icon as={item.icon} boxSize={5} mr={4} />
                    <Text fontWeight={isActive ? 'semibold' : 'medium'}>{item.name}</Text>
                  </Flex>
                </ChakraLink>
              );
            })}
          </VStack>
          <Box px={8} mt="auto">
            <Flex 
              align="center" 
              cursor="pointer" 
              color={defaultColor} 
              _hover={{ color: activeColor }}
              onClick={toggleLanguage}
            >
              <Text fontWeight="medium" fontSize="sm">
                {language === 'pt' ? 'Mudar para Inglês (EN)' : 'Switch to Portuguese (PT)'}
              </Text>
            </Flex>
          </Box>
        </Box>

        {/* Main Content */}
        <Box flex="1" overflowY="auto" p={8}>
          {children}
        </Box>
      </Flex>
    </ProtectedRoute>
  );
}
