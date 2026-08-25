// Curated High-Quality Color Palettes from terminalcolors.com & Community for xterm.js
const TERMINAL_THEMES = {
  'ubuntu-dark': {
    id: 'ubuntu-dark',
    name: 'Ubuntu Dark',
    accent: '#e95420',
    swatch: 'linear-gradient(135deg, #e95420, #300a24)',
    ui: {
      bg: '#300a24',
      headerBg: 'linear-gradient(180deg, #3d0c2e 0%, #29061e 100%)',
      tabbarBg: '#24061a',
      tabActiveBg: '#300a24',
      accent: '#e95420',
      accentGlow: 'rgba(233, 84, 32, 0.4)',
      menuBg: '#25061b',
      menuItemHover: '#380c2a'
    },
    termTheme: {
      background: '#300a24',
      foreground: '#ffffff',
      cursor: '#ffffff',
      cursorAccent: '#300a24',
      selectionBackground: 'rgba(233, 84, 32, 0.45)',
      selectionForeground: '#ffffff',
      black: '#2e3436',
      red: '#cc0000',
      green: '#4e9a06',
      yellow: '#c4a000',
      blue: '#3465a4',
      magenta: '#75507b',
      cyan: '#06989a',
      white: '#d3d7cf',
      brightBlack: '#555753',
      brightRed: '#ef2929',
      brightGreen: '#8ae234',
      brightYellow: '#fce94f',
      brightBlue: '#729fcf',
      brightMagenta: '#ad7fa8',
      brightCyan: '#34e2e2',
      brightWhite: '#eeeeec'
    }
  },
  'catppuccin-mocha': {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    accent: '#cba6f7',
    swatch: 'linear-gradient(135deg, #cba6f7, #89b4fa, #1e1e2e)',
    ui: {
      bg: '#1e1e2e',
      headerBg: 'linear-gradient(180deg, #2a2b3d 0%, #181825 100%)',
      tabbarBg: '#181825',
      tabActiveBg: '#1e1e2e',
      accent: '#cba6f7',
      accentGlow: 'rgba(203, 166, 247, 0.4)',
      menuBg: '#181825',
      menuItemHover: '#2a2b3d'
    },
    termTheme: {
      background: '#1e1e2e',
      foreground: '#cdd6f4',
      cursor: '#f5e0dc',
      cursorAccent: '#1e1e2e',
      selectionBackground: 'rgba(88, 91, 112, 0.65)',
      selectionForeground: '#ffffff',
      black: '#45475a',
      red: '#f38ba8',
      green: '#a6e3a1',
      yellow: '#f9e2af',
      blue: '#89b4fa',
      magenta: '#f5c2e7',
      cyan: '#94e2d5',
      white: '#bac2de',
      brightBlack: '#585b70',
      brightRed: '#f38ba8',
      brightGreen: '#a6e3a1',
      brightYellow: '#f9e2af',
      brightBlue: '#89b4fa',
      brightMagenta: '#f5c2e7',
      brightCyan: '#94e2d5',
      brightWhite: '#a6adc8'
    }
  },
  'catppuccin-macchiato': {
    id: 'catppuccin-macchiato',
    name: 'Catppuccin Macchiato',
    accent: '#c6a0f6',
    swatch: 'linear-gradient(135deg, #c6a0f6, #8aadf4, #24273a)',
    ui: {
      bg: '#24273a',
      headerBg: 'linear-gradient(180deg, #303348 0%, #1e2030 100%)',
      tabbarBg: '#1e2030',
      tabActiveBg: '#24273a',
      accent: '#c6a0f6',
      accentGlow: 'rgba(198, 160, 246, 0.4)',
      menuBg: '#1e2030',
      menuItemHover: '#303348'
    },
    termTheme: {
      background: '#24273a',
      foreground: '#cad3f5',
      cursor: '#f4dbd6',
      cursorAccent: '#24273a',
      selectionBackground: 'rgba(91, 96, 120, 0.65)',
      selectionForeground: '#ffffff',
      black: '#494d64',
      red: '#ed8796',
      green: '#a6da95',
      yellow: '#eed49f',
      blue: '#8aadf4',
      magenta: '#f5bde6',
      cyan: '#8bd5ca',
      white: '#b8c0e0',
      brightBlack: '#5b6078',
      brightRed: '#ed8796',
      brightGreen: '#a6da95',
      brightYellow: '#eed49f',
      brightBlue: '#8aadf4',
      brightMagenta: '#f5bde6',
      brightCyan: '#8bd5ca',
      brightWhite: '#a5adcb'
    }
  },
  'catppuccin-latte': {
    id: 'catppuccin-latte',
    name: 'Catppuccin Latte (Light)',
    accent: '#8839ef',
    swatch: 'linear-gradient(135deg, #8839ef, #1e66f5, #eff1f5)',
    ui: {
      bg: '#eff1f5',
      headerBg: 'linear-gradient(180deg, #e6e9ef 0%, #dce0e8 100%)',
      tabbarBg: '#dce0e8',
      tabActiveBg: '#eff1f5',
      accent: '#8839ef',
      accentGlow: 'rgba(136, 57, 239, 0.4)',
      menuBg: '#e6e9ef',
      menuItemHover: '#ccd0da'
    },
    termTheme: {
      background: '#eff1f5',
      foreground: '#4c4f69',
      cursor: '#dc8a78',
      cursorAccent: '#eff1f5',
      selectionBackground: 'rgba(172, 176, 190, 0.5)',
      selectionForeground: '#000000',
      black: '#5c5f77',
      red: '#d20f39',
      green: '#40a02b',
      yellow: '#df8e1d',
      blue: '#1e66f5',
      magenta: '#ea76cb',
      cyan: '#179299',
      white: '#acb0be',
      brightBlack: '#6c6f85',
      brightRed: '#d20f39',
      brightGreen: '#40a02b',
      brightYellow: '#df8e1d',
      brightBlue: '#1e66f5',
      brightMagenta: '#ea76cb',
      brightCyan: '#179299',
      brightWhite: '#bcc0cc'
    }
  },
  'dracula': {
    id: 'dracula',
    name: 'Dracula',
    accent: '#bd93f9',
    swatch: 'linear-gradient(135deg, #bd93f9, #ff79c6, #282a36)',
    ui: {
      bg: '#282a36',
      headerBg: 'linear-gradient(180deg, #343746 0%, #21222c 100%)',
      tabbarBg: '#1e1f29',
      tabActiveBg: '#282a36',
      accent: '#bd93f9',
      accentGlow: 'rgba(189, 147, 249, 0.4)',
      menuBg: '#21222c',
      menuItemHover: '#343746'
    },
    termTheme: {
      background: '#282a36',
      foreground: '#f8f8f2',
      cursor: '#f8f8f2',
      cursorAccent: '#282a36',
      selectionBackground: 'rgba(68, 71, 90, 0.65)',
      selectionForeground: '#ffffff',
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
      brightBlack: '#6272a4',
      brightRed: '#ff6e6e',
      brightGreen: '#69ff94',
      brightYellow: '#ffffa5',
      brightBlue: '#d6acff',
      brightMagenta: '#ff92df',
      brightCyan: '#a4ffff',
      brightWhite: '#ffffff'
    }
  },
  'gruvbox-dark': {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    accent: '#fe8019',
    swatch: 'linear-gradient(135deg, #fe8019, #fabd2f, #282828)',
    ui: {
      bg: '#282828',
      headerBg: 'linear-gradient(180deg, #32302f 0%, #1d2021 100%)',
      tabbarBg: '#1d2021',
      tabActiveBg: '#282828',
      accent: '#fe8019',
      accentGlow: 'rgba(254, 128, 25, 0.4)',
      menuBg: '#1d2021',
      menuItemHover: '#32302f'
    },
    termTheme: {
      background: '#282828',
      foreground: '#ebdbb2',
      cursor: '#ebdbb2',
      cursorAccent: '#282828',
      selectionBackground: 'rgba(80, 73, 69, 0.7)',
      selectionForeground: '#ffffff',
      black: '#282828',
      red: '#cc241d',
      green: '#98971a',
      yellow: '#d79921',
      blue: '#458588',
      magenta: '#b16286',
      cyan: '#689d6a',
      white: '#a89984',
      brightBlack: '#928374',
      brightRed: '#fb4934',
      brightGreen: '#b8bb26',
      brightYellow: '#fabd2f',
      brightBlue: '#83a598',
      brightMagenta: '#d3869b',
      brightCyan: '#8ec07c',
      brightWhite: '#ebdbb2'
    }
  },
  'gruvbox-light': {
    id: 'gruvbox-light',
    name: 'Gruvbox Light',
    accent: '#d65d0e',
    swatch: 'linear-gradient(135deg, #d65d0e, #b57614, #fbf1c7)',
    ui: {
      bg: '#fbf1c7',
      headerBg: 'linear-gradient(180deg, #f2e5bc 0%, #ebdbb2 100%)',
      tabbarBg: '#ebdbb2',
      tabActiveBg: '#fbf1c7',
      accent: '#d65d0e',
      accentGlow: 'rgba(214, 93, 14, 0.4)',
      menuBg: '#f2e5bc',
      menuItemHover: '#d5c4a1'
    },
    termTheme: {
      background: '#fbf1c7',
      foreground: '#3c3836',
      cursor: '#3c3836',
      cursorAccent: '#fbf1c7',
      selectionBackground: 'rgba(213, 196, 161, 0.7)',
      selectionForeground: '#000000',
      black: '#fbf1c7',
      red: '#cc241d',
      green: '#98971a',
      yellow: '#d79921',
      blue: '#458588',
      magenta: '#b16286',
      cyan: '#689d6a',
      white: '#7c6f64',
      brightBlack: '#928374',
      brightRed: '#9d0006',
      brightGreen: '#79740e',
      brightYellow: '#b57614',
      brightBlue: '#076678',
      brightMagenta: '#8f3f71',
      brightCyan: '#427b58',
      brightWhite: '#3c3836'
    }
  },
  'tokyo-night': {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    accent: '#7aa2f7',
    swatch: 'linear-gradient(135deg, #7aa2f7, #bb9af7, #1a1b26)',
    ui: {
      bg: '#1a1b26',
      headerBg: 'linear-gradient(180deg, #24283b 0%, #16161e 100%)',
      tabbarBg: '#13141c',
      tabActiveBg: '#1a1b26',
      accent: '#7aa2f7',
      accentGlow: 'rgba(122, 162, 247, 0.4)',
      menuBg: '#16161e',
      menuItemHover: '#24283b'
    },
    termTheme: {
      background: '#1a1b26',
      foreground: '#c0caf5',
      cursor: '#c0caf5',
      cursorAccent: '#1a1b26',
      selectionBackground: 'rgba(51, 70, 115, 0.65)',
      selectionForeground: '#ffffff',
      black: '#15161e',
      red: '#f7768e',
      green: '#9ece6a',
      yellow: '#e0af68',
      blue: '#7aa2f7',
      magenta: '#bb9af7',
      cyan: '#7dcfff',
      white: '#a9b1d6',
      brightBlack: '#414868',
      brightRed: '#f7768e',
      brightGreen: '#9ece6a',
      brightYellow: '#e0af68',
      brightBlue: '#7aa2f7',
      brightMagenta: '#bb9af7',
      brightCyan: '#7dcfff',
      brightWhite: '#c0caf5'
    }
  },
  'kanagawa': {
    id: 'kanagawa',
    name: 'Kanagawa Wave',
    accent: '#7e9cd8',
    swatch: 'linear-gradient(135deg, #7e9cd8, #98bb6c, #1f1f28)',
    ui: {
      bg: '#1f1f28',
      headerBg: 'linear-gradient(180deg, #2a2a37 0%, #16161d 100%)',
      tabbarBg: '#16161d',
      tabActiveBg: '#1f1f28',
      accent: '#7e9cd8',
      accentGlow: 'rgba(126, 156, 216, 0.4)',
      menuBg: '#16161d',
      menuItemHover: '#2a2a37'
    },
    termTheme: {
      background: '#1f1f28',
      foreground: '#dcd7ba',
      cursor: '#c8c093',
      cursorAccent: '#1f1f28',
      selectionBackground: 'rgba(45, 49, 68, 0.7)',
      selectionForeground: '#ffffff',
      black: '#090618',
      red: '#c34043',
      green: '#76946a',
      yellow: '#c0a36e',
      blue: '#7e9cd8',
      magenta: '#957fb8',
      cyan: '#6a9589',
      white: '#c8c093',
      brightBlack: '#727169',
      brightRed: '#e82424',
      brightGreen: '#98bb6c',
      brightYellow: '#e6c384',
      brightBlue: '#7fb4ca',
      brightMagenta: '#938aa9',
      brightCyan: '#7aa89f',
      brightWhite: '#dcd7ba'
    }
  },
  'everforest-dark': {
    id: 'everforest-dark',
    name: 'Everforest Dark',
    accent: '#a7c080',
    swatch: 'linear-gradient(135deg, #a7c080, #7fbbb3, #2d353b)',
    ui: {
      bg: '#2d353b',
      headerBg: 'linear-gradient(180deg, #374247 0%, #232a2e 100%)',
      tabbarBg: '#232a2e',
      tabActiveBg: '#2d353b',
      accent: '#a7c080',
      accentGlow: 'rgba(167, 192, 128, 0.4)',
      menuBg: '#232a2e',
      menuItemHover: '#374247'
    },
    termTheme: {
      background: '#2d353b',
      foreground: '#d3c6aa',
      cursor: '#d3c6aa',
      cursorAccent: '#2d353b',
      selectionBackground: 'rgba(74, 85, 90, 0.7)',
      selectionForeground: '#ffffff',
      black: '#343f44',
      red: '#e67e80',
      green: '#a7c080',
      yellow: '#dbbc7f',
      blue: '#7fbbb3',
      magenta: '#d699b6',
      cyan: '#83c092',
      white: '#d3c6aa',
      brightBlack: '#859289',
      brightRed: '#e67e80',
      brightGreen: '#a7c080',
      brightYellow: '#dbbc7f',
      brightBlue: '#7fbbb3',
      brightMagenta: '#d699b6',
      brightCyan: '#83c092',
      brightWhite: '#d3c6aa'
    }
  },
  'rose-pine': {
    id: 'rose-pine',
    name: 'Rosé Pine',
    accent: '#eb6f92',
    swatch: 'linear-gradient(135deg, #eb6f92, #9ccfd8, #191724)',
    ui: {
      bg: '#191724',
      headerBg: 'linear-gradient(180deg, #232136 0%, #13111c 100%)',
      tabbarBg: '#13111c',
      tabActiveBg: '#191724',
      accent: '#eb6f92',
      accentGlow: 'rgba(235, 111, 146, 0.4)',
      menuBg: '#13111c',
      menuItemHover: '#232136'
    },
    termTheme: {
      background: '#191724',
      foreground: '#e0def4',
      cursor: '#56526e',
      cursorAccent: '#191724',
      selectionBackground: 'rgba(42, 40, 62, 0.7)',
      selectionForeground: '#ffffff',
      black: '#26233a',
      red: '#eb6f92',
      green: '#31748f',
      yellow: '#f6c177',
      blue: '#9ccfd8',
      magenta: '#c4a7e7',
      cyan: '#ebbcba',
      white: '#e0def4',
      brightBlack: '#6e6a86',
      brightRed: '#eb6f92',
      brightGreen: '#31748f',
      brightYellow: '#f6c177',
      brightBlue: '#9ccfd8',
      brightMagenta: '#c4a7e7',
      brightCyan: '#ebbcba',
      brightWhite: '#e0def4'
    }
  },
  'night-owl': {
    id: 'night-owl',
    name: 'Night Owl',
    accent: '#82aaff',
    swatch: 'linear-gradient(135deg, #82aaff, #22da6e, #011627)',
    ui: {
      bg: '#011627',
      headerBg: 'linear-gradient(180deg, #0b253a 0%, #010f1c 100%)',
      tabbarBg: '#010f1c',
      tabActiveBg: '#011627',
      accent: '#82aaff',
      accentGlow: 'rgba(130, 170, 255, 0.4)',
      menuBg: '#010f1c',
      menuItemHover: '#0b253a'
    },
    termTheme: {
      background: '#011627',
      foreground: '#d6deeb',
      cursor: '#7e57c2',
      cursorAccent: '#011627',
      selectionBackground: 'rgba(29, 59, 83, 0.7)',
      selectionForeground: '#ffffff',
      black: '#011627',
      red: '#ef5350',
      green: '#22da6e',
      yellow: '#addb67',
      blue: '#82aaff',
      magenta: '#c792ea',
      cyan: '#21c7a8',
      white: '#ffffff',
      brightBlack: '#575656',
      brightRed: '#ef5350',
      brightGreen: '#22da6e',
      brightYellow: '#ffeb95',
      brightBlue: '#82aaff',
      brightMagenta: '#c792ea',
      brightCyan: '#7fdbca',
      brightWhite: '#ffffff'
    }
  },
  'cobalt2': {
    id: 'cobalt2',
    name: 'Cobalt2',
    accent: '#ffc600',
    swatch: 'linear-gradient(135deg, #ffc600, #0088ff, #122738)',
    ui: {
      bg: '#122738',
      headerBg: 'linear-gradient(180deg, #19354d 0%, #0d1d2b 100%)',
      tabbarBg: '#0d1d2b',
      tabActiveBg: '#122738',
      accent: '#ffc600',
      accentGlow: 'rgba(255, 198, 0, 0.4)',
      menuBg: '#0d1d2b',
      menuItemHover: '#19354d'
    },
    termTheme: {
      background: '#122738',
      foreground: '#ffffff',
      cursor: '#f0c674',
      cursorAccent: '#122738',
      selectionBackground: 'rgba(0, 80, 140, 0.65)',
      selectionForeground: '#ffffff',
      black: '#000000',
      red: '#ff0000',
      green: '#38de21',
      yellow: '#ffe50a',
      blue: '#1460d2',
      magenta: '#ff005d',
      cyan: '#00bbaf',
      white: '#bbbbbb',
      brightBlack: '#555555',
      brightRed: '#f40d17',
      brightGreen: '#38de21',
      brightYellow: '#ffe50a',
      brightBlue: '#1460d2',
      brightMagenta: '#ff005d',
      brightCyan: '#00bbaf',
      brightWhite: '#ffffff'
    }
  },
  'poimandres': {
    id: 'poimandres',
    name: 'Poimandres',
    accent: '#5de4c7',
    swatch: 'linear-gradient(135deg, #5de4c7, #add7ff, #1b1e28)',
    ui: {
      bg: '#1b1e28',
      headerBg: 'linear-gradient(180deg, #252a38 0%, #151720 100%)',
      tabbarBg: '#151720',
      tabActiveBg: '#1b1e28',
      accent: '#5de4c7',
      accentGlow: 'rgba(93, 228, 199, 0.4)',
      menuBg: '#151720',
      menuItemHover: '#252a38'
    },
    termTheme: {
      background: '#1b1e28',
      foreground: '#a6accd',
      cursor: '#add7ff',
      cursorAccent: '#1b1e28',
      selectionBackground: 'rgba(48, 55, 78, 0.7)',
      selectionForeground: '#ffffff',
      black: '#1b1e28',
      red: '#d0679d',
      green: '#5de4c7',
      yellow: '#fffac2',
      blue: '#89ddff',
      magenta: '#f087bd',
      cyan: '#add7ff',
      white: '#ffffff',
      brightBlack: '#a6accd',
      brightRed: '#d0679d',
      brightGreen: '#5de4c7',
      brightYellow: '#fffac2',
      brightBlue: '#89ddff',
      brightMagenta: '#f087bd',
      brightCyan: '#add7ff',
      brightWhite: '#ffffff'
    }
  },
  'nord': {
    id: 'nord',
    name: 'Nord',
    accent: '#88c0d0',
    swatch: 'linear-gradient(135deg, #88c0d0, #2e3440)',
    ui: {
      bg: '#2e3440',
      headerBg: 'linear-gradient(180deg, #3b4252 0%, #272c36 100%)',
      tabbarBg: '#242933',
      tabActiveBg: '#2e3440',
      accent: '#88c0d0',
      accentGlow: 'rgba(136, 192, 208, 0.4)',
      menuBg: '#272c36',
      menuItemHover: '#3b4252'
    },
    termTheme: {
      background: '#2e3440',
      foreground: '#d8dee9',
      cursor: '#d8dee9',
      cursorAccent: '#2e3440',
      selectionBackground: 'rgba(67, 76, 94, 0.7)',
      selectionForeground: '#ffffff',
      black: '#3b4252',
      red: '#bf616a',
      green: '#a3be8c',
      yellow: '#ebcb8b',
      blue: '#81a1c1',
      magenta: '#b48ead',
      cyan: '#88c0d0',
      white: '#e5e9f0',
      brightBlack: '#4c566a',
      brightRed: '#bf616a',
      brightGreen: '#a3be8c',
      brightYellow: '#ebcb8b',
      brightBlue: '#81a1c1',
      brightMagenta: '#b48ead',
      brightCyan: '#8fbcbb',
      brightWhite: '#eceff4'
    }
  },
  'one-dark': {
    id: 'one-dark',
    name: 'One Dark Pro',
    accent: '#61afef',
    swatch: 'linear-gradient(135deg, #61afef, #21252b)',
    ui: {
      bg: '#21252b',
      headerBg: 'linear-gradient(180deg, #282c34 0%, #1e2227 100%)',
      tabbarBg: '#1b1d23',
      tabActiveBg: '#21252b',
      accent: '#61afef',
      accentGlow: 'rgba(97, 175, 239, 0.4)',
      menuBg: '#1e2227',
      menuItemHover: '#282c34'
    },
    termTheme: {
      background: '#21252b',
      foreground: '#abb2bf',
      cursor: '#528bff',
      cursorAccent: '#21252b',
      selectionBackground: 'rgba(62, 68, 81, 0.7)',
      selectionForeground: '#ffffff',
      black: '#1e2127',
      red: '#e06c75',
      green: '#98c379',
      yellow: '#d19a66',
      blue: '#61afef',
      magenta: '#c678dd',
      cyan: '#56b6c2',
      white: '#abb2bf',
      brightBlack: '#5c6370',
      brightRed: '#e06c75',
      brightGreen: '#98c379',
      brightYellow: '#d19a66',
      brightBlue: '#61afef',
      brightMagenta: '#c678dd',
      brightCyan: '#56b6c2',
      brightWhite: '#ffffff'
    }
  },
  'one-light': {
    id: 'one-light',
    name: 'One Light',
    accent: '#2f5af3',
    swatch: 'linear-gradient(135deg, #2f5af3, #0184bc, #fafafa)',
    ui: {
      bg: '#fafafa',
      headerBg: 'linear-gradient(180deg, #f0f0f0 0%, #e5e5e6 100%)',
      tabbarBg: '#e5e5e6',
      tabActiveBg: '#fafafa',
      accent: '#2f5af3',
      accentGlow: 'rgba(47, 90, 243, 0.4)',
      menuBg: '#f0f0f0',
      menuItemHover: '#d0d0d2'
    },
    termTheme: {
      background: '#fafafa',
      foreground: '#383a42',
      cursor: '#526fff',
      cursorAccent: '#fafafa',
      selectionBackground: 'rgba(235, 235, 235, 0.8)',
      selectionForeground: '#000000',
      black: '#383a42',
      red: '#e45649',
      green: '#50a14f',
      yellow: '#c18401',
      blue: '#4078f2',
      magenta: '#a626a4',
      cyan: '#0184bc',
      white: '#a0a1a7',
      brightBlack: '#4f525d',
      brightRed: '#e45649',
      brightGreen: '#50a14f',
      brightYellow: '#c18401',
      brightBlue: '#4078f2',
      brightMagenta: '#a626a4',
      brightCyan: '#0184bc',
      brightWhite: '#ffffff'
    }
  },
  'ayu-dark': {
    id: 'ayu-dark',
    name: 'Ayu Dark',
    accent: '#e6b450',
    swatch: 'linear-gradient(135deg, #e6b450, #ff3333, #0b0e14)',
    ui: {
      bg: '#0b0e14',
      headerBg: 'linear-gradient(180deg, #131721 0%, #080a0f 100%)',
      tabbarBg: '#080a0f',
      tabActiveBg: '#0b0e14',
      accent: '#e6b450',
      accentGlow: 'rgba(230, 180, 80, 0.4)',
      menuBg: '#080a0f',
      menuItemHover: '#131721'
    },
    termTheme: {
      background: '#0b0e14',
      foreground: '#bfbdb6',
      cursor: '#e6b450',
      cursorAccent: '#0b0e14',
      selectionBackground: 'rgba(39, 52, 70, 0.7)',
      selectionForeground: '#ffffff',
      black: '#01060e',
      red: '#ea6c73',
      green: '#91b362',
      yellow: '#f9af4f',
      blue: '#53b7ec',
      magenta: '#fae994',
      cyan: '#90e1c6',
      white: '#c7c7c7',
      brightBlack: '#686868',
      brightRed: '#f07178',
      brightGreen: '#aad94c',
      brightYellow: '#ffb454',
      brightBlue: '#59c2ff',
      brightMagenta: '#d2a6ff',
      brightCyan: '#95e6cb',
      brightWhite: '#ffffff'
    }
  },
  'ayu-mirage': {
    id: 'ayu-mirage',
    name: 'Ayu Mirage',
    accent: '#ffcc66',
    swatch: 'linear-gradient(135deg, #ffcc66, #5ccfe6, #1f2430)',
    ui: {
      bg: '#1f2430',
      headerBg: 'linear-gradient(180deg, #272d3b 0%, #171b24 100%)',
      tabbarBg: '#171b24',
      tabActiveBg: '#1f2430',
      accent: '#ffcc66',
      accentGlow: 'rgba(255, 204, 102, 0.4)',
      menuBg: '#171b24',
      menuItemHover: '#272d3b'
    },
    termTheme: {
      background: '#1f2430',
      foreground: '#cbccc6',
      cursor: '#ffcc66',
      cursorAccent: '#1f2430',
      selectionBackground: 'rgba(52, 63, 82, 0.7)',
      selectionForeground: '#ffffff',
      black: '#191e2a',
      red: '#ed8274',
      green: '#a6cc70',
      yellow: '#fad07b',
      blue: '#6dcbfa',
      magenta: '#cfbafa',
      cyan: '#90e1c6',
      white: '#c7c7c7',
      brightBlack: '#686868',
      brightRed: '#f28779',
      brightGreen: '#bae67e',
      brightYellow: '#ffd580',
      brightBlue: '#73d0ff',
      brightMagenta: '#d4bfff',
      brightCyan: '#95e6cb',
      brightWhite: '#ffffff'
    }
  },
  'iceberg': {
    id: 'iceberg',
    name: 'Iceberg',
    accent: '#84a0c6',
    swatch: 'linear-gradient(135deg, #84a0c6, #89b8c2, #161821)',
    ui: {
      bg: '#161821',
      headerBg: 'linear-gradient(180deg, #1f2230 0%, #10121a 100%)',
      tabbarBg: '#10121a',
      tabActiveBg: '#161821',
      accent: '#84a0c6',
      accentGlow: 'rgba(132, 160, 198, 0.4)',
      menuBg: '#10121a',
      menuItemHover: '#1f2230'
    },
    termTheme: {
      background: '#161821',
      foreground: '#c6c8d1',
      cursor: '#d2d4de',
      cursorAccent: '#161821',
      selectionBackground: 'rgba(39, 44, 66, 0.7)',
      selectionForeground: '#ffffff',
      black: '#161821',
      red: '#e27878',
      green: '#b4be82',
      yellow: '#e2a478',
      blue: '#84a0c6',
      magenta: '#a093c7',
      cyan: '#89b8c2',
      white: '#c6c8d1',
      brightBlack: '#6b7089',
      brightRed: '#e98989',
      brightGreen: '#c0ca8e',
      brightYellow: '#e9b189',
      brightBlue: '#91acd1',
      brightMagenta: '#ada0d3',
      brightCyan: '#95c4ce',
      brightWhite: '#d2d4de'
    }
  },
  'github-dark': {
    id: 'github-dark',
    name: 'GitHub Dark',
    accent: '#58a6ff',
    swatch: 'linear-gradient(135deg, #58a6ff, #0d1117)',
    ui: {
      bg: '#0d1117',
      headerBg: 'linear-gradient(180deg, #161b22 0%, #090d13 100%)',
      tabbarBg: '#090d13',
      tabActiveBg: '#0d1117',
      accent: '#58a6ff',
      accentGlow: 'rgba(88, 166, 255, 0.4)',
      menuBg: '#161b22',
      menuItemHover: '#21262d'
    },
    termTheme: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      cursor: '#58a6ff',
      cursorAccent: '#0d1117',
      selectionBackground: 'rgba(56, 139, 253, 0.4)',
      selectionForeground: '#ffffff',
      black: '#484f58',
      red: '#ff7b72',
      green: '#3fb950',
      yellow: '#d29922',
      blue: '#58a6ff',
      magenta: '#bc8cff',
      cyan: '#39c5cf',
      white: '#b1bac4',
      brightBlack: '#6e7681',
      brightRed: '#ffa198',
      brightGreen: '#56d364',
      brightYellow: '#e3b341',
      brightBlue: '#79c0ff',
      brightMagenta: '#d2a8ff',
      brightCyan: '#56d4dd',
      brightWhite: '#f0f6fc'
    }
  },
  'github-light': {
    id: 'github-light',
    name: 'GitHub Light',
    accent: '#0969da',
    swatch: 'linear-gradient(135deg, #0969da, #1a7f37, #ffffff)',
    ui: {
      bg: '#ffffff',
      headerBg: 'linear-gradient(180deg, #f6f8fa 0%, #eaeef2 100%)',
      tabbarBg: '#eaeef2',
      tabActiveBg: '#ffffff',
      accent: '#0969da',
      accentGlow: 'rgba(9, 105, 218, 0.4)',
      menuBg: '#f6f8fa',
      menuItemHover: '#d0d7de'
    },
    termTheme: {
      background: '#ffffff',
      foreground: '#24292f',
      cursor: '#0969da',
      cursorAccent: '#ffffff',
      selectionBackground: 'rgba(182, 218, 255, 0.7)',
      selectionForeground: '#000000',
      black: '#24292f',
      red: '#cf222e',
      green: '#116329',
      yellow: '#4d2d00',
      blue: '#0969da',
      magenta: '#8250df',
      cyan: '#1b7c83',
      white: '#6e7781',
      brightBlack: '#57606a',
      brightRed: '#a40e26',
      brightGreen: '#1a7f37',
      brightYellow: '#633c01',
      brightBlue: '#218bff',
      brightMagenta: '#a475f9',
      brightCyan: '#3192aa',
      brightWhite: '#8c959f'
    }
  },
  'monokai-pro': {
    id: 'monokai-pro',
    name: 'Monokai Pro',
    accent: '#ffd866',
    swatch: 'linear-gradient(135deg, #ffd866, #a9dc76, #2d2a2e)',
    ui: {
      bg: '#2d2a2e',
      headerBg: 'linear-gradient(180deg, #3a363b 0%, #221f22 100%)',
      tabbarBg: '#19181a',
      tabActiveBg: '#2d2a2e',
      accent: '#ffd866',
      accentGlow: 'rgba(255, 216, 102, 0.4)',
      menuBg: '#221f22',
      menuItemHover: '#3a363b'
    },
    termTheme: {
      background: '#2d2a2e',
      foreground: '#fcfcfa',
      cursor: '#fcfcfa',
      cursorAccent: '#2d2a2e',
      selectionBackground: 'rgba(87, 83, 89, 0.7)',
      selectionForeground: '#ffffff',
      black: '#403e41',
      red: '#ff6188',
      green: '#a9dc76',
      yellow: '#ffd866',
      blue: '#fc9867',
      magenta: '#ab9df2',
      cyan: '#78dce8',
      white: '#fcfcfa',
      brightBlack: '#727072',
      brightRed: '#ff6188',
      brightGreen: '#a9dc76',
      brightYellow: '#ffd866',
      brightBlue: '#fc9867',
      brightMagenta: '#ab9df2',
      brightCyan: '#78dce8',
      brightWhite: '#ffffff'
    }
  },
  'matrix': {
    id: 'matrix',
    name: 'Matrix Green',
    accent: '#00ff66',
    swatch: 'linear-gradient(135deg, #00ff66, #050a06)',
    ui: {
      bg: '#050a06',
      headerBg: 'linear-gradient(180deg, #0d1e11 0%, #030804 100%)',
      tabbarBg: '#020503',
      tabActiveBg: '#050a06',
      accent: '#00ff66',
      accentGlow: 'rgba(0, 255, 102, 0.4)',
      menuBg: '#08140a',
      menuItemHover: '#0f2413'
    },
    termTheme: {
      background: '#050a06',
      foreground: '#00ff66',
      cursor: '#00ff66',
      cursorAccent: '#050a06',
      selectionBackground: 'rgba(0, 255, 102, 0.35)',
      selectionForeground: '#ffffff',
      black: '#0d1e11',
      red: '#ff3333',
      green: '#00ff66',
      yellow: '#b8e986',
      blue: '#20c20e',
      magenta: '#50e3c2',
      cyan: '#00ffcc',
      white: '#a8ffb2',
      brightBlack: '#1c3b24',
      brightRed: '#ff6666',
      brightGreen: '#33ff85',
      brightYellow: '#cfffa3',
      brightBlue: '#4de93b',
      brightMagenta: '#7effd8',
      brightCyan: '#66ffe0',
      brightWhite: '#ffffff'
    }
  },
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk Synth',
    accent: '#ff007f',
    swatch: 'linear-gradient(135deg, #ff007f, #00f0ff)',
    ui: {
      bg: '#19142b',
      headerBg: 'linear-gradient(180deg, #2b1f47 0%, #120e21 100%)',
      tabbarBg: '#0e0b1a',
      tabActiveBg: '#19142b',
      accent: '#ff007f',
      accentGlow: 'rgba(255, 0, 127, 0.4)',
      menuBg: '#1a132e',
      menuItemHover: '#2b1f47'
    },
    termTheme: {
      background: '#19142b',
      foreground: '#f4eee4',
      cursor: '#ff007f',
      cursorAccent: '#19142b',
      selectionBackground: 'rgba(255, 0, 127, 0.4)',
      selectionForeground: '#ffffff',
      black: '#261e3f',
      red: '#fe4450',
      green: '#72f1b8',
      yellow: '#ffe600',
      blue: '#03edf9',
      magenta: '#ff007f',
      cyan: '#00f0ff',
      white: '#f4eee4',
      brightBlack: '#43366c',
      brightRed: '#fe6b74',
      brightGreen: '#94f5c9',
      brightYellow: '#ffeb3b',
      brightBlue: '#48f2fa',
      brightMagenta: '#ff4da6',
      brightCyan: '#4df4ff',
      brightWhite: '#ffffff'
    }
  },
  'solarized-dark': {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    accent: '#268bd2',
    swatch: 'linear-gradient(135deg, #268bd2, #002b36)',
    ui: {
      bg: '#002b36',
      headerBg: 'linear-gradient(180deg, #073642 0%, #001f27 100%)',
      tabbarBg: '#001a21',
      tabActiveBg: '#002b36',
      accent: '#268bd2',
      accentGlow: 'rgba(38, 139, 210, 0.4)',
      menuBg: '#073642',
      menuItemHover: '#0b4756'
    },
    termTheme: {
      background: '#002b36',
      foreground: '#839496',
      cursor: '#839496',
      cursorAccent: '#002b36',
      selectionBackground: 'rgba(7, 54, 66, 0.85)',
      selectionForeground: '#ffffff',
      black: '#073642',
      red: '#dc322f',
      green: '#859900',
      yellow: '#b58900',
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#2aa198',
      white: '#eee8d5',
      brightBlack: '#586e75',
      brightRed: '#cb4b16',
      brightGreen: '#586e75',
      brightYellow: '#657b83',
      brightBlue: '#839496',
      brightMagenta: '#6c71c4',
      brightCyan: '#93a1a1',
      brightWhite: '#fdf6e3'
    }
  }
};

