import express from 'express';
import Evento from '../models/evento.js';
import Recinto from '../models/recinto.js';

const router = express.Router();

// GET /eventos/entradas/:idEvento/:tipoEntrada - Obtener precio y entradas disponibles
router.get('/entradas/:idEvento/:tipoEntrada', async (req, res) => {
  const { idEvento, tipoEntrada } = req.params;
  try {
    const evento = await Evento.findById(idEvento);
    if (!evento) {
      return res.status(404).json({
        ok: false,
        error: `Error obteniendo datos de entrada para evento ${idEvento}`
      });
    }

    const entrada = evento.entradas.find(
      (e) => e.tipo.toLowerCase() === tipoEntrada.toLowerCase()
    );

    if (!entrada) {
      return res.status(404).json({
        ok: false,
        error: `Error obteniendo datos de entrada para evento ${idEvento}`
      });
    }

    return res.status(200).json({
      ok: true,
      resultado: {
        precio: entrada.precio,
        disponibles: entrada.disponibles
      }
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: `Error obteniendo datos de entrada para evento ${idEvento}`
    });
  }
});

// PUT /eventos/entradas/:idEvento/:tipoEntrada/:cantidad - Restar cantidad de entradas disponibles
router.put('/entradas/:idEvento/:tipoEntrada/:cantidad', async (req, res) => {
  const { idEvento, tipoEntrada, cantidad } = req.params;
  try {
    const cantidadRestar = Number(cantidad);
    if (isNaN(cantidadRestar) || cantidadRestar <= 0) {
      return res.status(404).json({
        ok: false,
        error: `Error actualizando entradas del evento ${idEvento}`
      });
    }

    const evento = await Evento.findById(idEvento);
    if (!evento) {
      return res.status(404).json({
        ok: false,
        error: `Error actualizando entradas del evento ${idEvento}`
      });
    }

    const entrada = evento.entradas.find(
      (e) => e.tipo.toLowerCase() === tipoEntrada.toLowerCase()
    );

    if (!entrada || entrada.disponibles < cantidadRestar) {
      return res.status(404).json({
        ok: false,
        error: `Error actualizando entradas del evento ${idEvento}`
      });
    }

    entrada.disponibles -= cantidadRestar;
    await evento.save();
    await evento.populate('recinto');

    return res.status(200).json({
      ok: true,
      resultado: evento
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: `Error actualizando entradas del evento ${idEvento}`
    });
  }
});

// GET /eventos/localidad/:nombre - Obtener eventos por localidad y cuya fecha no haya pasado
router.get('/localidad/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const recintos = await Recinto.find({ localidad: nombre });
    const recintosIds = recintos.map((r) => r._id);

    const eventos = await Evento.find({
      recinto: { $in: recintosIds },
      fecha: { $gte: new Date() }
    }).populate('recinto');

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'No se han encontrado eventos'
      });
    }

    return res.status(200).json({
      ok: true,
      resultado: eventos
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: 'No se han encontrado eventos'
    });
  }
});

// GET /eventos - Obtener todos los eventos almacenados
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find().populate('recinto');
    if (!eventos || eventos.length === 0) {
      return res.status(500).json({
        ok: false,
        error: 'No se han encontrado eventos'
      });
    }

    return res.status(200).json({
      ok: true,
      resultado: eventos
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'No se han encontrado eventos'
    });
  }
});

// GET /eventos/:id - Obtener un evento por su ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await Evento.findById(id).populate('recinto');
    if (!evento) {
      return res.status(404).json({
        ok: false,
        error: `Evento ${id} no encontrado`
      });
    }

    return res.status(200).json({
      ok: true,
      resultado: evento
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: `Evento ${req.params.id} no encontrado`
    });
  }
});

// POST /eventos - Crear un nuevo evento
router.post('/', async (req, res) => {
  try {
    const { nombre, fecha, entradas, recinto } = req.body;
    const nuevoEvento = new Evento({
      nombre,
      fecha,
      entradas,
      recinto
    });
    const eventoGuardado = await nuevoEvento.save();
    return res.status(201).json({
      ok: true,
      resultado: eventoGuardado
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Error añadiendo evento'
    });
  }
});

// PUT /eventos/:id - Actualizar datos del evento por ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fecha, entradas, recinto } = req.body;

    const eventoActualizado = await Evento.findByIdAndUpdate(
      id,
      { nombre, fecha, entradas, recinto },
      { new: true, runValidators: true }
    ).populate('recinto');

    if (!eventoActualizado) {
      return res.status(404).json({
        ok: false,
        error: `Error actualizando evento ${id}`
      });
    }

    return res.status(200).json({
      ok: true,
      resultado: eventoActualizado
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: `Error actualizando evento ${req.params.id}`
    });
  }
});

// DELETE /eventos/:id - Eliminar evento por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eventoEliminado = await Evento.findByIdAndDelete(id);
    if (!eventoEliminado) {
      return res.status(404).json({
        ok: false,
        error: `Error eliminando evento ${id}`
      });
    }

    return res.status(200).json({
      ok: true,
      resultado: eventoEliminado
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: `Error eliminando evento ${req.params.id}`
    });
  }
});

export default router;
