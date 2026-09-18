/* ==========================================================================
   O GRANDE CIRCO DO PEDRO — script.js
   ========================================================================== */

// URL do Web App do Google Apps Script (backend já existente — não alterar).
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6tcGQIGFlizBWv1JBv3MPtdlucgrk5JRvzGdpoLXhRepHVV_H05PCHND58WpuzeYl/exec';

// Dados fixos do evento, usados no card de informações, no Maps e no .ics.
const EVENT = {
  title: 'Aniversário do Pedro',
  venue: 'Karamelada Park',
  address: 'Av. Gilenilda Alves, 1080, Boa Vista, Vitória da Conquista',
  startDate: '20261018T160000',
  endDate: '20261018T200000', // duração aproximada de 4 horas
};

const MAX_GUESTS = 10;
const params = new URLSearchParams(window.location.search);
const conviteIndividual = params.get('convite') === 'individual';

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  applyInviteMode();
  bindEvents();
  handlePortraitFallback();
  initSceneMotion();
  initScrollCue();
  initPedroGuide();
  els.decreaseGuestsBtn.disabled = true;
});

/* --------------------------------------------------------------------------
   Referências de elementos
   -------------------------------------------------------------------------- */

let els = {};

function cacheElements() {
  els = {
    openingSection: document.getElementById('abertura'),
    rsvpSection: document.getElementById('rsvp'),
    eventSection: document.getElementById('evento'),
    eventInvitation: document.querySelector('.event-invitation'),
    eventTitle: document.getElementById('eventTitle'),
    eventMapsBtn: document.getElementById('eventMapsBtn'),
    pedroGuide: document.getElementById('pedroGuide'),
    scrollAlert: document.getElementById('scrollAlert'),
    rsvpFormWrap: document.getElementById('rsvpFormWrap'),
    confirmationWrap: document.getElementById('confirmationWrap'),
    confirmationTitle: document.getElementById('confirmationTitle'),
    rsvpForm: document.getElementById('rsvpForm'),

    responsavelInput: document.getElementById('responsavel'),
    responsavelError: document.getElementById('responsavelError'),
    faixaEtariaInput: document.getElementById('faixaEtaria'),
    faixaEtariaError: document.getElementById('faixaEtariaError'),

    decreaseGuestsBtn: document.getElementById('decreaseGuestsBtn'),
    increaseGuestsBtn: document.getElementById('increaseGuestsBtn'),
    guestsCountEl: document.getElementById('guestsCount'),
    guestsCounterField: document.getElementById('decreaseGuestsBtn')?.closest('.field'),
    individualInviteNote: document.getElementById('individualInviteNote'),

    guestNamesField: document.getElementById('guestNamesField'),
    guestNamesInput: document.getElementById('guestNames'),
    guestAgesField: document.getElementById('guestAgesField'),
    guestAges: document.getElementById('guestAges'),
    guestAgesError: document.getElementById('guestAgesError'),

    totalPeopleEl: document.getElementById('totalPeople'),

    submitRsvpBtn: document.getElementById('submitRsvpBtn'),
    formStatus: document.getElementById('formStatus'),

    confettiField: document.getElementById('confettiField'),

    viewLocationBtn: document.getElementById('viewLocationBtn'),
    addCalendarBtn: document.getElementById('addCalendarBtn'),
    calendarOptions: document.getElementById('calendarOptions'),
    googleCalendarBtn: document.getElementById('googleCalendarBtn'),
    appleCalendarBtn: document.getElementById('appleCalendarBtn'),
    saveInfoBtn: document.getElementById('saveInfoBtn'),
    shareInviteBtn: document.getElementById('shareInviteBtn'),
    backToInviteBtn: document.getElementById('backToInviteBtn'),
    postActionStatus: document.getElementById('postActionStatus'),

    portraitImg: document.getElementById('portraitImg'),
  };
}

function applyInviteMode() {
  if (!conviteIndividual) return;

  guestsCount = 0;
  els.guestsCounterField.hidden = true;
  els.guestNamesField.hidden = true;
  els.guestAgesField.hidden = true;
  els.guestNamesInput.value = '';
  els.guestAges.replaceChildren();
  els.individualInviteNote.hidden = false;
  els.totalPeopleEl.textContent = '1';
}

let guestsCount = 0;

