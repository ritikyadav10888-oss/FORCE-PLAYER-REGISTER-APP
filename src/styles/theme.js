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
    // Core Backgrounds (Light Mode)
    appBackground: '#FFFFFF', // Pure White
    surface: '#FFFFFF',       // Pure white
    surfaceLight: '#FFFFFF',  // Pure White
    surfaceHighlight: '#FFFFFF', // Pure White

    // Brand Colors
    primary: '#10B981',       // Emerald Green (Darker for better contrast on white)
    secondary: '#0EA5E9',     // Sky Blue
    accent: '#8B5CF6',        // Violet

    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Typography
    text: '#1E293B',          // Slate 800 (Soft Black)
    textSecondary: '#64748B', // Slate 500
    textTertiary: '#94A3B8',  // Slate 400

    // Borders & Dividers
    border: '#E2E8F0',
    borderLight: '#F1F5F9',

    // Special
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(226, 232, 240, 0.6)',
    warningLight: 'rgba(245, 158, 11, 0.1)',
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
