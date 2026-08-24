'use client';

import React from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiDownload, FiFileText, FiBarChart2 } from 'react-icons/fi';

export default function ReportsPage() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDownloadCSV = () => {
    window.open('/api/reports/exports/csv', '_blank');
  };

  const handleDownloadPDF = () => {
    window.open('/api/reports/exports/pdf', '_blank');
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Reports</Heading>
        <Flex gap={3}>
          <Button leftIcon={<Icon as={FiDownload} />} colorScheme="gray" variant="outline" onClick={handleDownloadCSV}>
            Download CSV
          </Button>
          <Button leftIcon={<Icon as={FiDownload} />} colorScheme="emerald" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box
          bg={bg}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex align="center" mb={4}>
            <Flex bg="emerald.100" p={3} borderRadius="lg" mr={4}>
              <Icon as={FiBarChart2} color="emerald.600" boxSize={6} />
            </Flex>
            <Box>
              <Text fontWeight="bold" fontSize="lg">Monthly Summary</Text>
              <Text fontSize="sm" color="gray.500">View your income and expenses for the current month.</Text>
            </Box>
          </Flex>
          <Button mt={4} width="full" colorScheme="gray" variant="light">
            View Report
          </Button>
        </Box>

        <Box
          bg={bg}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <Flex align="center" mb={4}>
            <Flex bg="blue.100" p={3} borderRadius="lg" mr={4}>
              <Icon as={FiFileText} color="blue.600" boxSize={6} />
            </Flex>
            <Box>
              <Text fontWeight="bold" fontSize="lg">Annual Overview</Text>
              <Text fontSize="sm" color="gray.500">Comprehensive breakdown of your yearly financial performance.</Text>
            </Box>
          </Flex>
          <Button mt={4} width="full" colorScheme="gray" variant="light">
            View Report
          </Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