/* --------------------------------------------------------------------------
   Ligação de eventos
   -------------------------------------------------------------------------- */

function bindEvents() {
  els.decreaseGuestsBtn.addEventListener('click', () => updateGuestCounter(-1));
  els.increaseGuestsBtn.addEventListener('click', () => updateGuestCounter(1));

  els.rsvpForm.addEventListener('submit', submitRSVP);

  els.viewLocationBtn.addEventListener('click', openMaps);
  els.eventMapsBtn.addEventListener('click', openMaps);
  els.addCalendarBtn.addEventListener('click', () => {
    const isOpen = els.addCalendarBtn.getAttribute('aria-expanded') === 'true';
    els.addCalendarBtn.setAttribute('aria-expanded', String(!isOpen));
    els.calendarOptions.hidden = isOpen;
  });
  els.googleCalendarBtn.addEventListener('click', openGoogleCalendar);
  els.appleCalendarBtn.addEventListener('click', addToCalendar);
  els.saveInfoBtn.addEventListener('click', saveInfoCard);
  els.shareInviteBtn.addEventListener('click', shareInvite);
  els.scrollAlert.addEventListener('click', () => {
    els.eventSection.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  });
  els.backToInviteBtn.addEventListener('click', () => {
    els.eventSection.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    els.eventTitle.focus({ preventScroll: true });
  });
}

/* --------------------------------------------------------------------------
   Fallback da caricatura do Pedro
   -------------------------------------------------------------------------- */

function handlePortraitFallback() {
  const portraitStage = els.portraitImg.closest('.portrait-stage');
  const useFallback = () => {
    if (els.portraitImg.getAttribute('src') !== 'assets/pedro.png') {
      els.portraitImg.src = 'assets/pedro.png';
    } else {
      portraitStage.classList.add('portrait-fallback');
    }
  };
  els.portraitImg.addEventListener('error', useFallback);
  if (els.portraitImg.complete && els.portraitImg.naturalWidth === 0) {
    useFallback();
  }
}

function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function initSceneMotion() {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll('.location-layout, .rsvp-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  targets.forEach((target) => {
    target.classList.add('reveal-pending');
    observer.observe(target);
  });
}

function initScrollCue() {
  els.scrollAlert.classList.add('is-visible');

  if (!('IntersectionObserver' in window)) return;

  const cueObserver = new IntersectionObserver(([entry]) => {
    const openingIsVisible = entry.isIntersecting && entry.intersectionRatio >= .35;
    els.scrollAlert.classList.toggle('is-visible', openingIsVisible);
    document.body.classList.toggle('has-scrolled', !openingIsVisible);
  }, { threshold: [0, .35] });

  cueObserver.observe(els.openingSection);
}

function initPedroGuide() {
  if (!('IntersectionObserver' in window)) {
    setPedroState('rsvp');
    return;
  }

  const targets = [
    { element: els.openingSection, state: 'hero' },
    { element: els.eventSection, state: 'location' },
    { element: els.eventInvitation, state: 'details' },
    { element: els.rsvpSection, state: 'rsvp' },
  ];
  const visibility = new Map(targets.map(({ state }) => [state, 0]));
  const updateState = () => {
    let activeState = 'hero';
    let highestRatio = 0;
    visibility.forEach((ratio, state) => {
      if (ratio > highestRatio) {
        highestRatio = ratio;
        activeState = state;
      }
    });
    if (activeState !== 'hero' && visibility.get('hero') > 0) activeState = 'hero';
    if (!els.confirmationWrap.hidden && visibility.get('rsvp') > 0) activeState = 'confirmation';
    setPedroState(activeState);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const target = targets.find(({ element }) => element === entry.target);
      if (target) visibility.set(target.state, entry.isIntersecting ? entry.intersectionRatio : 0);
    });
    updateState();
  }, { threshold: [0, .25, .5, .75], rootMargin: '-12% 0px -20% 0px' });

  targets.forEach(({ element }) => observer.observe(element));
}

function setPedroState(state) {
  const stateClasses = ['hero', 'location', 'details', 'rsvp', 'confirmation'];
  stateClasses.forEach((name) => {
    els.pedroGuide.classList.toggle(`pedro-state-${name}`, state === name);
    els.rsvpSection.classList.toggle(`pedro-state-${name}`, state === name);
  });
  els.pedroGuide.classList.toggle('is-active', state === 'location' || state === 'details');
}

