# Cómo ver la app Nutrilens en tu PC

## Opción 1: Navegador (la más fácil, sin instalar nada más)

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta:

   ```bash
   npm run web:pc
   ```

   o, si el puerto 8082 falla:

   ```bash
   npx expo start --web
   ```

   Luego pulsa **`w`** en la terminal para abrir en el navegador.

3. Se abrirá en **http://localhost:8082** (o 8081). Si no se abre solo, copia la URL en Chrome o Edge.

---

## Opción 2: Emulador Android (parecido a un celular en la PC)

### Paso 1: Instalar Android Studio

1. Descarga: https://developer.android.com/studio
2. Instala Android Studio (marca la opción **Android Virtual Device**).

### Paso 2: Crear un emulador

1. Abre Android Studio.
2. **More Actions** → **Virtual Device Manager** (o **Tools** → **Device Manager**).
3. **Create Device** → elige un modelo (por ejemplo **Pixel 6**) → **Next**.
4. Descarga una imagen del sistema (por ejemplo **API 34**, **Tiramisu**) → **Next** → **Finish**.

### Paso 3: Usar el emulador con la app

1. En **Virtual Device Manager**, pulsa el botón ▶ (Play) del emulador para iniciarlo.
2. En una terminal, en la carpeta del proyecto:

   ```bash
   npm start
   ```

   Cuando esté listo, pulsa **`a`** para abrir la app en el emulador Android.

---

## Resumen de comandos

| Quiero...              | Comando          |
|------------------------|------------------|
| Ver en el navegador    | `npm run web:pc` |
| Ver en emulador Android| `npm start` → `a`|
| Ver en el celular      | `npm start` → escanear QR con Expo Go |
