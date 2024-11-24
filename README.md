# Proyecto Ecommerce Backend | Corazón de Chocolate - Pastelería Creativa Artesanal

Este backend gestiona productos y carritos de compra para "Corazón de Chocolate", una tienda de pastelería artesanal. Los usuarios pueden acceder al catálogo de productos, buscar artículos, filtrar por categoría, añadir productos al carrito, y modificar propiedades relacionadas con los productos y carritos.

## Funcionalidades

### Gestión de Productos
- **Agregar producto**: Inserta nuevos productos con información como nombre, precio, stock, categoría, descripción y código.
- **Eliminar producto**: Elimina productos por su ID.
- **Actualizar producto**: Modifica los detalles de un producto, incluida su imagen (si se proporciona).
- **Filtrar productos**: Obtiene productos filtrados por categoría.
- **Buscar producto por ID**: Localiza productos específicos por su ID.
- **Ver todos los productos**: Devuelve la lista completa de productos.

### Gestión de Carritos
- Los usuarios pueden crear un carrito, añadir productos, modificar cantidades y eliminarlos.

### WebSockets
- **Conexión inicial**: El cliente se conecta para obtener las categorías disponibles.
- **Emisión de eventos**: Se emiten eventos para obtener productos filtrados, buscar productos por ID, y realizar acciones de agregar, actualizar y eliminar productos.

### Funcionalidades en la Interfaz
- **Filtrar productos**: Selección de categoría para mostrar productos específicos.
- **Buscar producto**: Buscar productos por su ID.
- **Detalles del producto**: Modal con detalles completos al hacer clic en un producto.
- **Agregar/modificar producto**: Formulario para agregar o actualizar productos.
- **Eliminar producto**: Eliminación de productos desde la lista.

### Comunicación en Tiempo Real
La comunicación entre el cliente y el servidor se realiza mediante **Socket.IO**, lo que permite actualizaciones en tiempo real sin necesidad de recargar la página. Los eventos incluyen:
- **"filtered-products"**: Envia la lista de productos filtrados o actualizados a todos los clientes.
- **"success-message"**: Notifica al cliente cuando una acción se ha completado correctamente.
- **"error-message"**: Notifica errores si algo falla.
- **"categories-list"**: Envía la lista de categorías disponibles.
- **"product-found"**: Muestra los detalles de un producto por su ID.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para el backend.
- **Express.js**: Framework para construir la API REST.
- **Socket.IO**: Comunicación en tiempo real usando WebSockets.
- **Handlebars**: Motor de plantillas para vistas dinámicas.
- **JavaScript ES6+**: Lenguaje de programación principal.
- **File System (JSON)**: Almacenamiento de datos en archivos JSON.
- **Manejo de errores**: Sistema personalizado para gestionar errores en las rutas.
