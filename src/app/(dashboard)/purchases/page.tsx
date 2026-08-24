import { Box, Heading, Text, Center } from '@chakra-ui/react';

export default function PurchasesPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Compras B2B</Heading>
      <Center h="200px" bg="gray.800" borderRadius="lg" borderWidth="1px" borderColor="gray.700">
        <Text color="gray.400">Acompanhe suas compras e fornecedores (Em Breve)</Text>
      </Center>
    </Box>
  );
}
