# Surtifronteras

Tienda de productos venezolanos (Next.js + Tailwind v4) con carrito y checkout por
WhatsApp, y un panel de administración en `/admin` para editar productos, precios
e imágenes.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

Sin variables de entorno, la tienda funciona con un **catálogo de ejemplo** (no se
puede editar). Para habilitar el panel `/admin` y la edición, configurá las variables
de abajo.

## Variables de entorno

Creá un archivo `.env.local` en la raíz (no se commitea) con:

```bash
# Contraseña del panel /admin
ADMIN_PASSWORD=elegí-una-contraseña-fuerte

# Secreto para firmar la cookie de sesión. Generá uno con:
#   openssl rand -hex 32
SESSION_SECRET=pegá-acá-un-string-random-largo
```

Con solo estas dos ya podés entrar a `/admin`. Para **guardar** cambios y **subir
fotos** necesitás además Postgres y Blob (ver abajo).

## Conectar la base de datos (Postgres / Neon) y las imágenes (Blob) en Vercel

1. Subí el proyecto a Vercel (`vercel` o conectando el repo de GitHub).
2. En el dashboard de Vercel → pestaña **Storage**:
   - **Create Database → Postgres (Neon)**. Al crearla y conectarla al proyecto,
     Vercel inyecta `DATABASE_URL` automáticamente. La tabla `products` se crea sola
     y se **siembra** con el catálogo actual la primera vez.
   - **Create → Blob**. Al conectarlo, Vercel inyecta `BLOB_READ_WRITE_TOKEN`.
3. En **Settings → Environment Variables** agregá `ADMIN_PASSWORD` y `SESSION_SECRET`.
4. Redeploy.

### Para desarrollar local contra esos mismos servicios

```bash
npm i -g vercel
vercel link
vercel env pull .env.local   # trae DATABASE_URL, BLOB_READ_WRITE_TOKEN, etc.
```

## Cómo funciona (arquitectura)

- **Datos**: tabla `products` en Postgres (`lib/db.ts`, SDK de Neon). Si no hay
  `DATABASE_URL`, cae en un **fallback de solo lectura** con el catálogo semilla
  (`lib/seed-data.ts`) — así la tienda nunca se rompe.
- **Imágenes**: se suben a Vercel Blob desde el navegador (client upload,
  `app/api/admin/upload/route.ts`), evitando el límite de 1 MB de los Server Actions.
- **Auth**: contraseña única (`ADMIN_PASSWORD`) + cookie de sesión firmada con `jose`
  (`SESSION_SECRET`), httpOnly, 7 días (`lib/auth.ts`). Cada acción valida la sesión
  del lado del servidor.
- **Sincronización**: al guardar en el panel se llama a `revalidatePath('/')` para que
  la tienda refleje el cambio al instante.

## Configuración del negocio

- **Número de WhatsApp** que recibe los pedidos: `WHATSAPP_NUMBER` en
  `lib/store-data.ts` (por ahora es un placeholder — cambialo por el real).
- **Contacto / horarios** de la tienda: `components/site-footer.tsx`.
