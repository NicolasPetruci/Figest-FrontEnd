'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  useColorModeValue,
  Heading,
  Skeleton,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface SummaryData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  expensesByCategory: { category: string; amount: number }[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const response = await api.get(`/finance/transactions/summary?month=${month}&year=${year}`);
        
        const raw = response.data || {};
        const catArray = raw.expensesByCategory
          ? Object.entries(raw.expensesByCategory).map(([category, amount]) => ({
              category,
              amount: Number(amount),
            }))
          : [];

        setData({
          totalBalance: Number(raw.balance) || 0,
          totalIncome: Number(raw.totalIncome) || 0,
          totalExpense: Number(raw.totalExpense) || 0,
          expensesByCategory: catArray,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard summary from backend:', error);
        setData({
          totalBalance: 0,
          totalIncome: 0,
          totalExpense: 0,
          expensesByCategory: [],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>Visão Geral do Painel</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={2}>
            Saldo Total Consolidado
          </Text>
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="2xl" fontWeight="bold" color={(data?.totalBalance || 0) >= 0 ? 'emerald.500' : 'red.500'}>
              {formatCurrency(data?.totalBalance || 0)}
            </Text>
          </Skeleton>
        </Box>

        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={2}>
            Receitas do Mês
          </Text>
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {formatCurrency(data?.totalIncome || 0)}
            </Text>
          </Skeleton>
        </Box>

        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={2}>
            Despesas do Mês
          </Text>
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              {formatCurrency(data?.totalExpense || 0)}
            </Text>
          </Skeleton>
        </Box>
      </SimpleGrid>

      <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Text fontWeight="semibold" fontSize="lg" mb={4}>Distribuição de Despesas por Categoria</Text>
        <Skeleton isLoaded={!isLoading} minH="250px">
          {data && data.expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="category"
                >
                  {data.expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Flex h="200px" align="center" justify="center" direction="column">
              <Text color="gray.400" fontSize="md">Nenhum lançamento registrado no mês atual.</Text>
              <Text color="gray.500" fontSize="sm" mt={1}>Adicione uma transação ou importe um extrato .OFX para visualizar gráficos.</Text>
            </Flex>
          )}
        </Skeleton>
      </Box>
    </Box>
  );
}
