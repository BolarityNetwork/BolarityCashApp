/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'text-gray': '#8F9098', // TODO remove

        // #12C9B1
        base: {
          // #12C9B1
          pri: 'hsl(var(--color-pri))',
          // #FFFFFF
          FFF: 'hsl(var(--color-FFF))',
          // #000000
          '000': 'hsl(var(--color-000))',
        },
        div: {
          bg: {
            // #F5F7F7
            F: 'hsl(var(--color-div-bg-F))',
            // #ECF2F2
            E: 'hsl(var(--color-div-bg-E))',
            // #B6BDBE
            B: 'hsl(var(--color-div-bg-B))',
          },
        },
        font: {
          // #1E2C2E
          1: 'hsl(var(--color-font-1))',
          // #2F4447
          2: 'hsl(var(--color-font-2))',
          // #455C5C
          4: 'hsl(var(--color-font-4))',
          // #6F8282
          6: 'hsl(var(--color-font-6))',
          // #9FB2B2
          9: 'hsl(var(--color-font-9))',
        },
        variant: {
          bg: {
            // #F7FAFA
            hover: 'hsl(var(--color-bg-hover))',
          },
          // #E6E6E6
          frame: 'hsl(var(--color-frame))',
          pri: {
            // #CCF3EE
            100: 'hsl(var(--color-pri-100))',
            // #4F9C91
            300: 'hsl(var(--color-pri-300))',
            // #338275
            600: 'hsl(var(--color-pri-600))',
          },
          button: {
            // #13D6BC
            hover: 'hsl(var(--color-button-hover))',
          },
          sp: {
            // #CFE9E5
            border: 'hsl(var(--color-sp-border))',
          },
        },
        palette: {
          // #97B75D
          color: 'hsl(var(--color-color))',
          color: {
            // #55A180
            2: 'hsl(var(--color-color-2))',
            // #F7813C
            3: 'hsl(var(--color-color-3))',
            // #6675c0
            4: 'hsl(var(--color-color-4))',
          },
          // #E3446E
          like: 'hsl(var(--color-like))',
        },
        custom: {
          toast: {
            bg: {
              1: 'hsla(var(--color-toast-bg-1))',
              weak: 'hsla(var(--color-toast-bg-weak))',
            },
          },
          font: {
            translate: 'hsl(var(--color-font-translate))',
            gray: {
              200: 'hsl(var(--color-font-gray-200))',
              400: 'hsl(var(--color-font-gray-400))',
              500: 'hsl(var(--color-font-gray-500))',
            },
          },
        },
      },
      fontFamily: {},
    },
  },
  plugins: [],
  darkMode: 'media',
  corePlugin: {
    backgroundOpacity: true,
  },
};
