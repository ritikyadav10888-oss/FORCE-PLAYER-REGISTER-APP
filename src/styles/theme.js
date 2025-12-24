import { Platform } from 'react-native';

/**
 * Force App Premium Design System
 * Focus: Sophisticated Dark Mode, Glassmorphism, Neon Accents, and Modern Spacing.
 * Optimized for both Mobile and Web.
 * 
 * NOTE: lineHeight must be a number (pixels) for React Native compatibility.
 */

export const theme = {
  colors: {
    // Core Backgrounds
    appBackground: '#04060D',
    surface: '#111420',
    surfaceLight: '#1C2136',
    surfaceHighlight: '#2A3152',

    // Brand Colors
    primary: '#00F5A0',
    secondary: '#00D9F5',
    accent: '#7000FF',

    // Status Colors
    success: '#00F5A0',
    warning: '#FFB800',
    error: '#FF3D71',
    info: '#00D9F5',

    // Typography
    text: '#FFFFFF',
    textSecondary: '#8F9BB3',
    textTertiary: '#4B5563',

    // Borders & Dividers
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.04)',

    // Special
    glass: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    warningLight: 'rgba(255, 184, 0, 0.1)',
  },

  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
    huge: 64,
  },

  typography: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      web: 'Outfit, Inter, sans-serif'
    }),
    h1: {
      fontSize: 34,
      fontWeight: '900',
      letterSpacing: -1,
      lineHeight: 42,
    },
    h2: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
      lineHeight: 34,
    },
    h3: {
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: -0.2,
      lineHeight: 28,
    },
    header: {
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24, // Fixed: Absolute pixel value
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20, // Fixed: Absolute pixel value
    },
    caption: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    button: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    }
  },

  borderRadius: {
    xs: 4,
    s: 8,
    m: 14,
    l: 20,
    xl: 28,
    xxl: 40,
    pill: 100,
  },

  shadows: {
    neon: Platform.select({
      web: {
        boxShadow: '0px 0px 20px rgba(0, 245, 160, 0.3)',
      },
      default: {
        shadowColor: '#00F5A0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
      }
    }),
    soft: Platform.select({
      web: {
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 5,
      }
    }),
    glass: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    }
  }
};
