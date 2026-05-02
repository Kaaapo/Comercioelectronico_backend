# Guía para el Frontend Developer

## URLs del Backend

| Recurso | URL |
|---|---|
| **API Base** | `https://comercioelectronicobackend-production.up.railway.app` |
| **Swagger (Docs)** | `https://comercioelectronicobackend-production.up.railway.app/api/docs` |

> No necesitas correr ni instalar el backend. Ya está desplegado en Railway con la BD en Neon.

---

## Configuración en Vue

Crea un archivo `.env` en la raíz de tu proyecto Vue:

```env
VITE_API_URL=https://comercioelectronicobackend-production.up.railway.app
```

Eso es todo lo que necesitas. No tienes acceso directo a la base de datos ni a servicios externos.

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@ecommerce.com | admin123 |
| Cliente | carlos@email.com | password123 |
| Cliente | maria@email.com | password123 |

---

## Autenticación (JWT)

### Login
```javascript
// POST /api/auth/login
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
const { data } = await res.json()
localStorage.setItem('token', data.token)
```

### Requests autenticados
```javascript
// Agregar el token en el header Authorization
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Registro y verificación de correo
```
1. POST /api/auth/register  →  se envía correo de verificación al usuario
2. Usuario hace click en el link del correo
3. GET /api/auth/verify-email?token=...  →  cuenta activada ✅
```

### Recuperación de contraseña
```
1. POST /api/auth/forgot-password  { "email": "..." }
2. Usuario recibe correo con link (expira en 1 hora)
3. POST /api/auth/reset-password?token=...  { "password": "nueva" }
4. Contraseña actualizada ✅
```

---

## Subida de Imágenes de Productos (Cloudinary)

El backend maneja Cloudinary internamente. El frontend solo envía el archivo como `multipart/form-data`.

### Crear producto con imágenes (hasta 10)
```javascript
const formData = new FormData()
formData.append('name', 'Nombre del producto')
formData.append('description', 'Descripción')
formData.append('price', 99.99)
formData.append('stock', 10)
formData.append('categoryId', 1)
formData.append('featured', false)
// Imagen principal (campo "image") o múltiples (campo "images")
formData.append('image', archivoSeleccionado)
// formData.append('images', archivo1)
// formData.append('images', archivo2)

const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
    // ⚠️ NO agregar Content-Type, el navegador lo configura solo con el boundary
  },
  body: formData
})
```

### Respuesta del producto
```json
{
  "product": {
    "id": 1,
    "name": "Nombre del producto",
    "price": "99.99",
    "originalPrice": "129.99",
    "discountPercentage": 23,
    "brand": "Logitech",
    "color": "Negro",
    "featured": true,
    "imageUrl": "https://res.cloudinary.com/dbmom7f9q/image/upload/...",
    "images": [
      { "id": 1, "imageUrl": "...", "sortOrder": 0, "isPrimary": true },
      { "id": 2, "imageUrl": "...", "sortOrder": 1, "isPrimary": false }
    ],
    "category": { "id": 1, "name": "Electrónica" }
  }
}
```

> - `imageUrl` es la URL principal (la primera imagen). Lista para `<img :src="product.imageUrl" />`.
> - `images` es el arreglo completo de imágenes del producto, ordenadas por `sortOrder`.
> - `originalPrice` y `discountPercentage` son `null` si el producto no tiene descuento activo.

---

## Filtros de Productos

```
GET /api/products?page=1&limit=10
GET /api/products?search=teclado
GET /api/products?categoryId=2
GET /api/products?minPrice=50000&maxPrice=200000
GET /api/products?featured=true
GET /api/products?brand=logitech
GET /api/products?color=negro
GET /api/products?onDiscount=true        ← productos con discountPercentage > 0
GET /api/products?sort=price_asc
GET /api/products?sort=price_desc
```

---

## Notificaciones en Tiempo Real (Socket.IO)

### Instalación
```bash
npm install socket.io-client
```

### Conexión (después del login)
```javascript
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL, {
  auth: {
    token: localStorage.getItem('token') // JWT del usuario logueado
  }
})

socket.on('connect', () => {
  console.log('Conectado al servidor de notificaciones')
})

socket.on('connect_error', (err) => {
  console.error('Error de conexión:', err.message)
})
```

### Escuchar notificaciones
Solo hay **un evento** que escuchar: `notification`

```javascript
socket.on('notification', (data) => {
  console.log(data)
  /*
  {
    type: "order_created",
    title: "Pedido creado",
    message: "Tu pedido #PED-000001-X3F9A2 fue recibido",
    data: { orderId: 5, total: "150000.00" },
    timestamp: "2026-03-05T18:00:00.000Z"
  }
  */
  
  // Mostrar toast/alerta según el tipo
  mostrarNotificacion(data.title, data.message)
})
```

### Tipos de notificación

| `type` | Cuándo llega | A quién |
|---|---|---|
| `order_created` | Usuario crea un pedido | Usuario + Admins |
| `order_status_updated` | Admin cambia estado del pedido | Usuario dueño |
| `payment_result` | Pago aprobado o rechazado | Usuario |
| `new_order_admin` | Nuevo pedido en el sistema | Solo admins |
| `payment_admin` | Cualquier pago procesado | Solo admins |

### Ejemplo con Vue + composable
```javascript
// composables/useSocket.js
import { io } from 'socket.io-client'
import { ref, onUnmounted } from 'vue'

