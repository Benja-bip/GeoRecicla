# 🌱 GeoRecicla

GeoRecicla es una aplicación web que ayuda a las personas a reciclar de forma más fácil y consciente. Su función principal es un **mapa interactivo** donde los usuarios pueden filtrar puntos de reciclaje según el tipo de material (plástico, vidrio, papel, metal, electrónicos, etc.) y encontrar el punto más cercano a su ubicación.

Tanto **usuarios individuales** como **empresas** pueden publicar nuevos puntos de reciclaje en el mapa:

- 👤 Los **usuarios** pueden agregar hasta **2 puntos** de reciclaje.
- 🏢 Las **empresas** pueden agregar **puntos ilimitados**.

Además, GeoRecicla cuenta con un **blog informativo** donde la comunidad puede aprender sobre cómo reciclar correctamente cada tipo de material.

Las funcionalidades de agregar puntos o aplicar filtros solo están disponibles para usuarios autenticados. El sistema de inicio de sesión permite:

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

### Backend / Base de datos
- **Supabase** — autenticación (correo y Google), base de datos y almacenamiento

### Testing y calidad de código
- **Vitest** + **Testing Library** — pruebas unitarias
- **ESLint** — linting
- **TypeScript ESLint** — reglas de tipado

---

## 📁 Estructura del proyecto

```
Producto/
├── public/                # Archivos estáticos
├── src/
│   ├── assets/             # Imágenes y recursos
│   ├── components/         # Componentes reutilizables (UI, diálogos, mapa, etc.)
│   ├── hooks/               # Hooks personalizados (useAuth, useProfile, etc.)
│   ├── integrations/        # Configuración de Supabase
│   ├── lib/                 # Utilidades y datos (materials-data, points, etc.)
│   ├── pages/                # Páginas de la app (Index, Auth, Profile, Company, Blog...)
│   ├── test/                 # Pruebas
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
| Alen Vergara | Product Owner y Frontend|
| Miguel Vergara | Scrum master |

---

## 📌 Estado del proyecto

Proyecto en desarrollo activo como parte de un trabajo académico orientado a fomentar el reciclaje y la conciencia ambiental mediante tecnología.