/* --------------------------------------------------------------------------
   Contador de acompanhantes
   -------------------------------------------------------------------------- */

function updateGuestCounter(delta) {
  if (conviteIndividual) return;
  const next = guestsCount + delta;
  if (next < 0 || next > MAX_GUESTS) return;

  guestsCount = next;
  els.guestsCountEl.textContent = String(guestsCount);

  els.decreaseGuestsBtn.disabled = guestsCount === 0;
  els.increaseGuestsBtn.disabled = guestsCount === MAX_GUESTS;

  els.guestNamesField.hidden = false; // precisa estar no fluxo do layout para animar
  if (guestsCount > 0) {
    els.guestNamesField.classList.add('is-visible');
  } else {
    els.guestNamesField.classList.remove('is-visible');
    els.guestNamesField.hidden = true;
  }

  renderGuestAges();

  updateTotalPeople();
}

function renderGuestAges() {
  els.guestAgesField.hidden = guestsCount === 0;
  els.guestAgesError.textContent = '';

  while (els.guestAges.children.length > guestsCount) {
    els.guestAges.lastElementChild.remove();
  }

  while (els.guestAges.children.length < guestsCount) {
    const number = els.guestAges.children.length + 1;
    const wrapper = document.createElement('div');
    wrapper.className = 'guest-age';

    const label = document.createElement('label');
    label.htmlFor = `faixaEtariaAcompanhante${number}`;
    label.textContent = `Acompanhante ${number}`;

    const select = els.faixaEtariaInput.cloneNode(true);
    select.id = label.htmlFor;
    select.name = 'faixasEtariasAcompanhantes[]';
    select.value = '';

    wrapper.append(label, select);
    els.guestAges.appendChild(wrapper);
  }
}

function updateTotalPeople() {
  const total = guestsCount + 1;
  els.totalPeopleEl.textContent = String(total);
}

/* --------------------------------------------------------------------------
   Validação do formulário
   -------------------------------------------------------------------------- */

function validateForm() {
  const name = els.responsavelInput.value.trim();

  if (!name) {
    els.responsavelError.textContent = 'Por favor, digite o nome do responsável.';
    els.responsavelInput.focus();
    return false;
  }

  els.responsavelError.textContent = '';
  els.faixaEtariaError.textContent = '';
  els.guestAgesError.textContent = '';
  return true;
}

/* --------------------------------------------------------------------------
   Envio do RSVP para o Google Apps Script
   -------------------------------------------------------------------------- */

async function submitRSVP(event) {
  event.preventDefault();

  if (!validateForm()) return;

  setSubmittingState(true);

  const responsavel = els.responsavelInput.value.trim();
  const acompanhantes = conviteIndividual ? 0 : guestsCount;
  const nomesAcompanhantes = conviteIndividual ? '' : els.guestNamesInput.value.trim();
  const faixaEtaria = els.faixaEtariaInput.value;
  const guestAgeValues = Array.from(els.guestAges.querySelectorAll('select'),
    (select) => select.value);
  const faixasEtariasAcompanhantes = conviteIndividual ? '' : (guestAgeValues.some(Boolean) ? guestAgeValues.join(' | ') : '');
  const total = conviteIndividual ? 1 : acompanhantes + 1;

  const payload = {
    responsavel,
    acompanhantes,
    nomesAcompanhantes,
    faixaEtaria,
    faixasEtariasAcompanhantes,
    total,
  };

  try {
    // Observação: o Web App do Google Apps Script não retorna cabeçalhos
    // CORS legíveis por fetch quando chamado de outra origem (ex.: GitHub
    // Pages). Por isso usamos "no-cors": o navegador ainda envia o POST
    // normalmente, mas não conseguimos ler o corpo da resposta. Uma
    // requisição que não lança erro de rede é tratada como sucesso; a
    // confirmação definitiva pode ser vista na planilha do Google Sheets.
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    showConfirmation();
  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    showFormError('Não foi possível confirmar sua presença. Tente novamente em alguns instantes.');
    setSubmittingState(false);
  }
}

