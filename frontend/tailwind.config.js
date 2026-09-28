export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
          dark: 'var(--accent-dark)',
        },
        green: {
          DEFAULT: 'var(--green)',
          soft: 'var(--green-soft)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          soft: 'var(--amber-soft)',
        },
        rust: {
          DEFAULT: 'var(--rust)',
          soft: 'var(--rust-soft)',
          dark: 'var(--rust-dark)',
        },
        teal: {
          DEFAULT: 'var(--teal)',
          soft: 'var(--teal-soft)',
          dark: 'var(--teal-dark)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          soft: 'var(--gold-soft)',
          dark: 'var(--gold-dark)',
        },
        blue: {
          DEFAULT: '#1F5A8C',
          soft: 'var(--blue-soft)',
          dark: 'var(--blue-dark)',
        },
      },
      fontFamily: {
        sans: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        header: '0 2px 8px rgba(20,20,15,0.06)',
        card: '0 4px 12px rgba(20,20,15,0.10), 0 1px 3px rgba(20,20,15,0.06)',
        search: '0 2px 6px rgba(20,20,15,0.08), 0 6px 14px rgba(20,20,15,0.05)',
        bar: '0 -2px 10px rgba(20,20,15,0.04), 0 6px 20px rgba(20,20,15,0.08)',
        dropdown: '0 6px 24px rgba(20,20,15,0.14)',
        modal: '0 12px 36px rgba(20,20,15,0.22)',
      },
      borderRadius: {
        card: '14px',
        input: '14px',
        tag: '8px',
        navpill: '13px',
      },
      zIndex: {
        '40': '40',
        '50': '50',
        '100': '100',
      },
    },
  },
  plugins: [],
}
