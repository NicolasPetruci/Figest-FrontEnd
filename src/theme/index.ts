import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const colors = {
  accent: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    emerald: '#10B981',
  },
  brand: {
    bgLight: '#F8FAFC',
    bgDark: '#0B0E14',
  }
}

const fonts = {
  body: 'Inter, sans-serif',
  heading: 'Inter, sans-serif',
  mono: '"JetBrains Mono", monospace',
}

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'accent',
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'accent.500',
    },
  }
}

export const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'brand.bgDark' : 'brand.bgLight',
        color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800',
      },
    }),
  },
})

export default theme
