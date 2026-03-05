# Comercio Electrónico - Backend API

API REST para plataforma de comercio electrónico desarrollada con **Node.js**, **Express** y **PostgreSQL**.

## Despliegue

| Servicio | URL |
|---|---|
| **Backend (Railway)** | https://comercioelectronicobackend-production.up.railway.app |
| **Documentación Swagger** | https://comercioelectronicobackend-production.up.railway.app/api/docs |
| **Base de datos (Neon)** | PostgreSQL cloud - Neon |

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js + Express | Framework backend |
| PostgreSQL (Neon) | Base de datos en la nube |
| Sequelize | ORM |
| JWT | Autenticación |
| Socket.IO | Notificaciones en tiempo real |
| Swagger | Documentación de API |
| Cloudinary | Almacenamiento de imágenes de productos |
| Nodemailer | Envío de correos transaccionales (Gmail) |
| Helmet + Rate-limit | Seguridad HTTP |
| Railway | Despliegue del backend |

## Instalación y Configuración Local

### 1. Requisitos Previos
- [Node.js](https://nodejs.org/) v18+

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia el archivo `.env.example` y renómbralo a `.env`:
```bash
cp .env.example .env
```

Edita el `.env` con tus credenciales. Las variables principales son:

```env
# Servidor
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000

# Base de Datos (Neon cloud)
DB_HOST=tu-host.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=tu_password
DB_SSL=true

# JWT
JWT_SECRET=cadena_aleatoria_larga_y_segura
JWT_EXPIRES_IN=24h
```

> Para `EMAIL_PASS` usa una **Contraseña de aplicación** de Google (no tu contraseña normal). Actívala en: Google Account → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones.

### 4. Ejecutar el Seed (Datos de Prueba)
```bash
npm run seed
```
> ⚠️ El seed usa `force: true` — borra y recrea todas las tablas. No ejecutar en producción con datos reales.

### 5. Iniciar el Servidor
```bash
npm run dev
```

El servidor arrancará en `http://localhost:3000`

## Documentación API

Swagger disponible en producción (sin necesidad de correr el servidor localmente):

**https://comercioelectronicobackend-production.up.railway.app/api/docs**

También puedes importar los endpoints en **Postman** o usar cURL.

## Para el Frontend Developer

Solo necesitas esta variable en tu `.env` de Vue:
```env
VITE_API_URL=https://comercioelectronicobackend-production.up.railway.app
```

No necesitas instalar ni correr el backend localmente.

## Credenciales de Prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@ecommerce.com | admin123 |
| Cliente | carlos@email.com | password123 |
| Cliente | maria@email.com | password123 |

## Endpoints Principales

### Auth
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario (envía correo de verificación) |
| POST | `/api/auth/login` | Login → JWT token |
| GET | `/api/auth/profile` | Perfil (auth requerido) |
| GET | `/api/auth/verify-email?token=` | Verificar correo electrónico |
| POST | `/api/auth/forgot-password` | Solicitar recuperación de contraseña |
| POST | `/api/auth/reset-password?token=` | Restablecer contraseña con token |

### Catálogo (Productos)
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/products` | No | Listar productos (filtros, paginación) |
| GET | `/api/products/:id` | No | Detalle de producto |
| POST | `/api/products` | Admin | Crear producto (soporta imagen `multipart/form-data`) |
| PUT | `/api/products/:id` | Admin | Actualizar producto (soporta imagen `multipart/form-data`) |
| DELETE | `/api/products/:id` | Admin | Eliminar producto (soft-delete) |

### Categorías
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/categories` | No | Listar categorías |
| POST | `/api/categories` | Admin | Crear categoría |
| PUT | `/api/categories/:id` | Admin | Actualizar categoría |
| DELETE | `/api/categories/:id` | Admin | Eliminar categoría |

### Carrito
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/cart` | Ver carrito |
| POST | `/api/cart/items` | Agregar producto |
| PUT | `/api/cart/items/:id` | Actualizar cantidad |
| DELETE | `/api/cart/items/:id` | Eliminar item |
| DELETE | `/api/cart/clear` | Vaciar carrito |

### Pedidos
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/orders` | Customer | Crear pedido desde carrito → notifica por WebSocket |
| GET | `/api/orders` | Customer | Mis pedidos |
| GET | `/api/orders/:id` | Auth | Detalle de pedido |
| GET | `/api/orders/all` | Admin | Todos los pedidos |
| PUT | `/api/orders/:id/status` | Admin | Cambiar estado → notifica por WebSocket |

### Pagos (Simulación)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/payments` | Procesar pago (80% aprobación) → notifica por WebSocket |
| GET | `/api/payments/:orderId` | Consultar pagos de una orden |

### Dashboard (Admin)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/dashboard/stats` | Resumen general |
| GET | `/api/dashboard/sales` | Ventas por período |
| GET | `/api/dashboard/inventory` | Estado del inventario |
| GET | `/api/dashboard/top-products` | Productos más vendidos |

## Imágenes de Productos (Cloudinary)

Las imágenes se suben directamente desde el backend a Cloudinary. El frontend no necesita credenciales de Cloudinary.

### Crear/actualizar producto con imagen
```
POST /api/products
Content-Type: multipart/form-data

image: [archivo jpg/png/webp, máx 5MB]
name: "Nombre del producto"
price: 99.99
stock: 10
categoryId: 1
```

La respuesta incluye el campo `imageUrl` con la URL pública de Cloudinary lista para usar en el frontend.

## Notificaciones en Tiempo Real (WebSocket)

El servidor usa **Socket.IO** para emitir notificaciones automáticas ante acciones importantes.

### Conectarse
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'TU_JWT_TOKEN' }
});

