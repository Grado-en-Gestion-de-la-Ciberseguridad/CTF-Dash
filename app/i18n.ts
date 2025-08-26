export type Locale = 'en' | 'es'

export const defaultLocale: Locale = 'es'

export const translations = {
  en: {
    nav: {
      title: 'CTF Dashboard',
      logout: 'Logout',
      language: 'Language',
      es: 'ES',
      en: 'EN',
    },
    roles: {
      admin: 'admin',
      staff: 'staff',
      team: 'team',
    },
    home: {
      title: 'Campus Security CTF',
      subtitle:
        'A hacker has infiltrated campus security systems. Help investigate to identify the hacker, determine stolen documents, and locate their hideout.',
      welcomeBack: 'Welcome back, {name}!',
      teamLabel: 'Team: {team}',
    },
    cards: {
      team: {
        title: 'Team Management',
        desc: 'Register teams and manage participants',
      },
      challenges: {
        title: 'Challenge Rooms',
        desc: 'Access security challenges and submit solutions',
      },
      resources: {
        title: 'Resources Hub',
        desc: 'Access guides, evidence files, and references',
      },
      leaderboard: {
        title: 'Leaderboard',
        desc: 'View team rankings and progress',
      },
      admin: {
        title: 'Admin Panel',
        desc: 'Staff access for managing the event',
      },
      secret: {
        title: '🎮 Secret Terminal',
        desc1: 'KONAMI CODE ACTIVATED! Hidden terminal access unlocked!',
        desc2: 'Find secret phrases for bonus points! 🕵️',
      },
    },
    events: {
      header: 'Challenge Rooms',
      security: {
        title: 'Security Awareness',
        desc: 'Security quiz and phishing email identification',
      },
      password: {
        title: 'Password Security',
        desc: 'Identify weak passwords and security practices',
      },
      osint: {
        title: 'OSINT Investigation',
        desc: 'Research the hacker using open source intelligence',
      },
      crypto: {
        title: 'Cryptography Lab',
        desc: 'Decode encrypted messages and find clues',
      },
    },
    footer: {
      copyright: '© 2025 Campus Security CTF Event. Good luck, investigators!',
      hint:
        'Hint: Classic gamers might know a special sequence of keys... ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️',
      mastered: '🎮 KONAMI CODE MASTER! The secret terminal awaits your investigation...',
    },
    login: {
      title: 'CTF Dashboard',
      subtitle: 'Enter your credentials to access the system',
      usernameLabel: 'Username / Team Name',
      usernamePlaceholder: 'Enter username or team name',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      errorInvalid: 'Invalid username or password',
      errorFailed: 'Login failed. Please try again.',
      login: 'Login',
      loggingIn: 'Logging in...',
    },
    protected: {
      checkingAuth: 'Checking authentication...',
      accessDeniedStaff: 'Access denied. Staff privileges required.',
    },
  },
  es: {
    nav: {
      title: 'Panel de CTF',
      logout: 'Cerrar sesión',
      language: 'Idioma',
      es: 'ES',
      en: 'EN',
    },
    roles: {
      admin: 'administrador',
      staff: 'personal',
      team: 'equipo',
    },
    home: {
      title: 'CTF de Seguridad del Campus',
      subtitle:
        'Un hacker ha infiltrado los sistemas de seguridad del campus. Ayuda a investigar para identificar al hacker, determinar los documentos robados y localizar su escondite.',
      welcomeBack: '¡Bienvenido/a de nuevo, {name}!',
      teamLabel: 'Equipo: {team}',
    },
    cards: {
      team: {
        title: 'Gestión de equipos',
        desc: 'Registrar equipos y gestionar participantes',
      },
      challenges: {
        title: 'Salas de retos',
        desc: 'Accede a los retos de seguridad y envía soluciones',
      },
      resources: {
        title: 'Centro de recursos',
        desc: 'Accede a guías, evidencias y referencias',
      },
      leaderboard: {
        title: 'Clasificación',
        desc: 'Ver clasificación y progreso',
      },
      admin: {
        title: 'Panel de administración',
        desc: 'Acceso del personal para gestionar el evento',
      },
      secret: {
        title: '🎮 Terminal secreta',
        desc1: '¡CÓDIGO KONAMI ACTIVADO! ¡Acceso a terminal oculta desbloqueado!',
        desc2: '¡Encuentra frases secretas para puntos extra! 🕵️',
      },
    },
    events: {
      header: 'Salas de retos',
      security: {
        title: 'Concienciación en seguridad',
        desc: 'Cuestionario de seguridad e identificación de correos de phishing',
      },
      password: {
        title: 'Seguridad de contraseñas',
        desc: 'Identifica contraseñas débiles y prácticas de seguridad deficientes',
      },
      osint: {
        title: 'Investigación OSINT',
        desc: 'Investiga al hacker usando inteligencia de fuentes abiertas',
      },
      crypto: {
        title: 'Laboratorio de criptografía',
        desc: 'Descifra mensajes cifrados y encuentra pistas',
      },
    },
    footer: {
      copyright:
        '© 2025 Evento CTF de Seguridad del Campus. ¡Buena suerte, investigadores/as!',
      hint:
        'Pista: Los gamers clásicos quizá recuerden una secuencia especial de teclas... ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️',
      mastered:
        '🎮 ¡MAESTRO DEL CÓDIGO KONAMI! La terminal secreta espera tu investigación...',
    },
    login: {
      title: 'Panel de CTF',
      subtitle: 'Introduce tus credenciales para acceder al sistema',
      usernameLabel: 'Usuario / Nombre del equipo',
      usernamePlaceholder: 'Introduce el usuario o nombre del equipo',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Introduce la contraseña',
      errorInvalid: 'Usuario o contraseña inválidos',
      errorFailed: 'Error al iniciar sesión. Inténtalo de nuevo.',
      login: 'Iniciar sesión',
      loggingIn: 'Iniciando sesión...',
    },
    protected: {
      checkingAuth: 'Comprobando autenticación...',
      accessDeniedStaff: 'Acceso denegado. Se requieren privilegios de personal.',
    },
  },
} as const
