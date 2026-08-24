'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  Link as ChakraLink,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      toast({
        title: 'Logged in successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={useColorModeValue('gray.50', 'gray.900')} fontFamily="Inter, sans-serif">
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6} w="full">
        <Stack align="center">
          <Heading fontSize="4xl" color={textColor} textAlign="center">
            Bem-vindo ao <Text as="span" color="#10B981">Figest</Text>
          </Heading>
          <Text fontSize="lg" color="gray.500" textAlign="center">
            A sua plataforma de gestão financeira inteligente ✌️
          </Text>
        </Stack>
        <Box rounded="lg" bg={bgColor} boxShadow="2xl" p={8} borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>E-mail</FormLabel>
                <Input
                  type="email"
                  value={email}
                  placeholder="seu@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  focusBorderColor="#10B981"
                />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  focusBorderColor="#10B981"
                />
              </FormControl>
              <Stack spacing={10} pt={4}>
                <Button
                  type="submit"
                  loadingText="Entrando..."
                  size="lg"
                  bg="#10B981"
                  color="white"
                  _hover={{
                    bg: '#059669',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  isLoading={isLoading}
                >
                  Entrar
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align="center">
                  Não possui uma conta? <ChakraLink as={Link} href="/register" color="#10B981" fontWeight="bold">Registre-se</ChakraLink>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Box>
  );
}
