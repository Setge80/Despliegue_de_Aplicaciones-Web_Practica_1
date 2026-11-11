import express from 'express';
import mongoose from 'mongoose';
import Recinto from '../models/recinto.js';
import Evento from '../models/evento.js';

const router = express.Router();

// GET /recintos - Obtener todos los recintos almacenados
router.get('/', async (req, res) => {
  try {
    const recintos = await Recinto.find();
    if (!recintos || recintos.length === 0) {
      return res.status(500).json({
        ok: false,
        error: 'No se han encontrado recintos'
      });
    }
    return res.status(200).json({
      ok: true,
      resultado: recintos
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'No se han encontrado recintos'
    });
  }
});

// GET /recintos/localidad/:nombre - Obtener los recintos por localidad indicada
router.get('/localidad/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const recintos = await Recinto.find({ localidad: nombre });
    if (!recintos || recintos.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'No se han encontrado recintos de la localidad indicada'
      });
    }
    return res.status(200).json({
      ok: true,
      resultado: recintos
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: 'No se han encontrado recintos de la localidad indicada'
    });
  }
});

// GET /recintos/:id - Obtener un recinto por su ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recinto = await Recinto.findById(id);
    if (!recinto) {
      return res.status(404).json({
        ok: false,
        error: `Recinto ${id} no encontrado`
      });
    }
    return res.status(200).json({
      ok: true,
      resultado: recinto
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: `Recinto ${req.params.id} no encontrado`
    });
  }
});

// POST /recintos - Crear un nuevo recinto
router.post('/', async (req, res) => {
  try {
    const { nombre, direccion, localidad, aforo } = req.body;
    const nuevoRecinto = new Recinto({
      nombre,
      direccion,
      localidad,
      aforo
    });
    const recintoGuardado = await nuevoRecinto.save();
    return res.status(201).json({
      ok: true,
      resultado: recintoGuardado
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Error añadiendo recinto'
    });
  }
});

// DELETE /recintos/:id - Eliminar un recinto por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const eventosAsociados = await Evento.find({ recinto: id });
    if (eventosAsociados.length > 0) {
      return res.status(404).json({
        ok: false,
        error: `Error eliminando recinto ${req.params.id}`
      });
    }

    const recintoEliminado = await Recinto.findByIdAndDelete(id);
    if (!recintoEliminado) {
      return res.status(404).json({
        ok: false,
        error: `Error eliminando recinto ${id}`
      });
    }

    return res.status(200).json({
      ok: true,
      resultado: recintoEliminado
    });
  } catch (error) {
    return res.status(404).json({
      ok: false,
      error: `Error eliminando recinto ${req.params.id}`
    });
  }
});

export default router;
