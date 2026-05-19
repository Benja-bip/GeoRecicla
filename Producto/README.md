# GeoRecicla - App de Reciclaje

Una aplicación web moderna para encontrar puntos de reciclaje cercanos, identificar materiales reciclables y facilitar el proceso de reciclaje con sistema de autenticación de usuarios.

## 🚀 Características

- **Mapa Interactivo**: Visualiza puntos de reciclaje en tu área con Leaflet
- **Identificación de Materiales**: Aprende qué materiales se pueden reciclar
- **Lista de Puntos Limpios**: Encuentra centros de reciclaje cercanos
- **Gestión de Puntos**: Agrega, edita y elimina puntos de reciclaje (usuarios autenticados)
- **Autenticación de Usuarios**: Registro e inicio de sesión con email/contraseña y Google OAuth
- **Blog**: Información y consejos sobre reciclaje
- **Interfaz Moderna**: Diseño responsive con tema ecológico
- **Base de Datos**: Integración con Supabase con RLS

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Mapas**: Leaflet + React Leaflet
- **Estado**: TanStack Query
- **Autenticación**: Supabase Auth + Lovable Cloud Auth
- **Animaciones**: Framer Motion
- **Backend**: Supabase (Database + Storage + Auth)

## 📦 Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```

   Edita `.env` con tus credenciales de Supabase:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_anonima_de_supabase
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🔧 Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Crea una tabla `puntos_limpios` con la siguiente estructura:
   ```sql
   CREATE TABLE puntos_limpios (
     id SERIAL PRIMARY KEY,
     nombre TEXT NOT NULL,
     direccion TEXT NOT NULL,
     latitud DECIMAL NOT NULL,
     longitud DECIMAL NOT NULL,
     tipo_material TEXT NOT NULL
   );
   ```

3. Configura la autenticación en Supabase Dashboard
4. Para Google OAuth, configura las credenciales de Google en Authentication > Providers

## 📱 Uso

- **Sin autenticación**: Puedes navegar y ver información básica
- **Con cuenta**: Acceso completo a todas las funcionalidades
- **Registro**: Crea una cuenta con email/contraseña o Google
- **Inicio de sesión**: Accede con tus credenciales

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas de la aplicación
├── hooks/              # Hooks personalizados (useAuth)
├── integrations/       # Configuraciones de servicios externos
├── services/           # Servicios de API
└── lib/                # Utilidades
```

## 🎨 Tema

El proyecto utiliza un tema ecológico con colores inspirados en la naturaleza:
- Verde primario (#14563C)
- Azul cielo (#50B3D1)
- Tierra (#8B5A3C)
- Modo oscuro soportado

## 📄 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Vista previa del build
- `npm run lint` - Ejecutar linter
- `npm run test` - Ejecutar tests

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
