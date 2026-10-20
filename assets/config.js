export const WHATSAPP = "34649042543";
export const ASUNTO = "Hola, quiero conocer BE YOU";

// Agenda de llamadas. PROVISIONAL: Belén debe confirmar días y horas.
// dias: 1=lunes … 5=viernes, 6=sábado, 0=domingo. Horas en hora de España.
export const AGENDA = {
  dias: [1, 2, 3, 4, 5],
  franjas: [["10:00", "14:00"], ["16:00", "20:00"]],
  duracionMin: 60,
  antelacionDias: 2,   // mínimo 2 días de antelación
  maxDias: 60,         // hasta cuántos días vista se puede pedir
  festivos: [],        // fechas "AAAA-MM-DD" que no se atiende
};
