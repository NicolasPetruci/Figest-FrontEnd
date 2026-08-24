import { Box, Heading, Text, Center } from '@chakra-ui/react';

export default function SettingsPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações</Heading>
      <Center h="200px" bg="gray.800" borderRadius="lg" borderWidth="1px" borderColor="gray.700">
        <Text color="gray.400">Preferências do sistema (Em Breve)</Text>
      </Center>
    </Box>
  );
}
