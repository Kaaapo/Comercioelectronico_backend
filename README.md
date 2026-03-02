# Comercio Electrónico - Backend API

API REST para plataforma de comercio electrónico desarrollada con **Node.js**, **Express** y **PostgreSQL**.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js + Express | Framework backend |
| PostgreSQL | Base de datos relacional |
| Sequelize | ORM |
| JWT | Autenticación |
| Socket.IO | Notificaciones en tiempo real |
| Swagger | Documentación de API |
| Docker | Infraestructura local |
| Cloudinary | Almacenamiento de imágenes de productos |
| Nodemailer | Envío de correos transaccionales (Gmail) |

## Instalación y Configuración

### 1. Requisitos Previos
- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Levantar la Base de Datos
```bash
docker-compose up -d
```
Esto levanta:
- **PostgreSQL** en `localhost:5433`
- **pgAdmin** en `http://localhost:5050` (admin@ecommerce.com / admin123)

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000

# Base de Datos
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=ecommerce_pass_2026

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=24h

# Pasarela de Pagos (Simulación)
PAYMENT_APPROVAL_RATE=80

# Cloudinary (subida de imágenes de productos)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (Nodemailer - Gmail)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contrasena_de_aplicacion
```

> Para `EMAIL_PASS` usa una **Contraseña de aplicación** de Google (no tu contraseña normal). Actívala en: Google Account → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones.

### 5. Ejecutar el Seed (Datos de Prueba)
```bash
npm run seed
```

### 6. Iniciar el Servidor
```bash
npm run dev
```

El servidor arrancará en `http://localhost:3000`

## Documentación API

Una vez el servidor esté corriendo, accede a la documentación interactiva de Swagger:

**http://localhost:3000/api/docs**

También puedes importar los endpoints en **Postman** o usar cURL.

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
├── app.js                   # Express + Swagger setup
├── server.js                # Entry point + Socket.IO
├── config/database.js       # Sequelize config
├── middlewares/
│   ├── auth.js              # JWT verification
│   ├── role.js              # Role-based access
│   └── errorHandler.js      # Error handling + validation
├── models/                  # 8 modelos Sequelize
├── services/
│   ├── auth.service.js      # Registro, login, verificación
│   ├── cloudinary.service.js# Subida y eliminación de imágenes
│   ├── email.service.js     # Correos de verificación y recuperación
│   ├── cart.service.js
│   ├── order.service.js
│   ├── payment.service.js
│   ├── product.service.js
│   └── dashboard.service.js
├── controllers/             # Request handlers
├── routes/                  # Express Router + Swagger docs
├── sockets/orderSocket.js   # Notificaciones WebSocket
└── utils/                   # Helpers (apiResponse, validators)
```