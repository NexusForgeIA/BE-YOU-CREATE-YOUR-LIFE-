// Calendario de citas: el resultado es un mensaje de WhatsApp para Belén (sin API).
import { AGENDA, WHATSAPP } from "./config.js";

const $ = (id) => document.getElementById(id);
const cal = $("cal"); if (!cal) throw new Error("sin calendario");
const pad = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const utc = (y, m, d) => new Date(Date.UTC(y, m, d));
const fmtDia = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const fmtMes = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "Hoy" en hora de España
const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).split("-").map(Number);
const hoy = utc(p[0], p[1] - 1, p[2]);
const DIA = 86400000;
const minD = new Date(hoy.getTime() + AGENDA.antelacionDias * DIA);
const maxD = new Date(hoy.getTime() + AGENDA.maxDias * DIA);
const isoD = (d) => iso(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

const estado = { y: minD.getUTCFullYear(), m: minD.getUTCMonth(), dia: null, hora: null };
const primerMes = { y: estado.y, m: estado.m };

function disponible(d) {
  return d >= minD && d <= maxD && AGENDA.dias.includes(d.getUTCDay()) && !AGENDA.festivos.includes(isoD(d));
}
function horasDelDia() {
  const out = [];
  for (const [a, b] of AGENDA.franjas) {
    let [h, mi] = a.split(":").map(Number); const fin = Number(b.split(":")[0]) * 60 + Number(b.split(":")[1]);
    for (let t = h * 60 + mi; t + AGENDA.duracionMin <= fin; t += AGENDA.duracionMin) out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return out;
}

function pintarCalendario() {
  cal.replaceChildren();
  const cab = document.createElement("div"); cab.className = "cal-cab";
  const ant = document.createElement("button"); ant.type = "button"; ant.className = "cal-nav"; ant.textContent = "‹"; ant.setAttribute("aria-label", "Mes anterior");
  const sig = document.createElement("button"); sig.type = "button"; sig.className = "cal-nav"; sig.textContent = "›"; sig.setAttribute("aria-label", "Mes siguiente");
  const tit = document.createElement("h3"); tit.setAttribute("aria-live", "polite"); tit.textContent = cap(fmtMes.format(utc(estado.y, estado.m, 1)));
  ant.disabled = estado.y === primerMes.y && estado.m === primerMes.m;
  const ultimo = { y: maxD.getUTCFullYear(), m: maxD.getUTCMonth() };
  sig.disabled = estado.y === ultimo.y && estado.m === ultimo.m;
  ant.addEventListener("click", () => { estado.m--; if (estado.m < 0) { estado.m = 11; estado.y--; } pintarCalendario(); });
  sig.addEventListener("click", () => { estado.m++; if (estado.m > 11) { estado.m = 0; estado.y++; } pintarCalendario(); });
  cab.append(ant, tit, sig); cal.append(cab);

  const grid = document.createElement("div"); grid.className = "cal-grid";
  ["L", "M", "X", "J", "V", "S", "D"].forEach((l, i) => { const s = document.createElement("span"); s.className = "cal-sem"; s.textContent = l; s.setAttribute("aria-hidden", "true"); grid.append(s); });
  const primero = utc(estado.y, estado.m, 1);
  const hueco = (primero.getUTCDay() + 6) % 7;
  for (let i = 0; i < hueco; i++) grid.append(document.createElement("span"));
  const dias = new Date(Date.UTC(estado.y, estado.m + 1, 0)).getUTCDate();
  for (let d = 1; d <= dias; d++) {
    const fecha = utc(estado.y, estado.m, d); const k = isoD(fecha);
    const b = document.createElement("button"); b.type = "button"; b.className = "cal-dia"; b.textContent = d;
    const ok = disponible(fecha); b.disabled = !ok;
    b.setAttribute("aria-label", cap(fmtDia.format(fecha)) + (ok ? "" : ", no disponible"));
    if (ok) b.classList.add("libre");
    if (k === estado.dia) { b.classList.add("sel"); b.setAttribute("aria-pressed", "true"); }
    b.addEventListener("click", () => { estado.dia = k; estado.hora = null; pintarCalendario(); pintarHoras(); pintarForm(); });
    grid.append(b);
  }
  cal.append(grid);
}

function pintarHoras() {
  const cont = $("horas"); cont.replaceChildren();
  if (!estado.dia) { const t = document.createElement("p"); t.className = "meta"; t.textContent = "Elige primero un día en el calendario."; cont.append(t); return; }
  const [y, m, d] = estado.dia.split("-").map(Number);
  const t = document.createElement("p"); t.className = "dia-elegido"; t.textContent = cap(fmtDia.format(utc(y, m - 1, d))); cont.append(t);
  const g = document.createElement("div"); g.className = "horas-grid";
  for (const h of horasDelDia()) {
    const b = document.createElement("button"); b.type = "button"; b.className = "hora"; b.textContent = h;
    if (h === estado.hora) { b.classList.add("sel"); b.setAttribute("aria-pressed", "true"); }
    b.addEventListener("click", () => { estado.hora = h; pintarHoras(); pintarForm(); });
    g.append(b);
  }
  cont.append(g);
  const n = document.createElement("p"); n.className = "meta"; n.textContent = "Horas de España. Cada llamada dura 1 hora."; cont.append(n);
}

function pintarForm() {
  const f = $("f-cita"); f.hidden = !(estado.dia && estado.hora);
  if (f.hidden) return;
  const [y, m, d] = estado.dia.split("-").map(Number);
  $("resumen").textContent = `${cap(fmtDia.format(utc(y, m - 1, d)))} a las ${estado.hora} (hora de España)`;
}

$("f-cita").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target; const st = $("estado-cita"); st.classList.remove("error");
  if (f.web.value) return;
  const nombre = f.nombre.value.trim();
  if (!nombre) { st.textContent = "Dinos tu nombre, como prefieras que te llamemos."; st.classList.add("error"); f.nombre.focus(); return; }
  if (!f.acepto.checked) { st.textContent = "Necesitamos que aceptes la política de privacidad."; st.classList.add("error"); f.acepto.focus(); return; }
  if (!estado.dia || !estado.hora) { st.textContent = "Elige un día y una hora."; st.classList.add("error"); return; }
  const [y, m, d] = estado.dia.split("-").map(Number);
  const msg = `Hola, soy ${nombre}. Quiero pedir una llamada online de 1 hora con BE YOU el ${fmtDia.format(utc(y, m - 1, d))} a las ${estado.hora} (hora de España). ¿Me confirmas si te viene bien?`;
  location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  st.textContent = "Se abre WhatsApp con tu petición. Solo tienes que enviarla; la cita queda confirmada cuando Belén te responda.";
});

pintarCalendario(); pintarHoras(); pintarForm();