socket.on('notification', (data) => {
  console.log(data);
  // { type, title, message, data, timestamp }
});
```

### Tipos de notificación

| Tipo | Evento que lo dispara | Destinatario |
|---|---|---|
| `order_created` | Usuario crea un pedido | Usuario + Admins |
| `order_status_updated` | Admin cambia estado del pedido | Usuario dueño |
| `payment_result` | Pago aprobado o rechazado | Usuario |
| `new_order_admin` | Usuario crea un pedido | Admins |
| `payment_admin` | Cualquier pago procesado | Admins |

### Estructura del evento
```json
{
  "type": "order_status_updated",
  "title": "Estado de tu pedido actualizado",
  "message": "Tu pedido #PED-000001-X3F9A2 cambió de \"pendiente\" a \"enviado\".",
  "data": { "orderId": 5, "previousStatus": "pendiente", "newStatus": "enviado" },
  "timestamp": "2026-03-02T20:00:00.000Z"
}
```

## Flujo de Registro y Verificación de Correo

```
1. POST /api/auth/register  →  se envía correo de verificación al usuario
2. Usuario hace click en el link del correo
3. GET /api/auth/verify-email?token=...  →  cuenta activada ✅
```

## Flujo de Recuperación de Contraseña

```
1. POST /api/auth/forgot-password  { "email": "..." }
2. Usuario recibe correo con link (expira en 1 hora)
3. POST /api/auth/reset-password?token=...  { "password": "nueva" }
4. Contraseña actualizada ✅
```

## Estructura del Proyecto

```
src/
├── app.js                   # Express + Swagger + seguridad (helmet, rate-limit, cors)
├── server.js                # Entry point + Socket.IO
├── config/database.js       # Sequelize config (SSL condicional para Neon)
├── middlewares/
│   ├── auth.js              # JWT verification (HS256 restringido)
│   ├── role.js              # Role-based access (admin/customer)
│   └── errorHandler.js      # Error handling seguro (sin stack trace en producción)
├── models/                  # 10 modelos Sequelize (User, Product, Category, Cart,
│                            # CartItem, Order, OrderItem, Payment, Review, Return)
├── services/
│   ├── auth.service.js      # Registro, login, perfil, verificación, recuperación
│   ├── cloudinary.service.js# Subida y eliminación de imágenes
│   ├── email.service.js     # Correos de verificación y recuperación
│   ├── cart.service.js
│   ├── order.service.js
│   ├── payment.service.js
│   ├── product.service.js
│   ├── review.service.js    # Reseñas y calificaciones
│   ├── return.service.js    # Devoluciones con flujo de estados
│   └── dashboard.service.js
├── controllers/             # Request handlers
├── routes/                  # Express Router + Swagger docs
├── sockets/orderSocket.js   # Notificaciones WebSocket
└── utils/                   # Helpers (apiResponse, validators)
```