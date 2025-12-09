# 🚀 Inicio Rápido - PréstamosApp

## ✅ La aplicación ya está corriendo!

La aplicación se está ejecutando en el Metro Bundler de Expo.

## 📱 Cómo ver la app en tu dispositivo

### Opción 1: Dispositivo móvil físico (Recomendado)

1. **Instala Expo Go** en tu teléfono:
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Escanea el código QR** que aparece en la terminal:
   - Android: Usa la app Expo Go para escanear
   - iOS: Usa la app de Cámara para escanear

3. **Espera** a que se cargue la aplicación

### Opción 2: Navegador Web

En la terminal, presiona la tecla **`w`** para abrir en el navegador web.

### Opción 3: Emulador/Simulador

- **Android**: Presiona **`a`** (requiere Android Studio)
- **iOS**: Presiona **`i`** (requiere Xcode, solo Mac)

## 🔐 Credenciales de Prueba

### Administrador
```
Email: admin@demo.com
Password: Admin123!
```

### Usuario
```
Email: user@demo.com
Password: User123!
```

## 🎯 Funcionalidades Disponibles

### Como Administrador
✅ Dashboard con métricas
✅ Gestión de clientes (ver lista, buscar)
✅ Gestión de préstamos
✅ Ver perfil y cerrar sesión

### Pantallas en Desarrollo
🚧 Formulario de cliente (crear/editar)
🚧 Crear préstamo con cálculo automático
🚧 Registrar cobros
🚧 Detalle de cliente y préstamo
🚧 Ingresos y gastos
🚧 Configuración

## 🛠️ Comandos Útiles

```bash
# Iniciar la app
npm start

# Limpiar caché y reiniciar
npm start -- --clear

# Ver en web
# (Presiona 'w' cuando la app esté corriendo)

# Recargar la app
# (Presiona 'r' cuando la app esté corriendo)

# Detener el servidor
# (Presiona Ctrl+C en la terminal)
```

## ⚙️ Datos Precargados

La aplicación se inicializa automáticamente con:
- ✅ 2 usuarios (admin y user)
- ✅ 4 clientes de ejemplo
- ✅ 4 préstamos con tablas de amortización
- ✅ 3 pagos registrados
- ✅ Configuración por defecto

Los datos se cargan al hacer login por primera vez.

## 🎨 Diseño Minimalista

La app usa una paleta de colores neutra:
- **Primary**: #2C3E50 (azul oscuro)
- **Secondary**: #3498DB (azul)
- **Success**: #27AE60 (verde)
- **Background**: #F8F9FA (gris claro)

## 📂 Estructura del Código

```
src/
├── components/    → Card, Button, Input, Loading
├── context/       → AuthContext, AppContext
├── data/          → Datos quemados (demoData.ts)
├── navigation/    → Configuración de navegación
├── screens/       → Pantallas de la app
├── services/      → storageService (AsyncStorage)
├── theme/         → Colores, tipografía, espaciado
├── types/         → TypeScript interfaces
└── utils/         → amortizacion, dateUtils
```

## 🐛 Solución de Problemas

### La app no carga
1. Presiona `r` para recargar
2. Presiona `shift+m` → "Reload app"
3. Cierra Expo Go y vuelve a escanear el QR

### Error de conexión
- Asegúrate de que tu teléfono y PC estén en la misma red WiFi
- Desactiva temporalmente el firewall si es necesario

### Pantalla en blanco
- Espera unos segundos, puede estar cargando
- Revisa la terminal por errores
- Reinicia con `npm start -- --clear`

## 📖 Próximos Pasos

1. **Prueba el login** con las credenciales demo
2. **Navega** por el Dashboard y ve las métricas
3. **Explora** la lista de clientes
4. **Revisa** los próximos cobros
5. **Mira tu perfil** y cierra sesión

## 💡 Notas Importantes

- ⚠️ Esta es una versión DEMO con datos quemados
- ⚠️ Todas las pantallas no están completamente implementadas
- ⚠️ Los datos se guardan localmente (AsyncStorage)
- ⚠️ Al desinstalar la app, se pierden los datos

## 🔧 Para Desarrollo

Si quieres implementar las pantallas faltantes:
1. Ve a `src/screens/index.tsx`
2. Reemplaza los `PlaceholderScreen` con pantallas completas
3. Sigue el patrón de `LoginScreen.tsx` y `DashboardScreen.tsx`

## 📞 Ayuda

Si encuentras algún error:
1. Lee el mensaje en la terminal
2. Presiona `shift+m` para más opciones
3. Usa `npm start -- --clear` para limpiar caché

---

**¡Disfruta la aplicación! 💰📱**
