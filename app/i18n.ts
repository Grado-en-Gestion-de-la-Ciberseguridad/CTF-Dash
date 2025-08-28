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
      attendance: 'Attendance',
      calendar: 'Calendar',
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
      events: {
        title: 'Events & Check-in',
        desc: 'Browse calendar, register, and check in',
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
    homeEvents: {
      title: 'Upcoming Events',
      noEvents: 'No upcoming events right now.',
      reg: 'Reg',
      event: 'Event',
      openPage: 'Open Page',
      viewCalendar: 'View calendar',
      goToCheckin: 'Go to Check-in',
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
    admin: {
      tabs: {
        overview: 'Overview',
        submissions: 'Submissions',
        answers: 'Answer Management',
        editor: 'Challenge Editor',
        events: 'Events & Attendance',
      },
      events: {
        createUpdate: 'Create / Update Event',
        field: {
          id: 'id', name: 'name', description: 'description', registration_start: 'registration_start', registration_end: 'registration_end', start_time: 'start_time', end_time: 'end_time', location_name: 'location_name', latitude: 'latitude', longitude: 'longitude', radius_meters: 'radius_meters', is_active: 'is_active'
        },
        save: 'Save Event',
        clear: 'Clear',
        listTitle: 'Events',
        refresh: 'Refresh',
        edit: 'Edit',
        openPage: 'Open Page',
        addLocation: 'Add Location',
        viewLists: 'View Lists',
        exportCsv: 'Export CSV',
        manualCheckin: 'Manual Check-in',
        record: 'Record',
        overrideWindow: 'Override Window',
        registrations: 'Registrations',
        attendance: 'Attendance',
      }
    },
    calendar: {
      title: 'Events Calendar',
      subtitle: 'Register for upcoming events during the registration window and check-in onsite during the event.',
      select: 'Select',
      selectedEvent: 'Selected Event',
      register: 'Register',
      registering: 'Registering…',
      goToCheckin: 'Go to Check-in',
      loading: 'Loading…'
    },
    attendancePage: {
      title: 'Event Attendance',
  subtitle: 'Public check-in page. Your contact details are stored encrypted. No location required.',
      selectEvent: 'Select Event',
      email: 'Email',
      phone: 'Phone',
      attendeeId: 'University/Employee ID',
      yourLocation: 'Your Location',
      notCaptured: 'Not captured',
      captureLocation: 'Capture Location',
      recordAttendance: 'Record Attendance',
      loading: 'Loading events…',
      noEvents: 'No active events available right now.'
    },
    eventPage: {
      registrationNotOpen: 'Registration is not open yet.',
      registrationOpen: 'Registration is open.',
      eventInProgress: 'Event is in progress. Check-in on site.',
      eventEnded: 'This event has ended.',
      register: 'Register',
      checkin: 'Check-In',
      captureLocation: 'Capture Location',
      geofences: 'Geofences',
      loading: 'Loading…'
    }
  },
  es: {
    nav: {
      title: 'Panel de CTF',
      logout: 'Cerrar sesión',
      language: 'Idioma',
      es: 'ES',
      en: 'EN',
      attendance: 'Asistencia',
      calendar: 'Calendario',
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
      events: {
        title: 'Eventos y check-in',
        desc: 'Consulta el calendario, regístrate y haz check-in',
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
    homeEvents: {
      title: 'Próximos eventos',
      noEvents: 'No hay eventos próximos en este momento.',
      reg: 'Registro',
      event: 'Evento',
      openPage: 'Abrir página',
      viewCalendar: 'Ver calendario',
      goToCheckin: 'Ir al check-in',
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
    admin: {
      tabs: {
        overview: 'Resumen',
        submissions: 'Envíos',
        answers: 'Gestión de respuestas',
        editor: 'Editor de retos',
        events: 'Eventos y asistencia',
      },
      events: {
        createUpdate: 'Crear / Actualizar evento',
        field: {
          id: 'id', name: 'nombre', description: 'descripción', registration_start: 'inicio_registro', registration_end: 'fin_registro', start_time: 'inicio_evento', end_time: 'fin_evento', location_name: 'lugar', latitude: 'latitud', longitude: 'longitud', radius_meters: 'radio_metros', is_active: 'activo'
        },
        save: 'Guardar evento',
        clear: 'Limpiar',
        listTitle: 'Eventos',
        refresh: 'Actualizar',
        edit: 'Editar',
        openPage: 'Abrir página',
        addLocation: 'Añadir ubicación',
        viewLists: 'Ver listas',
        exportCsv: 'Exportar CSV',
        manualCheckin: 'Registro manual',
        record: 'Registrar',
        overrideWindow: 'Ignorar ventana',
        registrations: 'Registros',
        attendance: 'Asistencia',
      }
    },
    calendar: {
      title: 'Calendario de eventos',
      subtitle: 'Regístrate durante la ventana de registro y haz check-in en el lugar durante el evento.',
      select: 'Seleccionar',
      selectedEvent: 'Evento seleccionado',
      register: 'Registrar',
      registering: 'Registrando…',
      goToCheckin: 'Ir al check-in',
      loading: 'Cargando…'
    },
    attendancePage: {
      title: 'Asistencia al evento',
      subtitle: 'Página pública de check-in. La ubicación se verifica con la geocerca del evento. Tus datos se almacenan cifrados.',
      selectEvent: 'Selecciona evento',
      email: 'Correo',
      phone: 'Teléfono',
      attendeeId: 'ID Universitario/Laboral',
      yourLocation: 'Tu ubicación',
      notCaptured: 'Sin capturar',
      captureLocation: 'Capturar ubicación',
      recordAttendance: 'Registrar asistencia',
      loading: 'Cargando eventos…',
      noEvents: 'No hay eventos activos en este momento.'
    },
    eventPage: {
      registrationNotOpen: 'El registro aún no está abierto.',
      registrationOpen: 'El registro está abierto.',
      eventInProgress: 'El evento está en curso. Haz check-in en el lugar.',
      eventEnded: 'Este evento ha finalizado.',
      register: 'Registrar',
      checkin: 'Check-in',
      captureLocation: 'Capturar ubicación',
      geofences: 'Geocercas',
      loading: 'Cargando…'
    }
  },
} as const
