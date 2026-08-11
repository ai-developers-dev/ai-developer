/**
 * Clerk theming for the black/orange design.
 *
 * Clerk components render inside a shadow-ish scope that our Tailwind tokens
 * don't reach, so they ship light by default and would sit on the black page
 * as a white slab. This appearance object is passed once at <ClerkProvider>
 * so every Clerk surface — SignIn, SignUp, UserButton and its popover —
 * inherits it.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#EF6A00',
    colorBackground: '#0B0B0B',
    colorText: '#FFFFFF',
    colorTextSecondary: 'rgba(255,255,255,0.6)',
    colorInputBackground: '#0B0B0B',
    colorInputText: '#FFFFFF',
    colorNeutral: '#FFFFFF',
    colorDanger: '#FF5C5C',
    colorSuccess: '#4ADE80',
    colorWarning: '#EF6A00',
    borderRadius: '0px',
    fontFamily: "'Inter', sans-serif",
  },
  elements: {
    card: {
      backgroundColor: '#0B0B0B',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: 'none',
    },
    formButtonPrimary: {
      backgroundColor: '#EF6A00',
      color: '#000000',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      '&:hover': { backgroundColor: '#FF8A2B' },
    },
    formFieldInput: {
      backgroundColor: '#0B0B0B',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#FFFFFF',
    },
    socialButtonsBlockButton: {
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#FFFFFF',
      '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
    },
    footerActionLink: {
      color: '#EF6A00',
      '&:hover': { color: '#FF8A2B' },
    },
    headerTitle: { color: '#FFFFFF' },
    headerSubtitle: { color: 'rgba(255,255,255,0.6)' },
  },
}
