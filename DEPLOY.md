# 🚀 Instrucciones para Deploy en Vercel

## Pasos para desplegar PréstamosApp en Vercel

### Opción 1: Deploy desde GitHub (Recomendado)

1. **Sube tu código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PrestamosApp"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/PrestamosApp.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Inicia sesión con GitHub
   - Selecciona el repositorio "PrestamosApp"
   - Haz clic en "Import"

3. **Configuración automática:**
   Vercel detectará automáticamente:
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy:**
   - Haz clic en "Deploy"
   - Espera 2-3 minutos
   - ¡Tu app estará en línea!

### Opción 2: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Login en Vercel
vercel login

# Desplegar (en el directorio del proyecto)
vercel

# Para producción
vercel --prod
```

### ⚙️ Configuración incluida:

✅ **package.json** - Scripts de build configurados
✅ **vercel.json** - Configuración de routing para SPA
✅ **.vercelignore** - Archivos excluidos del deploy
✅ **.gitignore** - Archivos excluidos de git
✅ **app.json** - Configuración web de Expo

### 🔍 Verificación Local:

Antes de desplegar, puedes probar el build localmente:

```bash
# Build de producción
npm run build

# Servir localmente (instala serve si no lo tienes)
npm install -g serve
serve dist
```

### 📝 Notas Importantes:

- La app usa **AsyncStorage** en web (localStorage del navegador)
- Los datos demo se cargan automáticamente en el primer acceso
- No requiere backend, todo funciona en el cliente
- La app es una **PWA** (Progressive Web App)

### 🔐 Usuarios Demo:

**Administrador:**
- Email: `admin@demo.com`
- Password: `Admin123!`

**Usuario:**
- Email: `user@demo.com`
- Password: `User123!`

### 🐛 Troubleshooting:

Si el build falla:
1. Verifica que todas las dependencias estén instaladas: `npm install`
2. Limpia la cache: `npx expo start --clear`
3. Verifica que no haya errores de TypeScript: `npx tsc --noEmit`

### 📧 Soporte:

Si tienes problemas con el deploy, verifica:
- Los logs de build en Vercel
- Que todas las variables de entorno estén configuradas (si aplica)
- Que el comando `npm run build` funcione localmente
