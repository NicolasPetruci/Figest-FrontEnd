import { Box, Heading, Text, Center } from '@chakra-ui/react';

export default function CategoriesPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Categorias</Heading>
      <Center h="200px" bg="gray.800" borderRadius="lg" borderWidth="1px" borderColor="gray.700">
        <Text color="gray.400">Gerencie suas categorias de receitas e despesas (Em Breve)</Text>
      </Center>
    </Box>
  );
}
