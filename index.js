import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import recintosRouter from './routes/recintos.js';
import eventosRouter from './routes/eventos.js';

// Cargar configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventos';

// Middleware para procesar peticiones JSON
app.use(express.json());

// Cargar enrutadores con sus prefijos correspondientes
app.use('/recintos', recintosRouter);
app.use('/eventos', eventosRouter);

//Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Ruta no encontrada'
  });
});

// Conexión con la base de datos y arranque del servidor
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`Conexión establecida con MongoDB en: ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`Servidor Express escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error.message);
  });

export default app;
