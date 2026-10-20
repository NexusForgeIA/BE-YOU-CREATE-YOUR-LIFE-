// Menú móvil y formulario de primera conversación. Todo texto va con textContent.
import { ASUNTO, WHATSAPP } from "./config.js";

document.documentElement.classList.add("js");
const boton = document.querySelector(".menu-boton");
const nav = document.getElementById("navegacion");
if (boton && nav) {
  boton.addEventListener("click", () => {
    const abierto = nav.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", String(abierto));
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("abierto")) { nav.classList.remove("abierto"); boton.setAttribute("aria-expanded", "false"); boton.focus(); } });
}

const form = document.getElementById("f-contacto");
if (form) {
  const estado = document.getElementById("estado");
  const fallo = (t, campo) => { estado.textContent = t; estado.classList.add("error"); if (campo) form[campo].focus(); };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    estado.classList.remove("error");
    if (form.web.value) return; // campo trampa para bots
    const nombre = form.nombre.value.trim();
    const contacto = form.contacto.value.trim();
    if (!nombre) return fallo("Dinos tu nombre, como prefieras que te llamemos.", "nombre");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto) && !/^\+?[\d\s]{9,15}$/.test(contacto)) return fallo("Escribe un correo o un teléfono para poder responderte.", "contacto");
    if (!form.acepto.checked) return fallo("Necesitamos que aceptes la política de privacidad para poder contestarte.", "acepto");
    const cuerpo = [
      `Nombre: ${nombre}`, `Contacto: ${contacto}`,
      `Encuentro que me interesa: ${form.interes.value}`,
      `Modalidad: ${form.modalidad.value}`,
      `Horario: ${form.horario.value}`,
      form.mensaje.value.trim() ? `Mensaje: ${form.mensaje.value.trim()}` : "",
    ].filter(Boolean).join("\n");
    location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(ASUNTO + "\n\n" + cuerpo)}`;
    estado.textContent = "Se abre WhatsApp con tu mensaje listo. Solo tienes que enviarlo.";
  });
}
document.getElementById("imprimir")?.addEventListener("click", () => window.print());

/* H1 de la home: frases que rotan (sin rotar si el usuario reduce el movimiento) */
(function () {
  var h1 = document.querySelector('.h1-rota');
  if (!h1) return;
  var frases = [
    ['Vuelve a ti,', 'empieza de nuevo.'],
    ['Tu historia', 'no termina aquí.'],
    ['No tienes que poder', 'con todo a solas.'],
    ['Cada día es una', 'oportunidad para ti.'],
    ['Mereces volver', 'a sonreír.'],
    ['Esta etapa también', 'es tuya.']
  ];
  function pinta(f) {
    h1.textContent = '';
    h1.appendChild(document.createTextNode(f[0] + ' '));
    var em = document.createElement('em');
    em.className = 'grad';
    em.textContent = f[1];
    h1.appendChild(em);
  }
  function reserva() {
    h1.style.minHeight = '';
    var max = 0;
    frases.forEach(function (f) { pinta(f); max = Math.max(max, h1.offsetHeight); });
    pinta(frases[i]);
    h1.style.minHeight = max + 'px';
  }
  var i = 0;
  var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quieto) return;
  h1.classList.add('h1-anim');
  reserva();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(reserva, 200); });
  setInterval(function () {
    if (document.hidden) return;
    h1.classList.add('h1-fuera');
    setTimeout(function () {
      i = (i + 1) % frases.length;
      pinta(frases[i]);
      h1.classList.remove('h1-fuera');
    }, 450);
  }, 4500);
})();