class MultiTabTerminalManager {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.tabCounter = 0;
    this.currentCwd = null;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('git_nexus_terminal_theme') || 'ubuntu-dark';
    this.currentThemeId = TERMINAL_THEMES[savedTheme] ? savedTheme : 'ubuntu-dark';
    this.currentTheme = TERMINAL_THEMES[this.currentThemeId];

    this.tabsListEl = document.getElementById('terminal-tabs-list');
    this.viewportsContainerEl = document.getElementById('standalone-terminal-container');
    this.cwdBadgeEl = document.getElementById('terminal-cwd-badge');
    this.cwdTextEl = document.getElementById('terminal-cwd-text');
    this.btnAddTab = document.getElementById('btn-add-tab');
  }

  init() {
    // Apply initial theme
    this.setTheme(this.currentThemeId);
    this.setupThemeMenu();

    // Initial Tab using initialCwd if provided
    const initialTitle = this.currentCwd ? (this.currentCwd.split(/[\\/]/).filter(Boolean).pop() || null) : null;
    this.createTab(initialTitle, this.currentCwd);

    // Add Tab Button
    if (this.btnAddTab) {
      this.btnAddTab.addEventListener('click', () => this.createTab());
    }

    // Window Resize -> Fit all active terminals
    window.addEventListener('resize', () => {
      this.fitActive();
    });

    // Listen to IPC Data stream
    if (window.api.onTerminalData) {
      window.api.onTerminalData((payload) => {
        let tabId = 'tab-1';
        let data = payload;
        if (payload && typeof payload === 'object' && payload.data !== undefined) {
          tabId = payload.tabId || 'tab-1';
          data = payload.data;
        }

        const tab = this.tabs.find(t => t.id === tabId);
        if (tab && tab.term) {
          tab.term.write(data);
        }
      });
    }

    // Listen to Open New Tab request (e.g. from main app toolbar or Windows Explorer)
    if (window.api.onTerminalOpenNewTab) {
      window.api.onTerminalOpenNewTab((newCwd) => {
        if (newCwd) {
          const folderName = newCwd.split(/[\\/]/).filter(Boolean).pop() || newCwd;
          this.createTab(folderName, newCwd);
        }
      });
    }

    // Listen to session dynamic CWD changes (e.g. cd command executed in shell)
    if (window.api.onTerminalCwdChanged) {
      window.api.onTerminalCwdChanged((payload) => {
        if (!payload || !payload.tabId || !payload.cwd) return;
        this.updateTabFolder(payload.tabId, payload.cwd);
      });
    }

    // Setup Global Shortcuts
    this.setupShortcuts();
  }

  isThemeLight(theme) {
    if (theme.isLight !== undefined) return theme.isLight;
    const bg = (theme.termTheme && theme.termTheme.background) ? theme.termTheme.background : ((theme.ui && theme.ui.bg) ? theme.ui.bg : '#000000');
    let c = bg.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return false;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 140;
  }

  setTheme(themeId) {
    const theme = TERMINAL_THEMES[themeId] || TERMINAL_THEMES['ubuntu-dark'];
    this.currentThemeId = theme.id;
    this.currentTheme = theme;
    const isLight = this.isThemeLight(theme);

    try {
      localStorage.setItem('git_nexus_terminal_theme', theme.id);
    } catch (e) { /* ignore */ }

    // Update CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--term-bg', theme.ui.bg);
    root.style.setProperty('--term-header-bg', theme.ui.headerBg);
    root.style.setProperty('--term-tabbar-bg', theme.ui.tabbarBg);
    root.style.setProperty('--term-tab-active-bg', theme.ui.tabActiveBg);
    root.style.setProperty('--term-accent', theme.ui.accent);
    root.style.setProperty('--term-accent-glow', theme.ui.accentGlow);
    root.style.setProperty('--term-swatch', theme.swatch);

    if (isLight) {
      root.style.setProperty('--term-fg', '#1f2328');
      root.style.setProperty('--term-fg-muted', '#57606a');
      root.style.setProperty('--term-fg-hover', '#000000');
      root.style.setProperty('--term-border', 'rgba(0, 0, 0, 0.12)');
      root.style.setProperty('--term-border-hover', 'rgba(0, 0, 0, 0.28)');
      root.style.setProperty('--term-pill-bg', 'rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--term-btn-bg', 'rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--term-btn-hover-bg', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--term-tab-bg', 'rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--term-tab-hover-bg', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--term-tab-fg', 'rgba(0, 0, 0, 0.65)');
      root.style.setProperty('--term-tab-fg-hover', '#000000');
      root.style.setProperty('--term-tab-active-fg', '#000000');
      root.style.setProperty('--term-tab-active-shadow', '0 -1px 3px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--term-badge-bg', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--term-menu-bg', '#ffffff');
      root.style.setProperty('--term-menu-item-fg', '#24292f');
      root.style.setProperty('--term-menu-item-hover', 'rgba(0, 0, 0, 0.07)');
      root.style.setProperty('--term-menu-item-hover-fg', '#000000');
      root.style.setProperty('--term-menu-item-active-bg', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--term-menu-item-active-fg', '#000000');
      root.style.setProperty('--term-input-bg', '#f6f8fa');
      root.style.setProperty('--term-input-fg', '#1f2328');
      root.style.setProperty('--term-shadow', '0 12px 32px rgba(0, 0, 0, 0.18)');
    } else {
      root.style.setProperty('--term-fg', '#dfdbd2');
      root.style.setProperty('--term-fg-muted', 'rgba(255, 255, 255, 0.55)');
      root.style.setProperty('--term-fg-hover', '#ffffff');
      root.style.setProperty('--term-border', 'rgba(255, 255, 255, 0.12)');
      root.style.setProperty('--term-border-hover', 'rgba(255, 255, 255, 0.25)');
      root.style.setProperty('--term-pill-bg', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--term-btn-bg', 'rgba(255, 255, 255, 0.06)');
      root.style.setProperty('--term-btn-hover-bg', 'rgba(255, 255, 255, 0.12)');
      root.style.setProperty('--term-tab-bg', 'rgba(255, 255, 255, 0.04)');
      root.style.setProperty('--term-tab-hover-bg', 'rgba(255, 255, 255, 0.09)');
      root.style.setProperty('--term-tab-fg', 'rgba(255, 255, 255, 0.6)');
      root.style.setProperty('--term-tab-fg-hover', '#ffffff');
      root.style.setProperty('--term-tab-active-fg', '#ffffff');
      root.style.setProperty('--term-tab-active-shadow', '0 -2px 6px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--term-badge-bg', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--term-menu-bg', theme.ui.menuBg || '#25061b');
      root.style.setProperty('--term-menu-item-fg', '#dfdbd2');
      root.style.setProperty('--term-menu-item-hover', theme.ui.menuItemHover || '#380c2a');
      root.style.setProperty('--term-menu-item-hover-fg', '#ffffff');
      root.style.setProperty('--term-menu-item-active-bg', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--term-menu-item-active-fg', '#ffffff');
      root.style.setProperty('--term-input-bg', 'rgba(0, 0, 0, 0.35)');
      root.style.setProperty('--term-input-fg', '#ffffff');
      root.style.setProperty('--term-shadow', '0 8px 24px rgba(0, 0, 0, 0.6)');
    }

    // Update opened terminal tabs
    this.tabs.forEach(tab => {
      if (tab.term) {
        tab.term.options.theme = theme.termTheme;
      }
    });

    // Update header label
    const lbl = document.getElementById('current-theme-label');
    if (lbl) lbl.textContent = theme.name;

    // Update menu active state
    document.querySelectorAll('.theme-menu-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-theme') === theme.id);
    });

    // Ensure theme menu is closed immediately after selecting a theme
    const themeMenu = document.getElementById('standalone-theme-menu');
    if (themeMenu) {
      themeMenu.classList.remove('open');
    }
  }

  setupThemeMenu() {
    const btnTheme = document.getElementById('btn-standalone-theme');
    const themeMenu = document.getElementById('standalone-theme-menu');
    const themeList = document.getElementById('theme-menu-list');
    const searchInput = document.getElementById('theme-search-input');
    const countBadge = document.getElementById('theme-count-badge');

    if (!themeList) return;

    const themeEntries = Object.values(TERMINAL_THEMES);
    if (countBadge) {
      countBadge.textContent = `${themeEntries.length} themes`;
    }

    const renderList = (filterQuery = '') => {
      themeList.innerHTML = '';
      const query = filterQuery.trim().toLowerCase();
      const filtered = themeEntries.filter(t => {
        if (!query) return true;
        return t.name.toLowerCase().includes(query) || t.id.toLowerCase().includes(query);
      });

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.style.padding = '12px 8px';
        empty.style.textAlign = 'center';
        empty.style.fontSize = '11px';
        empty.style.color = 'var(--term-fg-muted)';
        empty.textContent = 'No matching themes found';
        themeList.appendChild(empty);
        return;
      }

      filtered.forEach(theme => {
        const item = document.createElement('button');
        item.className = `theme-menu-item ${theme.id === this.currentThemeId ? 'active' : ''}`;
        item.setAttribute('data-theme', theme.id);
        item.innerHTML = `
          <span class="theme-swatch-circle" style="background: ${theme.swatch};"></span>
          <span class="theme-name-label">${theme.name}</span>
          <span class="theme-active-icon">✓</span>
        `;
        themeList.appendChild(item);
      });
    };

    renderList();

    // Event delegation on themeList to reliably capture all item clicks
    themeList.addEventListener('click', (e) => {
      const item = e.target.closest('.theme-menu-item');
      if (!item) return;
      e.stopPropagation();
      e.preventDefault();
      const themeId = item.getAttribute('data-theme');
      if (themeId) {
        this.setTheme(themeId);
        if (themeMenu) {
          themeMenu.classList.remove('open');
        }
        // Return focus to active terminal
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab && activeTab.term) {
          activeTab.term.focus();
        }
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderList(e.target.value);
      });
      searchInput.addEventListener('click', (e) => e.stopPropagation());
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (themeMenu) themeMenu.classList.remove('open');
        }
      });
    }

    if (btnTheme && themeMenu) {
      btnTheme.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = themeMenu.classList.toggle('open');
        if (isOpen && searchInput) {
          searchInput.value = '';
          renderList();
          setTimeout(() => searchInput.focus(), 50);
        }
      });

      document.addEventListener('click', (e) => {
        if (!themeMenu.contains(e.target) && e.target !== btnTheme) {
          themeMenu.classList.remove('open');
        }
      });
    }
  }

  createTab(title = null, initialCwd = null) {
    this.tabCounter++;
    const tabId = `tab-${this.tabCounter}`;
    const tabNumber = this.tabCounter;

    // Determine cwd for this tab
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    const cwd = initialCwd || (activeTab ? activeTab.cwd : this.currentCwd) || null;

    // Determine title for this tab
    let tabTitle = title;
    if (!tabTitle) {
      if (cwd) {
        const folderName = cwd.split(/[\\/]/).filter(Boolean).pop();
        tabTitle = folderName || `Terminal ${tabNumber}`;
      } else {
        tabTitle = `Terminal ${tabNumber}`;
      }
    }

    // 1. Create Tab DOM Pill
    const tabEl = document.createElement('div');
    tabEl.className = 'term-tab';
    tabEl.setAttribute('data-tab-id', tabId);
    tabEl.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
      </svg>
      <span class="term-tab-title" title="${tabTitle}">${tabTitle}</span>
      <button class="term-tab-close" title="Close Tab (Ctrl+W)">✕</button>
    `;

    // Tab Click Event
    tabEl.addEventListener('click', (e) => {
      if (e.target.closest('.term-tab-close')) return;
      this.switchTab(tabId);
    });

    // Close Tab Event
    const closeBtn = tabEl.querySelector('.term-tab-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tabId);
    });

    this.tabsListEl.appendChild(tabEl);

    // 2. Create Viewport Container
    const viewportEl = document.createElement('div');
    viewportEl.className = 'tab-viewport';
    viewportEl.id = `viewport-${tabId}`;
    this.viewportsContainerEl.appendChild(viewportEl);

    // 3. Initialize xterm.js instance
    const term = new Terminal({
      theme: this.currentTheme.termTheme,
      fontFamily: '"Ubuntu Mono", "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
      fontSize: 13.5,
      lineHeight: 1.25,
      cursorBlink: true,
      cursorStyle: 'block',
      convertEol: true,
      scrollback: 5000,
      allowTransparency: true
    });

    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(viewportEl);

    // Keystroke input
    term.onData((data) => {
      window.api.writeTerminal(data, tabId);
    });

    // Copy & Paste setup (Keyboard shortcuts, Right-click Context Menu, Middle click)
    this.setupCopyPaste(term, viewportEl, tabId);

    // Store Tab Object
    const tabObj = {
      id: tabId,
      number: tabNumber,
      title: tabTitle,
      term,
      fitAddon,
      tabEl,
      viewportEl,
      cwd
    };

    this.tabs.push(tabObj);

    // Start Backend Session & update folder name when session returns resolved cwd
    window.api.startTerminal(cwd, tabId).then(res => {
      if (res && res.cwd) {
        this.updateTabFolder(tabId, res.cwd);
      }
    }).catch(() => {});

    // Switch to new tab
    this.switchTab(tabId);

    return tabObj;
  }

  updateTabFolder(tabId, cwd) {
    if (!cwd) return;
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    tab.cwd = cwd;
    const folderName = cwd.split(/[\\/]/).filter(Boolean).pop() || cwd;
    tab.title = folderName;

    const titleEl = tab.tabEl.querySelector('.term-tab-title');
    if (titleEl) {
      titleEl.textContent = folderName;
      titleEl.title = `${folderName} (${cwd})`;
    }

    if (this.activeTabId === tabId) {
      this.updateHeaderCwd(cwd);
    }
  }

  switchTab(tabId) {
    const targetTab = this.tabs.find(t => t.id === tabId);
    if (!targetTab) return;

    this.activeTabId = tabId;

    // Update Tab DOM states
    this.tabs.forEach(t => {
      if (t.id === tabId) {
        t.tabEl.classList.add('active');
        t.viewportEl.classList.add('active');
      } else {
        t.tabEl.classList.remove('active');
        t.viewportEl.classList.remove('active');
      }
    });

    // Update Header Pill & Window Title to match this active tab's project location
    this.updateHeaderCwd(targetTab.cwd);

    // Auto scroll tab into view
    targetTab.tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

    // Fit & Focus
    setTimeout(() => {
      targetTab.fitAddon.fit();
      targetTab.term.focus();
    }, 40);
  }

  closeTab(tabId) {
    const tabIndex = this.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = this.tabs[tabIndex];

    // If only 1 tab is open, close the external window
    if (this.tabs.length === 1) {
      window.api.closeTerminalWindow();
      return;
    }

    // Clean up DOM and xterm
    tab.tabEl.remove();
    tab.viewportEl.remove();
    try {
      tab.term.dispose();
    } catch (e) { /* ignore */ }

    // Tell backend to destroy child session
    window.api.closeTerminalTab(tabId);

    this.tabs.splice(tabIndex, 1);

    // If active tab was closed, switch to adjacent tab
    if (this.activeTabId === tabId) {
      const nextIndex = Math.min(tabIndex, this.tabs.length - 1);
      if (this.tabs[nextIndex]) {
        this.switchTab(this.tabs[nextIndex].id);
      }
    }
  }

  nextTab() {
    if (this.tabs.length <= 1) return;
    const currentIndex = this.tabs.findIndex(t => t.id === this.activeTabId);
    const nextIndex = (currentIndex + 1) % this.tabs.length;
    this.switchTab(this.tabs[nextIndex].id);
  }

  prevTab() {
    if (this.tabs.length <= 1) return;
    const currentIndex = this.tabs.findIndex(t => t.id === this.activeTabId);
    const prevIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
    this.switchTab(this.tabs[prevIndex].id);
  }

  switchToTabIndex(index) {
    if (index >= 0 && index < this.tabs.length) {
      this.switchTab(this.tabs[index].id);
    }
  }

  fitActive() {
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (activeTab && activeTab.fitAddon) {
      try {
        activeTab.fitAddon.fit();
      } catch (e) { /* ignore */ }
    }
  }

  sendQuickCommand(cmd) {
    if (!this.activeTabId) return;
    window.api.writeTerminal(cmd + '\r', this.activeTabId);
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (activeTab) {
      activeTab.term.focus();
    }
  }

  clearActive() {
    if (!this.activeTabId) return;
    window.api.clearTerminal(this.activeTabId);
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (activeTab) {
      activeTab.term.focus();
    }
  }

  updateHeaderCwd(repoPath) {
    if (repoPath) {
      const folderName = repoPath.split(/[\\/]/).filter(Boolean).pop() || repoPath;
      if (this.cwdTextEl) this.cwdTextEl.textContent = folderName;
      if (this.cwdBadgeEl) this.cwdBadgeEl.title = repoPath;
      document.title = `Git Nexus Terminal - ${repoPath}`;
    } else {
      if (this.cwdTextEl) this.cwdTextEl.textContent = 'Terminal';
      if (this.cwdBadgeEl) this.cwdBadgeEl.title = 'Git Nexus Terminal';
      document.title = 'Git Nexus Terminal';
    }
  }

  setCwd(repoPath) {
    this.currentCwd = repoPath;
    this.updateHeaderCwd(repoPath);
  }

  setupShortcuts() {
    window.addEventListener('keydown', (e) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. New Tab: Ctrl+T or Ctrl+Shift+T
      if (isCtrlOrMeta && e.key.toLowerCase() === 't') {
        e.preventDefault();
        this.createTab();
        return;
      }

      // 2. Close Tab: Ctrl+W or Ctrl+Shift+W
      if (isCtrlOrMeta && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (this.activeTabId) {
          this.closeTab(this.activeTabId);
        }
        return;
      }

      // 3. Tab Switching: Ctrl+Tab (next) / Ctrl+Shift+Tab (prev)
      if (isCtrlOrMeta && e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          this.prevTab();
        } else {
          this.nextTab();
        }
        return;
      }

      // 4. Tab Switching with PageUp / PageDown
      if (isCtrlOrMeta && (e.key === 'PageDown' || e.key === 'pagedown')) {
        e.preventDefault();
        this.nextTab();
        return;
      }
      if (isCtrlOrMeta && (e.key === 'PageUp' || e.key === 'pageup')) {
        e.preventDefault();
        this.prevTab();
        return;
      }

      // 5. Direct tab switch: Ctrl+1 through Ctrl+9
      if (isCtrlOrMeta && !e.shiftKey && e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        if (num > 0 && num <= this.tabs.length) {
          e.preventDefault();
          this.switchToTabIndex(num - 1);
          return;
        }
      }
    });
  }

  setupCopyPaste(term, viewportEl, tabId) {
    // 1. Keyboard Copy & Paste Shortcuts
    term.attachCustomKeyEventHandler((event) => {
      // Preserve Tab key handling
      if (event.key === 'Tab' && event.type === 'keydown') {
        window.api.writeTerminal('\t', tabId);
        event.preventDefault();
        return false;
      }

      if (event.type === 'keydown') {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        const keyLower = event.key.toLowerCase();

        // Copy: Ctrl+C / Cmd+C / Ctrl+Shift+C / Cmd+Shift+C
        if (isCtrlOrCmd && keyLower === 'c') {
          if (term.hasSelection()) {
            const selection = term.getSelection();
            if (selection) {
              navigator.clipboard.writeText(selection);
            }
            event.preventDefault();
            return false; // Suppress SIGINT interrupt signal when copying text
          } else if (event.shiftKey) {
            event.preventDefault();
            return false;
          }
          // If no selection and plain Ctrl+C, let xterm send SIGINT (\x03)
          return true;
        }

        // Paste: Ctrl+V / Cmd+V / Ctrl+Shift+V / Cmd+Shift+V
        if (isCtrlOrCmd && keyLower === 'v') {
          event.preventDefault();
          navigator.clipboard.readText().then((text) => {
            if (text) {
              window.api.writeTerminal(text, tabId);
            }
          }).catch((err) => {
            console.error('Clipboard paste failed:', err);
          });
          return false;
        }
      }

      return true;
    });

    // 2. Right-Click Context Menu & Auto-Copy on Right Click
    viewportEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      // Auto-copy selection if text is selected when right clicking
      if (term.hasSelection()) {
        const selectedText = term.getSelection();
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
        }
      }

      const menu = this.getOrCreateContextMenu();
      const btnCopy = menu.querySelector('#ctx-term-copy');
      const btnPaste = menu.querySelector('#ctx-term-paste');
      const btnSelectAll = menu.querySelector('#ctx-term-select-all');
      const btnClear = menu.querySelector('#ctx-term-clear');

      btnCopy.disabled = !term.hasSelection();

      btnCopy.onclick = () => {
        if (term.hasSelection()) {
          navigator.clipboard.writeText(term.getSelection());
        }
        menu.classList.remove('open');
        term.focus();
      };

      btnPaste.onclick = () => {
        menu.classList.remove('open');
        navigator.clipboard.readText().then((text) => {
          if (text) {
            window.api.writeTerminal(text, tabId);
          }
        }).catch((err) => console.error(err));
        term.focus();
      };

      btnSelectAll.onclick = () => {
        menu.classList.remove('open');
        term.selectAll();
        term.focus();
      };

      btnClear.onclick = () => {
        menu.classList.remove('open');
        this.clearActive();
        term.focus();
      };

      menu.classList.add('open');

      const menuWidth = menu.offsetWidth || 175;
      const menuHeight = menu.offsetHeight || 140;
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 8;
      }
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 8;
      }

      menu.style.left = `${Math.max(5, x)}px`;
      menu.style.top = `${Math.max(5, y)}px`;
    });

    // 3. Middle-Click Paste
    viewportEl.addEventListener('auxclick', (e) => {
      if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        navigator.clipboard.readText().then((text) => {
          if (text) {
            window.api.writeTerminal(text, tabId);
          }
        }).catch((err) => console.error(err));
      }
    });
  }

  getOrCreateContextMenu() {
    let menu = document.getElementById('terminal-context-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'terminal-context-menu';
      menu.className = 'terminal-context-menu';
      menu.innerHTML = `
        <button class="context-menu-item" id="ctx-term-copy">
          <span>📋 Copy</span>
          <span class="context-menu-shortcut">Ctrl+C</span>
        </button>
        <button class="context-menu-item" id="ctx-term-paste">
          <span>📥 Paste</span>
          <span class="context-menu-shortcut">Ctrl+V</span>
        </button>
        <div class="context-menu-divider"></div>
        <button class="context-menu-item" id="ctx-term-select-all">
          <span>🔍 Select All</span>
        </button>
        <button class="context-menu-item" id="ctx-term-clear">
          <span>🧹 Clear Terminal</span>
        </button>
      `;
      document.body.appendChild(menu);

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
          menu.classList.remove('open');
        }
      });

      window.addEventListener('resize', () => menu.classList.remove('open'));
    }
    return menu;
  }
}

// Initialise Controller on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  const manager = new MultiTabTerminalManager();

  // Read URL query params for initial cwd/repo
  const params = new URLSearchParams(window.location.search);
  const initialCwd = params.get('cwd') || null;
  if (initialCwd) {
    manager.currentCwd = initialCwd;
  }

  manager.init();

  // Header Actions
  const btnClear = document.getElementById('btn-standalone-clear');
  const btnPin = document.getElementById('btn-standalone-pin');
  const btnSystem = document.getElementById('btn-standalone-system-term');
  const systemMenu = document.getElementById('standalone-system-menu');

  // Clear Terminal
  if (btnClear) {
    btnClear.addEventListener('click', () => manager.clearActive());
  }

  // Pin Always-on-Top
  let isPinned = false;
  if (btnPin) {
    btnPin.addEventListener('click', async () => {
      isPinned = !isPinned;
      const res = await window.api.setAlwaysOnTop(isPinned);
      if (res && res.success) {
        btnPin.classList.toggle('pinned', isPinned);
        const pinText = document.getElementById('pin-text');
        if (pinText) pinText.textContent = isPinned ? 'Pinned' : 'Pin';
      }
    });
  }

  // System Terminals Dropdown
  if (btnSystem && systemMenu) {
    btnSystem.addEventListener('click', (e) => {
      e.stopPropagation();
      systemMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!systemMenu.contains(e.target) && e.target !== btnSystem) {
        systemMenu.classList.remove('open');
      }
    });

    // Update context menu label based on current status
    const updateContextMenuStatus = async () => {
      if (window.api.isContextMenuRegistered) {
        const isReg = await window.api.isContextMenuRegistered();
        const lbl = document.getElementById('label-context-menu');
        if (lbl) lbl.textContent = isReg ? 'Remove Right-Click Context Menu' : 'Add Right-Click Context Menu';
      }
    };
    updateContextMenuStatus();

    systemMenu.querySelectorAll('.system-term-item').forEach(item => {
      item.addEventListener('click', async () => {
        const action = item.getAttribute('data-action');
        systemMenu.classList.remove('open');

        if (action === 'create-shortcut') {
          if (window.api.createDesktopShortcut) {
            const res = await window.api.createDesktopShortcut();
            alert(res.message || res.error);
          }
        } else if (action === 'toggle-context-menu') {
          if (window.api.isContextMenuRegistered) {
            const isReg = await window.api.isContextMenuRegistered();
            if (isReg) {
              const res = await window.api.unregisterContextMenu();
              alert(res.message || 'Removed from context menu');
            } else {
              const res = await window.api.registerContextMenu();
              alert(res.message || 'Added to context menu');
            }
            await updateContextMenuStatus();
          }
        } else {
          const type = item.getAttribute('data-type');
          await window.api.openSystemTerminal(manager.currentCwd, type);
        }
      });
    });
  }

  // Enable horizontal mouse wheel scrolling on tabs list
  const tabsList = document.getElementById('terminal-tabs-list');
  if (tabsList) {
    tabsList.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        tabsList.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }
});