function setSubmittingState(isSubmitting) {
  els.submitRsvpBtn.disabled = isSubmitting;
  els.submitRsvpBtn.textContent = isSubmitting ? 'Confirmando seu ingresso…' : 'Confirmar presença';

  if (isSubmitting) {
    els.formStatus.classList.remove('is-error');
    els.formStatus.textContent = 'Confirmando seu ingresso…';
  }
}

function showFormError(message) {
  els.formStatus.classList.add('is-error');
  els.formStatus.textContent = message;
}

/* --------------------------------------------------------------------------
   Tela de confirmação
   -------------------------------------------------------------------------- */

function showConfirmation() {
  els.rsvpFormWrap.hidden = true;
  els.confirmationWrap.hidden = false;
  els.rsvpSection.setAttribute('aria-labelledby', 'confirmationTitle');
  setPedroState('confirmation');
  els.formStatus.textContent = '';

  window.requestAnimationFrame(() => {
    els.rsvpSection.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    els.confirmationTitle.focus({ preventScroll: true });
  });

  playConfettiAnimation();
}

function playConfettiAnimation() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  els.confettiField.innerHTML = '';
  const total = 16;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < total; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-star';
    piece.textContent = i % 2 === 0 ? '★' : '✦';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    fragment.appendChild(piece);
  }

  els.confettiField.appendChild(fragment);
}

/* --------------------------------------------------------------------------
   Ver localização (Google Maps)
   -------------------------------------------------------------------------- */

function openMaps() {
  const query = encodeURIComponent(`${EVENT.venue}, ${EVENT.address}`);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  window.open(url, '_blank', 'noopener');
}

/* --------------------------------------------------------------------------
   Ações para guardar e compartilhar o convite
   -------------------------------------------------------------------------- */

function openGoogleCalendar() {
  const url = new URL('https://calendar.google.com/calendar/r/eventedit');
  url.search = new URLSearchParams({
    action: 'TEMPLATE',
    // 16h–20h em Vitória da Conquista (America/Bahia, UTC−3 em 18/10/2026).
    dates: '20261018T190000Z/20261018T230000Z',
    stz: 'America/Bahia',
    etz: 'America/Bahia',
    text: EVENT.title,
    details: 'O Grande Circo do Pedro',
    location: `${EVENT.venue}, ${EVENT.address}`,
  }).toString();
  window.open(url.toString(), '_blank', 'noopener');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function createInfoCardBlob() {
  if (document.fonts?.ready) await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');

  const background = ctx.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, '#172c43');
  background.addColorStop(.55, '#345573');
  background.addColorStop(1, '#172c43');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1080, 1350);

  const glow = ctx.createRadialGradient(760, 610, 30, 760, 610, 600);
  glow.addColorStop(0, 'rgba(238, 217, 155, .22)');
  glow.addColorStop(1, 'rgba(238, 217, 155, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1350);

  roundedRect(ctx, 38, 38, 1004, 1274, 38);
  ctx.strokeStyle = '#c9a44e';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#eed99b';
  ctx.font = '700 28px Manrope, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CONVITE PARA GUARDAR', 82, 126);
  ctx.fillStyle = 'rgba(238, 217, 155, .55)';
  ctx.fillRect(82, 151, 916, 2);

  ctx.fillStyle = '#fbf3e3';
  ctx.font = '700 78px Fraunces, Georgia, serif';
  ctx.fillText('O GRANDE CIRCO', 78, 264);
  ctx.fillStyle = '#eed99b';
  ctx.font = '700 114px Fraunces, Georgia, serif';
  ctx.fillText('DO PEDRO', 75, 380);

  roundedRect(ctx, 82, 476, 455, 309, 28);
  const ticket = ctx.createLinearGradient(82, 476, 537, 785);
  ticket.addColorStop(0, '#b51d38');
  ticket.addColorStop(1, '#86172d');
  ctx.fillStyle = ticket;
  ctx.fill();
  ctx.strokeStyle = '#eed99b';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fbf3e3';
  ctx.font = '700 205px Fraunces, Georgia, serif';
  ctx.fillText('18', 111, 674);
  ctx.fillStyle = '#eed99b';
  ctx.font = '700 45px Fraunces, Georgia, serif';
  ctx.fillText('16H', 354, 645);
  ctx.font = '700 40px Manrope, sans-serif';
  ctx.fillText('DE OUTUBRO', 116, 748);

  const pedro = new Image();
  pedro.src = new URL('assets/pedro.png', document.baseURI).href;
  try {
    await pedro.decode();
    ctx.save();
    ctx.shadowColor = 'rgba(5, 16, 29, .42)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 14;
    ctx.drawImage(pedro, 635, 423, 334, 446);
    ctx.restore();
  } catch (_) { /* O card continua legível caso a imagem não carregue. */ }

  roundedRect(ctx, 82, 852, 916, 382, 28);
  ctx.fillStyle = '#fbf3e3';
  ctx.fill();
  ctx.strokeStyle = '#c9a44e';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#86172d';
  ctx.fillRect(116, 899, 76, 6);
  ctx.fillStyle = '#172c43';
  ctx.font = '700 57px Fraunces, Georgia, serif';
  ctx.fillText(EVENT.venue.toUpperCase(), 116, 978);
  const addressParts = EVENT.address.split(', ');
  ctx.fillStyle = '#345573';
  ctx.font = '600 37px Manrope, sans-serif';
  ctx.fillText(`${addressParts[0]}, ${addressParts[1]}`, 116, 1048);
  ctx.fillText(addressParts[2], 116, 1098);
  ctx.fillText(addressParts.slice(3).join(', '), 116, 1148);
  ctx.fillStyle = '#86172d';
  ctx.font = '600 29px Manrope, sans-serif';
  ctx.fillText('Esperamos você para esse grande espetáculo!', 116, 1202);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Não foi possível gerar o PNG')), 'image/png');
  });
}

