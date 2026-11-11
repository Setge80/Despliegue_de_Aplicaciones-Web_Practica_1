import mongoose from 'mongoose';

const recintoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    minlength: 5,
    trim: true
  },
  direccion: {
    type: String,
    required: true,
    minlength: 10,
    trim: true
  },
  localidad: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  aforoMaximo: {
    type: Number,
    required: false
  }
});

const Recinto = mongoose.model('recintos', recintoSchema, 'recintos');
export { Recinto, recintoSchema };
export default Recinto;

