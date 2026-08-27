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
  Select,
  HStack,
  Badge,
  Tag,
  TagLabel,
  Progress,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface SummaryData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  expensesByCategory: { category: string; amount: number }[];
  expensesByBank: { bank: string; amount: number }[];
  expensesBySubtag: { subtag: string; amount: number }[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [periodMode, setPeriodMode] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      let query = `/finance/transactions/summary?period=${periodMode}&year=${selectedYear}`;
      if (periodMode === 'MONTHLY') {
        query += `&month=${selectedMonth}`;
      }
      const response = await api.get(query);
      
      const raw = response.data || {};
      const catArray = raw.expensesByCategory
        ? Object.entries(raw.expensesByCategory).map(([category, amount]) => ({
            category,
            amount: Number(amount),
          }))
        : [];

      const bankArray = raw.expensesByBank
        ? Object.entries(raw.expensesByBank).map(([bank, amount]) => ({
            bank,
            amount: Number(amount),
          }))
        : [];

      const subtagArray = raw.expensesBySubtag
        ? Object.entries(raw.expensesBySubtag).map(([subtag, amount]) => ({
            subtag,
            amount: Number(amount),
          }))
        : [];

      setData({
        totalBalance: Number(raw.balance) || 0,
        totalIncome: Number(raw.totalIncome) || 0,
        totalExpense: Number(raw.totalExpense) || 0,
        expensesByCategory: catArray,
        expensesByBank: bankArray,
        expensesBySubtag: subtagArray,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard summary from backend:', error);
      setData({
        totalBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        expensesByCategory: [],
        expensesByBank: [],
        expensesBySubtag: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [periodMode, selectedMonth, selectedYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Box>
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold">Visão Geral do Painel</Heading>
          <Text color="gray.500" fontSize="sm">Acompanhe seus saldos por banco, despesas por categoria e subtags</Text>
        </Box>

        {/* Filter Period Bar */}
        <HStack spacing={3}>
          <Select 
            value={periodMode} 
            onChange={(e) => setPeriodMode(e.target.value as 'MONTHLY' | 'ANNUAL')} 
            w="160px" 
            borderRadius="xl"
            bg={bg}
          >
            <option value="MONTHLY">Visão Mensal</option>
            <option value="ANNUAL">Visão Anual</option>
          </Select>

          {periodMode === 'MONTHLY' && (
            <Select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              w="140px" 
              borderRadius="xl"
              bg={bg}
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
            w="110px" 
            borderRadius="xl"
            bg={bg}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </Select>
        </HStack>
      </Flex>
      
      {/* Stat Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={2}>
            Saldo Total Consolidado
          </Text>
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="3xl" fontWeight="bold" color={(data?.totalBalance || 0) >= 0 ? 'emerald.500' : 'red.500'}>
              {formatCurrency(data?.totalBalance || 0)}
            </Text>
          </Skeleton>
        </Box>

        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={2}>
            Receitas ({periodMode === 'MONTHLY' ? 'Mês' : 'Ano'})
          </Text>
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="3xl" fontWeight="bold" color="blue.500">
              {formatCurrency(data?.totalIncome || 0)}
            </Text>
          </Skeleton>
        </Box>

        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={2}>
            Despesas ({periodMode === 'MONTHLY' ? 'Mês' : 'Ano'})
          </Text>
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="3xl" fontWeight="bold" color="red.500">
              {formatCurrency(data?.totalExpense || 0)}
            </Text>
          </Skeleton>
        </Box>
      </SimpleGrid>

      {/* Grid 2 Columns */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Expenses by Category */}
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text fontWeight="semibold" fontSize="lg" mb={4}>Despesas por Categoria</Text>
          <Skeleton isLoaded={!isLoading} minH="240px">
            {data && data.expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
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
                <Text color="gray.400">Nenhum lançamento no período selecionado.</Text>
              </Flex>
            )}
          </Skeleton>
        </Box>

        {/* Expenses by Bank */}
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text fontWeight="semibold" fontSize="lg" mb={4}>Despesas por Banco / Conta</Text>
          <Skeleton isLoaded={!isLoading} minH="240px">
            {data && data.expensesByBank.length > 0 ? (
              <Box py={2}>
                {data.expensesByBank.map((b, idx) => {
                  const percent = data.totalExpense > 0 ? (b.amount / data.totalExpense) * 100 : 0;
                  return (
                    <Box key={b.bank} mb={4}>
                      <Flex justify="space-between" mb={1} fontSize="sm">
                        <Badge colorScheme="blue" borderRadius="md" px={2}>{b.bank}</Badge>
                        <Text fontWeight="bold">{formatCurrency(b.amount)} ({percent.toFixed(1)}%)</Text>
                      </Flex>
                      <Progress value={percent} colorScheme="blue" borderRadius="full" size="sm" />
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Flex h="200px" align="center" justify="center">
                <Text color="gray.400">Nenhum gasto por banco registrado no período.</Text>
              </Flex>
            )}
          </Skeleton>
        </Box>
      </SimpleGrid>

      {/* Expenses by Subtag */}
      {data && data.expensesBySubtag.length > 0 && (
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
          <Text fontWeight="semibold" fontSize="lg" mb={4}>Despesas por Subtags de Categoria</Text>
          <HStack spacing={4} wrap="wrap">
            {data.expensesBySubtag.map(s => (
              <Tag key={s.subtag} size="lg" colorScheme="purple" borderRadius="full" p={3}>
                <TagLabel fontWeight="bold">#{s.subtag}: {formatCurrency(s.amount)}</TagLabel>
              </Tag>
            ))}
          </HStack>
        </Box>
      )}
    </Box>
  );
}