async function saveInfoCard() {
  els.saveInfoBtn.disabled = true;
  els.postActionStatus.textContent = 'Preparando imagem…';
  try {
    const blob = await createInfoCardBlob();
    const filename = 'convite-pedro-informacoes.png';
    if (typeof File !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'O Grande Circo do Pedro' });
          els.postActionStatus.textContent = 'Imagem enviada ao compartilhamento.';
          return;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          els.postActionStatus.textContent = '';
          return;
        }
      }
    }
    downloadBlob(blob, filename);
    els.postActionStatus.textContent = 'Imagem pronta para salvar no celular.';
  } catch (error) {
    console.error('Erro ao gerar o card:', error);
    els.postActionStatus.textContent = 'Não foi possível gerar a imagem. Tente novamente.';
  } finally {
    els.saveInfoBtn.disabled = false;
  }
}

async function copyInviteText(text) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* Tenta cópia tradicional. */ }
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  document.body.appendChild(field);
  try {
    field.select();
    return document.execCommand('copy');
  } finally {
    field.remove();
    els.shareInviteBtn.focus();
  }
}

async function shareInvite() {
  const pageUrl = /^https?:$/.test(window.location.protocol) ? window.location.href : '';
  const text = `O Grande Circo do Pedro\n18 de outubro às 16h\n${EVENT.venue}\n${EVENT.address}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'O Grande Circo do Pedro', text, ...(pageUrl ? { url: pageUrl } : {}) });
      els.postActionStatus.textContent = 'Convite compartilhado.';
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  try {
    const copied = await copyInviteText(`${text}${pageUrl ? `\n${pageUrl}` : ''}`);
    els.postActionStatus.textContent = copied ? 'Informações copiadas.' : 'Não foi possível copiar as informações.';
  } catch (_) {
    els.postActionStatus.textContent = 'Não foi possível copiar as informações.';
  }
}

/* --------------------------------------------------------------------------
   Adicionar ao calendário (.ics gerado no navegador)
   -------------------------------------------------------------------------- */

function addToCalendar() {
  const icsContent = buildIcsContent();
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  downloadBlob(blob, 'aniversario-do-pedro.ics');
  els.postActionStatus.textContent = 'Arquivo de calendário pronto para abrir.';
}

function buildIcsContent() {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//O Grande Circo do Pedro//Convite//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@o-grande-circo-do-pedro`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${EVENT.startDate}`,
    `DTEND:${EVENT.endDate}`,
    `SUMMARY:${EVENT.title}`,
    `LOCATION:${EVENT.venue} - ${EVENT.address}`,
    'DESCRIPTION:Um espetaculo muito especial esta prestes a comecar.',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

function toUtcStamp(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T` +
    `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}
