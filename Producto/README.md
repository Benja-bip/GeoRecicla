# 🌱 GeoRecicla

GeoRecicla es una aplicación web que ayuda a las personas a reciclar de forma más fácil y consciente. Su función principal es un **mapa interactivo** donde los usuarios pueden filtrar puntos de reciclaje según el tipo de material (plástico, vidrio, papel, metal, electrónicos, etc.) y encontrar el punto más cercano a su ubicación.

Tanto **usuarios individuales** como **empresas** pueden publicar nuevos puntos de reciclaje en el mapa:

- 👤 Los **usuarios** pueden agregar hasta **2 puntos** de reciclaje.
- 🏢 Las **empresas** pueden agregar **puntos ilimitados**.

Además, los usuarios pueden **crear materiales personalizados** desde la sección "Identifica tu material", asignándoles un ícono, descripción y tips de reciclaje. Estos materiales quedan disponibles como filtros del mapa y se persisten en el navegador.

GeoRecicla también cuenta con un **blog informativo** donde la comunidad puede aprender sobre cómo reciclar correctamente cada tipo de material.

Las funcionalidades de agregar puntos, aplicar filtros o crear materiales personalizados solo están disponibles para usuarios autenticados. El sistema de inicio de sesión permite:

- Iniciar sesión con **cuenta de Google** o con **correo y contraseña**.
- **Recuperar contraseña** en caso de olvido.
- **Registrarse** como usuario particular o como empresa, cada uno con su propio tipo de perfil.

Cada perfil (usuario o empresa) muestra los puntos de reciclaje que ha agregado, con la opción de **eliminarlos** cuando ya no estén disponibles.

---

## 🚀 Tecnologías utilizadas

### Frontend
- **React 18** + **TypeScript**
- **Vite** — bundler y entorno de desarrollo
- **React Router DOM** — manejo de rutas
- **Tailwind CSS** + **tailwindcss-animate** — estilos
- **shadcn/ui** (basado en **Radix UI**) — componentes de interfaz
- **Framer Motion** — animaciones
- **Lucide React** — iconografía
- **React Hook Form** + **Zod** — formularios y validación
- **TanStack Query (React Query)** — manejo de estado del servidor
- **Sonner** — notificaciones (toasts)
- **Recharts** — gráficos
- **date-fns** — manejo de fechas

### Mapas
- **Leaflet** + **React Leaflet** — mapa interactivo y geolocalización
- **Nominatim / OpenStreetMap API** — geocodificación de direcciones (búsqueda por texto)

### Backend / Base de datos
- **Supabase** — autenticación (correo y Google), base de datos PostgreSQL y almacenamiento de imágenes

### Testing y calidad de código
- **Vitest** + **Testing Library** — pruebas unitarias
- **ESLint** — linting
- **TypeScript ESLint** — reglas de tipado

---

## 📋 Requisitos previos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- **Node.js** v18 o superior
- **npm** v9 o superior
- Una cuenta en [Supabase](https://supabase.com) con un proyecto creado (para la base de datos y autenticación)

---

## ⚙️ Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables (disponibles en el panel de tu proyecto en Supabase, sección *Project Settings → API*):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

> ⚠️ Este archivo **no debe subirse al repositorio**. Ya está incluido en `.gitignore`.

Para el despliegue en producción (Vercel), configura estas mismas variables en *Settings → Environment Variables* del proyecto en Vercel.

---

## 📁 Estructura del proyecto

```
Producto/
├── public/                # Archivos estáticos
├── src/
│   ├── assets/             # Imágenes y recursos
│   ├── components/         # Componentes reutilizables (UI, diálogos, mapa, etc.)
│   ├── hooks/               # Hooks personalizados (useAuth, useProfile, useCustomMaterials, etc.)
│   ├── integrations/        # Configuración de Supabase
│   ├── lib/                 # Utilidades y datos (materials-data, points, comunas, etc.)
│   ├── pages/                # Páginas de la app (Index, Auth, Profile, Company, Blog...)
│   ├── test/                 # Pruebas unitarias
│   ├── App.tsx               # Configuración de rutas principales
│   └── main.tsx               # Punto de entrada de la aplicación
├── supabase/                  # Configuración del backend
├── package.json
└── vite.config.ts
```

---

## 🛠️ Cómo ejecutar el proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar pruebas
npm run test
```

---

## 👥 Equipo de desarrollo

| Nombre | Rol |
|---|---|
| Benjamín Palma | QA y backend |
| Alen Vergara | Product Owner y Frontend |
| Miguel Vergara | Scrum master |

---

## 📌 Estado del proyecto

Proyecto académico desarrollado para DuocUC, orientado a fomentar el reciclaje y la conciencia ambiental mediante tecnología.