# 🔧 Solución: Página en Blanco en Vercel

## El Problema
Tu app se desplegó correctamente en Vercel pero aparece una página en blanco. Esto sucede porque el archivo `vercel.json` estaba interfiriendo con la configuración automática.

## ✅ Solución Paso a Paso

### 1. **Eliminar la configuración conflictiva**

El archivo `vercel.json` ya fue renombrado a `vercel.json.backup`. 

Si vuelves a tener problemas, asegúrate de que **NO exista** el archivo `vercel.json` en la raíz del proyecto.

### 2. **Configurar manualmente en Vercel Dashboard**

1. **Ve a tu proyecto en Vercel:**
   https://vercel.com/excelpracticos-projects/prestamos

2. **Click en "Settings"** (arriba)

3. **Click en "General"** (menú izquierdo)

4. **Scroll hasta "Build & Development Settings"**

5. **Configura así:**
   ```
   Framework Preset: Other
   Build Command: expo export -p web
   Output Directory: dist
   Install Command: npm install (dejar por defecto)
   ```

6. **IMPORTANTE:** Marca la casilla "Override" si aparece

7. **Click en "Save"** en cada sección

### 3. **Forzar un nuevo deploy**

1. **Ve a la pestaña "Deployments"**

2. **Encuentra el último deployment**

3. **Click en los 3 puntos (⋮)** a la derecha

4. **Click en "Redeploy"**

5. **Marca "Use existing Build Cache"** como **NO**

6. **Click en "Redeploy"**

### 4. **Espera el nuevo build**

El proceso tomará 2-3 minutos. Verás en los logs:

```
✓ Expo
✓ Optimizing...
✓ Exported static files
Build Completed
```

### 5. **Verifica que funcione**

Una vez completado, tu app estará disponible en:
https://prestamos-o64920vnn-excelpracticos-projects.vercel.app/

Deberías ver la pantalla de login de PréstamosApp.

---

## 🔍 Verificación Local

Antes de volver a desplegar, puedes verificar que el build funcione localmente:

```bash
# Limpiar todo
rm -rf dist
rm -rf .expo
rm -rf node_modules

# Reinstalar
npm install

# Build local
npm run build

# Verificar que se creó la carpeta dist con archivos
ls dist
```

Deberías ver archivos como:
- `index.html`
- `_expo/`
- `assets/`
- Varios archivos `.js`

---

## 📝 Resumen de Cambios Realizados

1. ✅ Renombrado `vercel.json` → `vercel.json.backup`
2. ✅ Actualizado `package.json` con script `vercel-build`
3. ✅ Creado `web/index.html` como template
4. ✅ Creado `metro.config.js` para configuración
5. ✅ Actualizado README con instrucciones

---

## 💡 Si Sigue sin Funcionar

### Opción A: Limpiar todo en Vercel
1. Settings → General → Scroll al final
2. Click en "Delete Project"
3. Vuelve a importar desde GitHub
4. Usa la configuración manual del paso 2

### Opción B: Verificar archivos generados
En los logs de Vercel, busca:
```
[expo] Exporting...
[expo] Bundle React Native code
[expo] Export complete!
```

Si no ves estos mensajes, el problema está en el build de Expo.

### Opción C: Variables de entorno
Si usas variables de entorno, agrégalas en:
Settings → Environment Variables

---

## 🎯 Configuración Final Correcta

**vercel.json:** ❌ NO DEBE EXISTIR (o estar renombrado)

**Vercel Dashboard Settings:**
```
Framework Preset: Other
Build Command: expo export -p web
Output Directory: dist
```

**package.json debe tener:**
```json
"scripts": {
  "build": "expo export -p web",
  "vercel-build": "expo export -p web"
}
```

---

## 📞 Siguiente Paso

**AHORA MISMO:** Ve a tu dashboard de Vercel y sigue los pasos 2 y 3 de arriba para reconfigurar y redesplegar.

Link directo: https://vercel.com/excelpracticos-projects/prestamos/settings
