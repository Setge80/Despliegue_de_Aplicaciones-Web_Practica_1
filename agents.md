# Reglas de arquitectura y estilo para la API REST de Eventos

## 1. Descripción del proyecto

Este proyecto es una API RESTful sencilla construida con Node.js, Express y Mongoose para gestionar una base de datos de eventos.

## 2. Estructura de carpetas obligatoria

Todo el código fuente debe estar estructurado estrictamente de la siguiente manera:

- `models/` (Esquemas y modelos de Mongoose)
- `routes/` (Enrutadores de Express)
- `index.js` (Punto de entrada de la aplicación)

## 3. Modelo de datos.

### 3.1. Eventos

El modelo de datos para la colección de eventos debe definirse en `models/evento.js` y contener los siguientes campos:

- **nombre**: Cadena de texto (`String`), obligatorio (`required`), longitud de la cadena de texto minima (minlength) `5` caracteres, sin espacios en los extremos (`trim`).
- **fecha**: Fecha (`Date`), obligatorio (`required`).
- **entradas**: Subdocumento, definido más adelante en este fichero.
- **recinto**: Relación con el modelo recintos, descrito más adelante en este fichero.

Dentro del esquema de eventos se incluira como subdocumento las entradas a la venta. Se debe añadir un esquema con la información de las entradas. Esa información sera contenida en los siguientes campos:

- **tipo**: Cadena de texto (`String`), por ejemplo ¨VIP¨ o ¨General¨, obligatorio (`required`) y con una longitud minima de 3 caracteres.
- **precio**: Número (`Number`), obligatorio (`required`), y valor minimo `0`.
- **disponibles**: Número (`Number`), obligatorio (`required`), y valor minimo `0`.

Se debe definir el esquema asociado y el modelo `eventos` para la base de datos junto a un campo llamado entradas, que sera una colección (array) de subdocumentos de este tipo.

### 3.2. Recintos

El modelo de datos para la colección de recintos debe definirse en `models/recinto.js` y contener los siguientes campos:

- **nombre**: Cadena de texto (`String`), obligatorio (`required`), longitud de la cadena de texto minima (minlength) `5` caracteres, sin espacios en los extremos (`trim`).
- **direccion**: Cadena de texto (`String`), obligatorio (`required`), longitud de la cadena de texto minima (minlength) `10` caracteres, sin espacios en los extremos (`trim`).
- **localidad**: Cadena de texto (`String`), obligatorio (`required`), longitud de la cadena de texto minima (minlength) `3` caracteres, sin espacios en los extremos (`trim`).
- **aforoMaximo**: Número (`Number`) y NO obligatorio.

Este modelo de datos se relacionara con el modelo de datos de eventos a traves de su ID. Para ello se debera añadir un campo nuevo al esquema de eventos llamado recinto, que apunta a un ID de este modelo, que además es obligatorio. Tambien se debe crear el modelo de recintos y exportarlo.

## 4. Estilo de código y convenciones

- **Módulos**: Utilizar la sintaxis moderna de **ES Modules** (`import` / `export`), no `require()`.
- **Control de Errores**: Usar bloques `try / catch` y `async/await` en las funciones controladoras. Responder con códigos de estado HTTP adecuados (200, 201, 400, 404, 500), una variable de tipo booleano llamada `ok` que sera `true` si la peticion se ha podido atenderse o `false` si se produce un error de tipo 400 y 500 y mensajes en JSON con la estructura `{ ok: true, resultado: "..." }` y { ok: false, error: "..." }.
- **Rutas**: Definir los enrutadores en el directorio `routes`, con los endpoints indicados a continuación. Cada enrutador englobará la lógica de acceso a la base de datos y recuperación/generación de la información correspondiente de cada modelo al que se haga referencia. En este caso tendremos recintos.js y eventos.js.

## 5. Endpoints requeridos

### 5.1. Recintos

- `GET /recintos` - Obtener todos los recintos almacenados.  Devolverá un código de estado 200
con un campo resultado que contenga el listado de recintos si hay al menos uno. Si no hay ningún
recinto, o falla la consulta, devolverá un código 500 con un campo error que contenga el mensaje
"No se han encontrado recintos".

- `GET /recintos/:id` - Obtener un recinto por su ID. Devolverá un código 200 y un campo
resultado con el recinto encontrado, si es satisfactorio. Si no se encuentra el recinto indicado (por
resultado nulo, o por error general), se devolverá un código 404 y un campo error con el mensaje
"Recinto X no encontrado", siendo X el id facilitado en la URL.

- `GET /recintos/localidad/:nombre` - Obtener los recintos por localidad indicada. Devolverá un código de estado 200 con un campo resultado que contenga el listado de recintos si hay al menos uno. Si no hay ningún recinto, o falla la consulta, devolverá un código 404 con un campo error que contenga el mensaje "No se han encontrado recintos de la localidad indicada".