export function useSocket() {
  const notifications = ref([])

  const socket = io(import.meta.env.VITE_API_URL, {
    auth: { token: localStorage.getItem('token') }
  })

  socket.on('notification', (data) => {
    notifications.value.unshift(data)
  })

  onUnmounted(() => {
    socket.disconnect()
  })

  return { notifications, socket }
}
```

### Verificar conexión activa
```javascript
socket.emit('ping')
socket.on('pong', (data) => {
  console.log('Conexión activa:', data.timestamp)
})
```

### Desconectar (al hacer logout)
```javascript
socket.disconnect()
```

---

## Endpoints Completos

Ver documentación interactiva en Swagger:
**https://comercioelectronicobackend-production.up.railway.app/api/docs**

### Auth
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registrar usuario (envía correo de verificación) |
| POST | `/api/auth/login` | No | Login → devuelve JWT |
| GET | `/api/auth/profile` | Sí | Ver perfil |
| PUT | `/api/auth/profile` | Sí | Editar dirección / ciudad / departamento |
| GET | `/api/auth/verify-email?token=` | No | Verificar correo electrónico |
| POST | `/api/auth/forgot-password` | No | Solicitar recuperación de contraseña |
| POST | `/api/auth/reset-password?token=` | No | Restablecer contraseña con token |

### Productos
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/products` | No | Listar con filtros y paginación |
| GET | `/api/products/:id` | No | Detalle del producto |
| GET | `/api/products/:id/similar` | No | Productos similares (misma categoría) |
| POST | `/api/products` | Admin | Crear (`multipart/form-data`) |
| PUT | `/api/products/:id` | Admin | Actualizar (`multipart/form-data`) |
| DELETE | `/api/products/:id` | Admin | Eliminar (soft-delete) |

### Categorías
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/categories` | No | Listar categorías (incluye `imageUrl`) |
| POST | `/api/categories` | Admin | Crear (requiere `multipart/form-data` con `image`) |
| PUT | `/api/categories/:id` | Admin | Actualizar (permite reemplazar `image`) |
| DELETE | `/api/categories/:id` | Admin | Eliminar categoría |

### Favoritos (Wishlist)
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/wishlist` | Sí | Listar favoritos del usuario |
| POST | `/api/wishlist/items` | Sí | Agregar producto a favoritos (`{ productId }`) |
| DELETE | `/api/wishlist/items/:productId` | Sí | Eliminar producto de favoritos |
| GET | `/api/wishlist/:productId` | Sí | Verificar si un producto está en favoritos |

### Carrito
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/cart` | Sí | Ver carrito |
| POST | `/api/cart/items` | Sí | Agregar producto |
| PUT | `/api/cart/items/:id` | Sí | Actualizar cantidad |
| DELETE | `/api/cart/items/:id` | Sí | Eliminar item |
| DELETE | `/api/cart/clear` | Sí | Vaciar carrito |

### Pedidos
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/orders` | Sí | Crear pedido desde carrito |
| GET | `/api/orders` | Sí | Mis pedidos |
| GET | `/api/orders/:id` | Sí | Detalle de pedido |
| GET | `/api/orders/admin/all` | Admin | Todos los pedidos |
| PUT | `/api/orders/:id/status` | Admin | Cambiar estado |

### Reseñas
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/reviews/product/:id` | No | Ver reseñas del producto (incluye promedio y distribución) |
| POST | `/api/reviews/product/:id` | Sí | Crear/actualizar reseña (1-5 estrellas) |
| GET | `/api/reviews/product/:id/my-review` | Sí | Ver mi reseña de este producto |
| DELETE | `/api/reviews/product/:id` | Sí | Eliminar mi reseña |

### Devoluciones
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/returns` | Sí | Solicitar devolución |
| GET | `/api/returns` | Sí | Mis devoluciones |
| GET | `/api/returns/:id` | Sí | Detalle de devolución |
| DELETE | `/api/returns/:id` | Sí | Cancelar devolución (solo si está en "solicitada") |
| GET | `/api/returns/admin/all` | Admin | Todas las devoluciones |
| PATCH | `/api/returns/admin/:id/status` | Admin | Actualizar estado |

### Pagos
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/payments` | Sí | Procesar pago (simulación, 80% aprobación) |
| GET | `/api/payments/:orderId` | Sí | Consultar pagos de una orden |

### Chatbot IA (Gemini)
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/chatbot/message` | No | Enviar mensaje al chatbot y recibir respuesta + productos sugeridos |

#### Body
```json
{
  "message": "¿Tienen teclados mecánicos o mouses gamer?",
  "history": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué te puedo ayudar?" }
  ]
}
```
> `history` es opcional. Úsalo para mantener el contexto de una conversación multi-turno.

#### Respuesta
```json
{
  "success": true,
  "data": {
    "reply": "Sí, contamos con varios teclados mecánicos y mouses gamer...",
    "suggestedProducts": [12, 7, 23]
  }
}
```
> `suggestedProducts` es un array de IDs de productos relevantes. Puedes usarlos para mostrar una sección "Productos relacionados" debajo de la respuesta del bot.

---

### Dashboard (Admin)
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Admin | Resumen general |
| GET | `/api/dashboard/sales` | Admin | Ventas por período |
| GET | `/api/dashboard/inventory` | Admin | Estado del inventario |
| GET | `/api/dashboard/top-products` | Admin | Productos más vendidos |

---

## Formato de Respuestas

Todas las respuestas siguen este formato:

### Éxito
```json
{
  "success": true,
  "message": "Descripción del resultado",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ]  // solo en errores de validación
}
```

### Paginado
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```
