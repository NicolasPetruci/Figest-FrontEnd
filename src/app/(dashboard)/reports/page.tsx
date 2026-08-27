'use client';

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  Icon,
  useToast,
  Select,
  HStack,
  VStack,
  Badge,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  FiDownload,
  FiFileText,
  FiBarChart2,
  FiPieChart,
  FiCheckCircle,
  FiCalendar,
  FiImage,
} from 'react-icons/fi';
import { api } from '@/lib/api';

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('08');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingChart, setIsDownloadingChart] = useState(false);

  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const triggerBlobDownload = (data: BlobPart, filename: string, mimeType: string) => {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = async () => {
    setIsDownloadingCSV(true);
    try {
      const response = await api.get('/reports/exports/csv', { responseType: 'blob' });
      triggerBlobDownload(response.data, `transacoes_${selectedMonth}_${selectedYear}.csv`, 'text/csv');
      toast({
        title: 'Relatório CSV exportado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao baixar CSV:', error);
      toast({
        title: 'Falha ao baixar CSV',
        description: 'Verifique se o serviço de relatórios está online.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const response = await api.get('/reports/exports/pdf', { responseType: 'blob' });
      triggerBlobDownload(response.data, `relatorio_consolidado_${selectedMonth}_${selectedYear}.pdf`, 'application/pdf');
      toast({
        title: 'Relatório PDF gerado e baixado!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        title: 'Falha ao baixar PDF',
        description: 'Verifique se o serviço de relatórios está online.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadChart = async () => {
    setIsDownloadingChart(true);
    try {
      const response = await api.get('/reports/exports/chart', { responseType: 'blob' });
      triggerBlobDownload(response.data, `grafico_despesas_${selectedMonth}_${selectedYear}.png`, 'image/png');
      toast({
        title: 'Gráfico exportado em imagem PNG!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao baixar gráfico:', error);
      toast({
        title: 'Falha ao baixar gráfico',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloadingChart(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold">Relatórios & Inteligência Financeira</Heading>
          <Text color="gray.500" fontSize="sm">
            Exporte demonstrativos completos em PDF, planilhas CSV e dados analíticos
          </Text>
        </Box>

        <HStack spacing={3}>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} maxW="120px" borderRadius="xl" bg={bg}>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </Select>
          <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} maxW="100px" borderRadius="xl" bg={bg}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </Select>
        </HStack>
      </Flex>

      {/* Main Export Grid */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {/* PDF Card */}
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm" transition="all 0.2s" _hover={{ boxShadow: 'md' }}>
          <Flex align="center" mb={4}>
            <Flex bg="emerald.100" p={3} borderRadius="xl" mr={4}>
              <Icon as={FiFileText} color="emerald.600" boxSize={6} />
            </Flex>
            <Box>
              <Text fontWeight="bold" fontSize="lg">Demonstrativo PDF</Text>
              <Badge colorScheme="green" fontSize="xs">Completo & Oficial</Badge>
            </Box>
          </Flex>
          <Text fontSize="sm" color="gray.500" mb={6}>
            Relatório impresso pronto com balanço de entradas, saídas e detalhamento por categoria.
          </Text>
          <Button
            leftIcon={<FiDownload />}
            bg="#10B981"
            color="white"
            _hover={{ bg: '#059669' }}
            w="full"
            borderRadius="xl"
            isLoading={isDownloadingPDF}
            onClick={handleDownloadPDF}
          >
            Baixar PDF Oficial
          </Button>
        </Box>

        {/* CSV Card */}
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm" transition="all 0.2s" _hover={{ boxShadow: 'md' }}>
          <Flex align="center" mb={4}>
            <Flex bg="blue.100" p={3} borderRadius="xl" mr={4}>
              <Icon as={FiBarChart2} color="blue.600" boxSize={6} />
            </Flex>
            <Box>
              <Text fontWeight="bold" fontSize="lg">Exportação CSV</Text>
              <Badge colorScheme="blue" fontSize="xs">Excel / Google Sheets</Badge>
            </Box>
          </Flex>
          <Text fontSize="sm" color="gray.500" mb={6}>
            Tabela completa com todos os lançamentos brutos do período para conciliação contábil.
          </Text>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            variant="outline"
            w="full"
            borderRadius="xl"
            isLoading={isDownloadingCSV}
            onClick={handleDownloadCSV}
          >
            Baixar Planilha CSV
          </Button>
        </Box>

        {/* Chart Image Card */}
        <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm" transition="all 0.2s" _hover={{ boxShadow: 'md' }}>
          <Flex align="center" mb={4}>
            <Flex bg="purple.100" p={3} borderRadius="xl" mr={4}>
              <Icon as={FiImage} color="purple.600" boxSize={6} />
            </Flex>
            <Box>
              <Text fontWeight="bold" fontSize="lg">Gráfico em Imagem</Text>
              <Badge colorScheme="purple" fontSize="xs">PNG em Alta Resolução</Badge>
            </Box>
          </Flex>
          <Text fontSize="sm" color="gray.500" mb={6}>
            Visualização gráfica das despesas gerada dinamicamente para apresentações e relatórios de gestão.
          </Text>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="purple"
            variant="outline"
            w="full"
            borderRadius="xl"
            isLoading={isDownloadingChart}
            onClick={handleDownloadChart}
          >
            Baixar Gráfico PNG
          </Button>
        </Box>
      </SimpleGrid>

      {/* Report Summary Preview */}
      <Box bg={bg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Heading size="md" mb={4}>Resumo Executivo do Período Selecionado ({selectedMonth}/{selectedYear})</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6}>
          <Box p={4} borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Status de Processamento</StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="emerald.500">
                Pronto p/ Exportação
              </StatNumber>
              <StatHelpText fontSize="xs">Dados sincronizados</StatHelpText>
            </Stat>
          </Box>
          <Box p={4} borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Formato dos Registros</StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold">
                Padrão UTF-8
              </StatNumber>
              <StatHelpText fontSize="xs">Compatível com Excel</StatHelpText>
            </Stat>
          </Box>
          <Box p={4} borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Motor de Relatórios</StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="blue.500">
                FastAPI + Pandas
              </StatNumber>
              <StatHelpText fontSize="xs">Gerador Python v3.12</StatHelpText>
            </Stat>
          </Box>
          <Box p={4} borderRadius="xl" bg={useColorModeValue('gray.50', 'gray.900')}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Segurança de Acesso</StatLabel>
              <StatNumber fontSize="lg" fontWeight="bold" color="purple.500">
                JWT Autenticado
              </StatNumber>
              <StatHelpText fontSize="xs">Proteção via Gateway</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
