# Guía para el Frontend Developer

## URLs del Backend

| Recurso | URL |
|---|---|
| **API Base** | `https://comercioelectronicobackend-production.up.railway.app` |
| **Swagger (Docs)** | `https://comercioelectronicobackend-production.up.railway.app/api/docs` |

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

---

## Subida de Imágenes de Productos (Cloudinary)

El backend maneja Cloudinary internamente. El frontend solo envía el archivo como `multipart/form-data`.

### Crear producto con imagen
```javascript
const formData = new FormData()
formData.append('name', 'Nombre del producto')
formData.append('description', 'Descripción')
formData.append('price', 99.99)
formData.append('stock', 10)
formData.append('categoryId', 1)
formData.append('image', archivoSeleccionado) // campo requerido: "image"

const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
    // ⚠️ NO agregar Content-Type, el navegador lo configura solo con el boundary
  },
  body: formData
})
```

### Respuesta
```json
{
  "product": {
    "id": 1,
    "name": "Nombre del producto",
    "price": "99.99",
    "imageUrl": "https://res.cloudinary.com/dbmom7f9q/image/upload/...",
    "category": { "id": 1, "name": "Electrónica" }
  }
}
```

El campo `imageUrl` ya es la URL pública lista para usar en `<img :src="product.imageUrl" />`.

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

## Endpoints Principales

Ver documentación completa en Swagger:
**https://comercioelectronicobackend-production.up.railway.app/api/docs**

### Auth
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Login → devuelve JWT |
| GET | `/api/auth/profile` | Sí | Ver perfil |
| PUT | `/api/auth/profile` | Sí | Editar dirección/ciudad/departamento |

### Productos
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/products` | No | Listar (filtros: search, categoryId, minPrice, maxPrice, page, limit) |
| GET | `/api/products/:id` | No | Detalle |
| POST | `/api/products` | Admin | Crear (multipart/form-data) |
| PUT | `/api/products/:id` | Admin | Actualizar |
| DELETE | `/api/products/:id` | Admin | Eliminar |

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