- `POST /recintos` - Crear un nuevo recinto, cuyos datos recibira por JSON en el cuerpo de la petición. Devolverá un código 201 (creado), junto con el objeto creado en un campo resultado , si todo ha ido correctamente, o un código 500 con un campo error con el mensaje "Error añadiendo recinto" si ha habido algún error.

- `DELETE /recintos/:id` - Eliminar un recinto por ID. Devolverá un código 200 y un campo
resultado con el recinto eliminado, si es satisfactorio. Si no se encuentra el recinto indicado
(resultado nulo o error en la operación), se devolverá un código 404 y un campo error con el mensaje
"Error eliminando recinto X", siendo X el id facilitado en la URL.

### 5.2. Eventos

- `GET /eventos` - Obtener todos los eventos almacenados. Devolverá un código de estado 200
con un campo resultado que contenga el listado de eventos si hay al menos uno, con toda la
información de recinto y entradas (usa populate cuando sea necesario). Si no hay ningún evento, o
falla la consulta, devolverá un código 500 con un campo error que contenga el mensaje "No se han
encontrado eventos".

- `GET /eventos/:id` - Obtener un evento por su ID. Devolverá un código 200 y un campo
resultado con el evento encontrado, si es satisfactorio. Si no se encuentra el evento indicado
(resultado nulo o error en la consulta), se devolverá un código 404 y un campo error con el mensaje
"Evento X no encontrado", siendo X el id facilitado en la URL.

- `GET /eventos/localidad/:nombre` - Obtener los eventos por localidad y cuya fecha no haya pasado. 
Para ello deberemos, en primer lugar, buscar los IDs de los recintos de la localidad indicada con `.populate` y buscar los eventos cuyo `recinto` coincida con esas IDs y cuya `fecha` sea mayor o igual a la fecha actual (new Date()).
Devolverá un código de estado 200 con un campo resultado que
contenga el listado de eventos si hay al menos uno. Si no hay ningún evento, o falla la consulta,
devolverá un código 404 con un campo error que contenga el mensaje "No se han encontrado eventos".

- `POST /eventos` - Crear un nuevo evento, cuyos datos recibirá por JSON en el cuerpo de la
petición. Devolverá un código 201 (creado), junto con el objeto creado en un campo resultado , si
todo ha ido correctamente, o un código 500 con un campo error con el mensaje "Error añadiendo
evento" si ha habido algún error.

- `PUT /eventos/:id` - Actualizar los datos del evento por su ID. Devolverá un código 200 y un campo
resultado con el evento actualizado, si es satisfactorio. Si no se encuentra el evento indicado
(resultado nulo o error en la operación), se devolverá un código 404 con un campo error con el
mensaje "Error actualizando evento X", siendo X el id facilitado en la URL.

- `DELETE /eventos/:id` - Eliminar el evento por ID.  Devolverá un código 200 y un campo
resultado con el evento eliminado, si es satisfactorio. Si no se encuentra el evento indicado
(resultado nulo o error en la operación), se devolverá un código 404 y un campo error con el mensaje
"Error eliminando evento X", siendo X el id facilitado en la URL.

- `GET /eventos/entradas/:idEvento/:tipoEntrada` - Obtener el precio y número de entradas disponibles en el evento indicado por ID para el tipo de entrada indicada.
Si se encuentra la información, se enviará un código 200 junto con un campo resultado que internamente tendrá dos subcampos ( precio y
disponibles ). Si no se encuentra o se produce algún error en la consulta, se devolverá un código 404
con el campo error con el mensaje "Error obteniendo datos de entrada para evento X", siendo X el id de evento facilitado.

- `PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad` - Restar la cantidad de entradas de la disponibles para el evento y tipo de entrada indicados. 
Por ejemplo, para idEvento=3, tipoEntrada=VIP y cantidad=5 restaría 5 entradas disponibles de tipo VIP en el evento 3. 
Para ello, en primer lugar habria que comprobar si hay suficientes entradas disponibles antes de restar.
Devolverá un código 200 si se ha
podido realizar correctamente, y un campo resultado con el evento y sus entradas actualizadas. Si
falla la operación, o no hay tantas entradas disponibles para restar, se devolverá un código 404 con un
campo error que diga "Error actualizando entradas del evento X", siendo X el id del evento facilitado.

## 6. Servidor pirncipal

El servidor principal (`index.js`) se dedicara a:

- Cargar las librerías necesarias y la configuración de variables de entorno (usando `dotenv`).
- Conectar con la base de datos mediante la variable `process.env.MONGODB_URI` (con una URL local por defecto `mongodb://127.0.0.1:27017/eventos` si no existe la variable).
- Habilitar el servidor Express y el middleware para procesar peticiones JSON (`express.json()`).
- Cargar los enrutadores `/recintos` y `/eventos` con sus prefijos correspondientes.
- Escuchar en el puerto definido en `process.env.PORT` (o 3000 por defecto).
