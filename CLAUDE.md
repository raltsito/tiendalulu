@AGENTS.md

# La Tienda de Lulú — Contexto del Proyecto

## Descripcion
Catalogo de productos para una emprendedora de reventa. Permite ver el stock disponible publicamente y administrar productos (agregar, editar, eliminar) mediante una contraseña de administrador.

## Stack
- **Framework:** Next.js 14 (App Router)
- **Base de datos:** Supabase (PostgreSQL, tier gratuito)
- **Almacenamiento de imagenes:** Supabase Storage (tier gratuito)
- **Deploy:** Vercel (tier gratuito)
- **Lenguaje:** TypeScript
- **CSS:** Tailwind CSS

## Uso y plataforma
- La app se usara **casi completamente en telefono movil**
- Disenar mobile-first en todo momento: botones grandes, tap targets amplios, scroll vertical natural
- Evitar hovers como unica interaccion — todo debe funcionar con touch
- Tipografia legible en pantallas pequenas
- Grids de productos: 2 columnas en movil como maximo

## Paleta de colores
Inspiracion: catalogo tipo Canva, femenino, suave, calido.

| Token                  | Valor     | Uso                                      |
|------------------------|-----------|------------------------------------------|
| `--color-bg`           | `#fce4ec` | Fondo principal (rosa muy suave)         |
| `--color-card`         | `#ffffff` | Fondo de tarjetas de producto            |
| `--color-accent`       | `#e8719a` | Botones, precio badge, detalles          |
| `--color-accent-dark`  | `#c2547a` | Hover / estados activos                  |
| `--color-text`         | `#2d2d2d` | Texto principal                          |
| `--color-text-soft`    | `#888888` | Texto secundario (descripcion, etc.)     |
| `--color-agotado`      | `#cccccc` | Badge de producto agotado                |

## Estilo visual
- Inspiracion: catalogo de Canva — suave, femenino, calido
- Tailwind CSS para utilidades y responsividad
- Tarjetas de producto: fondo blanco, bordes redondeados (`rounded-2xl`), sombra suave
- Imagen del producto: recortada en circulo o cuadrado redondeado
- Precio: pill/badge en color acento
- Stock: texto pequeno debajo del precio — si es 0, badge gris "Agotado"
- Sin bordes duros ni sombras dramaticas — todo suave
- Tipografia: **Nunito** (Google Fonts) — bold para nombres, regular para detalles

## Reglas de diseno (NUNCA romper)
- Sin emojis en la UI
- Sin personajes ilustrativos ni mascota
- Solo iconos SVG monocromaticos (Lucide React)
- Imagenes siempre comprimidas antes de subir a Supabase Storage

## Funcionalidades

### Vista publica (catalogo)
- [ ] Grid de productos con imagen, nombre, precio y stock disponible
- [ ] Indicador visual de "Agotado" cuando stock = 0

### Vista administrador (protegida por contraseña)
- [ ] Boton discreto en la pagina principal para acceder al panel
- [ ] Modal con campo de contraseña (validacion en servidor, nunca en cliente)
- [ ] Agregar producto: nombre, descripcion, precio, stock, imagen
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Compression de imagen en el cliente antes de subir (`browser-image-compression`)

## Esquema de base de datos (Supabase)

### Tabla: `products`
| Columna       | Tipo      | Notas                          |
|---------------|-----------|--------------------------------|
| id            | uuid      | PK, generado automaticamente   |
| name          | text      | NOT NULL                       |
| description   | text      |                                |
| price         | numeric   | NOT NULL                       |
| stock         | integer   | NOT NULL, default 0            |
| image_url     | text      | URL en Supabase Storage        |
| category      | text      | Para filtros futuros           |
| created_at    | timestamp | default now()                  |
| updated_at    | timestamp | actualizar en cada edit        |

## Variables de entorno necesarias (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

## Estructura de carpetas
```
/
├── app/
│   ├── page.tsx              # Catalogo publico
│   ├── layout.tsx            # Layout raiz
│   ├── globals.css           # Estilos globales y variables CSS
│   ├── admin/
│   │   └── page.tsx          # Panel de administrador (protegido)
│   └── api/
│       └── products/
│           └── route.ts      # CRUD de productos
├── components/
│   ├── catalog/              # Componentes del catalogo publico
│   ├── admin/                # Componentes del panel admin
│   └── ui/                   # Componentes reutilizables (botones, inputs, etc.)
├── lib/
│   ├── supabase.ts           # Cliente de Supabase
│   └── utils.ts              # Utilidades generales
├── public/
│   └── images/               # Assets estaticos locales
├── CLAUDE.md                 # Este archivo
├── .env.local                # Variables de entorno (NO commitear)
└── .env.local.example        # Plantilla publica de variables
```

## Estado del proyecto

### Fase actual: PRUEBAS LOCALES
- [x] Inicializar proyecto Next.js con TypeScript + Tailwind
- [x] Instalar dependencias: Supabase client, Lucide, browser-image-compression
- [x] Configurar Supabase (tabla products + bucket product-images)
- [x] Conectar Supabase con Next.js (.env.local)
- [x] Implementar catalogo publico (app/page.tsx)
- [x] Implementar panel de administrador (app/admin/page.tsx)
- [ ] Probar localmente en http://localhost:3000
- [ ] Deploy en Vercel

## Notas tecnicas
- La validacion de la contrasena admin se hace en el servidor (API route), nunca en el cliente
- Comprimir imagenes en el cliente antes del upload con `browser-image-compression`
- Supabase Storage bucket debe ser publico (lectura) para mostrar imagenes sin auth
- RLS en Supabase: lectura publica, escritura solo desde API con `service_role_key`
