# 💰 PréstamosApp

Sistema de gestión de préstamos con validación de pagos desarrollado con React Native (Expo) y TypeScript.

## 🌐 Deploy en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/PrestamosApp)

### Configuración para Vercel:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

La aplicación está optimizada para ejecutarse como Progressive Web App (PWA) en Vercel.

## 📋 Características

### Autenticación
- Login y registro de usuarios
- Roles: Administrador y Usuario
- Sesión persistente con Expo SecureStore
- Datos de demostración precargados

### Panel Admin
- Dashboard con métricas (ingresos, créditos concedidos/pagados/pendientes)
- Próximos cobros
- CRUD completo de clientes
- Gestión de préstamos con tabla de amortización automática
- Registro de cobros
- Validación de pagos
- Módulo de ingresos y gastos
- Configuración del sistema

### Panel Usuario
- Ver sus préstamos activos
- Historial de pagos
- Subir comprobantes de pago
- Notificaciones

### Sistema de Préstamos
- **Tipos de cuota**: Diario, Semanal, Quincenal, Mensual
- **Cálculo automático**: Tabla de amortización con sistema francés
- **Intereses**: Tasa anual convertida automáticamente según periodicidad
- **Fines de semana**: Opción de omitir sábados/domingos con ajuste configurable
- **Seguimiento**: Estado de cada cuota (pendiente, pagado, parcial, vencido)

## 🚀 Instalación

### Prerrequisitos
- Node.js 16+ instalado
- Expo Go app en tu dispositivo móvil (iOS/Android)
- npm o yarn

### Pasos

1. **Instalar dependencias**:
```bash
cd PrestamosApp
npm install
```

2. **Iniciar el servidor de desarrollo**:
```bash
npm start
```

3. **Abrir en dispositivo**:
   - Escanea el código QR con la app **Expo Go** (Android) o **Cámara** (iOS)
   - O presiona `a` para abrir en emulador Android
   - O presiona `i` para abrir en simulador iOS
   - O presiona `w` para abrir en navegador web

## 👥 Credenciales Demo

### Administrador
- **Email**: `admin@demo.com`
- **Contraseña**: `Admin123!`

### Usuario
- **Email**: `user@demo.com`
- **Contraseña**: `User123!`

## 📁 Estructura del Proyecto

```
PrestamosApp/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Loading.tsx
│   ├── context/             # Context API
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── data/                # Datos quemados
│   │   └── demoData.ts
│   ├── navigation/          # Navegación
│   │   └── index.tsx
│   ├── screens/             # Pantallas
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ClientesScreen.tsx
│   │   └── ...
│   ├── services/            # Servicios
│   │   └── storageService.ts
│   ├── theme/               # Tema y estilos
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── utils/               # Utilidades
│       ├── amortizacion.ts
│       └── dateUtils.ts
├── App.tsx                  # Componente principal
└── package.json
```

## 🎨 Diseño

La aplicación utiliza un **diseño minimalista** con:
- Paleta de colores neutra
- Tipografía limpia y legible
- Espaciado generoso
- Tarjetas con sombras suaves
- Botones redondeados
- Iconografía simple

## 🔧 Funcionalidades Técnicas

### Sistema de Amortización
- **Algoritmo**: Sistema Francés (cuota fija)
- **Fórmula**: `C = P * [i * (1+i)^n] / [(1+i)^n - 1]`
- **Tasa periódica**: Se ajusta automáticamente según el tipo de cuota
  - Mensual: `tasa_anual / 12`
  - Quincenal: `tasa_anual / 26`
  - Semanal: `tasa_anual / 52`
  - Diario: `tasa_anual / 365`

### Manejo de Fechas
- Biblioteca: `date-fns`
- Omisión de fines de semana configurable
- Ajuste automático: adelantar al lunes o retroceder al viernes
- Cálculo preciso según periodicidad

### Almacenamiento
- **AsyncStorage**: Datos generales (clientes, préstamos, pagos, etc.)
- **SecureStore**: Sesión de usuario (segura)
- Todos los datos persisten localmente

## 📱 Pantallas Principales

### Admin
1. **Dashboard**: Métricas, próximos cobros, acciones rápidas
2. **Clientes**: Lista, búsqueda, CRUD completo
3. **Préstamos**: Crear con cálculo automático, ver detalles
4. **Cobros**: Registrar pagos, subir comprobantes
5. **Ingresos/Gastos**: Registro de transacciones
6. **Configuración**: Ajustes del sistema

### Usuario
1. **Mis Préstamos**: Ver préstamos activos
2. **Pagos**: Subir comprobantes
3. **Perfil**: Información personal

## 🔄 Datos Quemados

La aplicación se inicializa automáticamente con:
- 2 usuarios (admin y user)
- 4 clientes de ejemplo
- 4 préstamos con diferentes configuraciones
- 3 pagos registrados
- Configuración predeterminada

Los datos se cargan al iniciar sesión por primera vez.

## 🛠️ Tecnologías

- **React Native**: Framework móvil
- **Expo**: Plataforma de desarrollo
- **TypeScript**: Tipado estático
- **React Navigation**: Navegación (Stack + Bottom Tabs)
- **Context API**: Gestión de estado
- **AsyncStorage**: Almacenamiento local
- **SecureStore**: Almacenamiento seguro
- **date-fns**: Manejo de fechas

## 📝 Próximas Funcionalidades (TODO)

- [ ] Generación de PDF (tickets y reportes)
- [ ] Compartir vía WhatsApp
- [ ] Subida de comprobantes con expo-image-picker
- [ ] Push notifications
- [ ] Gráficas y estadísticas avanzadas
- [ ] Exportar datos a Excel/CSV
- [ ] Tema oscuro
- [ ] Integración con backend real (API)
- [ ] Recordatorios de pagos
- [ ] Calculadora de préstamos

## 🐛 Solución de Problemas

### Error al iniciar
```bash
# Limpiar caché
npm start -- --clear
```

### Dependencias faltantes
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Datos no se cargan
- Los datos se inicializan automáticamente al primer login
- Si persiste el problema, desinstala y reinstala la app

## 📄 Licencia

Este proyecto es de código abierto para fines educativos y de demostración.

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando Expo + TypeScript

---

**Nota**: Esta es una aplicación de demostración. Para producción, se recomienda implementar:
- Backend con base de datos real
- Autenticación segura (JWT, OAuth)
- Validaciones de seguridad adicionales
- Tests unitarios y de integración
- Manejo de errores robusto
