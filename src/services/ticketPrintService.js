function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') ?? '';
}

function blockEnabled(block) {
  return asObject(block).enabled !== false;
}

function fieldEnabled(block, field) {
  const normalizedBlock = asObject(block);
  return blockEnabled(normalizedBlock)
    && (!normalizedBlock.fields || normalizedBlock.fields[field] !== false);
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function formatDatePart(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimePart(value) {
  if (!value) return '';
  const raw = String(value);
  const timeMatch = raw.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
  if (timeMatch) return timeMatch[1];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function formatMoney(value, decimals = 0) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

function getTicketItems(ticket) {
  return toArray(ticket?.ticketItems ?? ticket?.ticketitems ?? ticket?.tickettypes ?? ticket?.ticket_types);
}

function getSeats(ticket) {
  return toArray(ticket?.seats ?? ticket?.selectedSeats ?? ticket?.seatMap)
    .map((seat) => {
      if (seat && typeof seat === 'object') {
        return firstValue(seat.number, seat.seat, seat.seat_number, seat.name, seat.id);
      }
      return seat;
    })
    .filter((seat) => seat !== '');
}

function renderLabelValue(label, value) {
  if (value === undefined || value === null || value === '') return '';
  return `<div class="ticket-template-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderSeparator(enabled) {
  return enabled ? '<div class="ticket-template-separator"></div>' : '';
}

function renderCopy({
  ticket,
  config,
  branch,
  companyName,
  companyImageUrl,
  qrImage,
  nameUser,
  controlCopy,
}) {
  const blocks = asObject(config.blocks);
  const branchData = asObject(branch);
  const companyData = asObject(branchData.company);
  const showSeparators = config.showSeparators !== false;
  const sections = [];
  const pushSection = (content) => {
    if (content) sections.push(`<div class="ticket-template-block">${content}</div>`);
  };

  if (blockEnabled(blocks.logo) && companyImageUrl) {
    pushSection(`<img class="ticket-template-logo" src="${escapeHtml(companyImageUrl)}" alt="${escapeHtml(companyName)}">`);
  }

  if (blockEnabled(blocks.companyData)) {
    const companyFields = asObject(blocks.companyData.fields);
    const values = [];
    if (companyFields.name !== false) {
      values.push(`<div class="ticket-template-company-name">${escapeHtml(firstValue(companyName, companyData.name, branchData.name, 'Empresa'))}</div>`);
    }
    if (companyFields.rut !== false) {
      values.push(renderLabelValue('RUT:', firstValue(branchData.rut, companyData.rut)));
    }
    if (companyFields.address !== false) {
      values.push(renderLabelValue('Dirección:', firstValue(branchData.address, companyData.address)));
    }
    if (values.length) pushSection(`<div class="ticket-template-company">${values.join('')}</div>`);
  }

  if (blockEnabled(blocks.tripTitle)) {
    pushSection(`<div class="ticket-template-title">${escapeHtml(blocks.tripTitle.text || 'DETALLE DEL VIAJE')}</div>`);
  }

  if (blockEnabled(blocks.route)) {
    const routeFields = asObject(blocks.route.fields);
    const route = [];
    if (routeFields.origin !== false) {
      route.push(renderLabelValue('Origen:', firstValue(ticket.tripOrigin, ticket.origin, ticket.origin_label, 'No especificado')));
    }
    if (routeFields.destination !== false) {
      route.push(renderLabelValue('Destino:', firstValue(ticket.tripDestination, ticket.destination, ticket.destination_label, 'No especificado')));
    }
    if (routeFields.tripId !== false) {
      route.push(renderLabelValue('Folio:', ticket.id));
    }
    if (route.length) pushSection(`<div class="ticket-template-route">${route.join('')}</div>`);
  }

  if (blockEnabled(blocks.dateTime)) {
    const dateFields = asObject(blocks.dateTime.fields);
    const departureValue = firstValue(ticket.departureDateTime, ticket.departure_datetime, ticket.schedule);
    const arrivalValue = firstValue(ticket.arrivalDateTime, ticket.arrival_datetime);
    const dateTime = [];
    if (dateFields.tripDate !== false) {
      dateTime.push(renderLabelValue('Fecha del viaje:', formatDatePart(firstValue(ticket.tripDate, ticket.trip_date, departureValue))));
    }
    if (dateFields.departureTime !== false) {
      dateTime.push(renderLabelValue('Hora de salida:', formatTimePart(departureValue)));
    }
    if (dateFields.arrivalDate !== false) {
      dateTime.push(renderLabelValue('Fecha de llegada:', formatDatePart(firstValue(ticket.arrivalDate, ticket.arrival_date, arrivalValue))));
    }
    if (dateFields.arrivalTime !== false) {
      dateTime.push(renderLabelValue('Hora de llegada:', formatTimePart(firstValue(ticket.arrivalTime, ticket.arrival_time, arrivalValue))));
    }
    if (dateTime.some(Boolean)) pushSection(`<div class="ticket-template-datetime">${dateTime.join('')}</div>`);
  }

  if (blockEnabled(blocks.vehicleData)) {
    const vehicleFields = asObject(blocks.vehicleData.fields);
    const vehicle = [];
    if (vehicleFields.vehiclePlate !== false) {
      vehicle.push(renderLabelValue('Patente:', firstValue(ticket.vehiclePlate, ticket.vehicle_plate, ticket.plate)));
    }
    if (vehicleFields.internalNumber !== false) {
      vehicle.push(renderLabelValue('N.º interno:', firstValue(ticket.internalNumber, ticket.internal_number)));
    }
    if (vehicle.some(Boolean)) pushSection(`<div class="ticket-template-vehicle">${vehicle.join('')}</div>`);
  }

  if (blockEnabled(blocks.seats)) {
    const seats = getSeats(ticket);
    if (seats.length || blocks.seats.hideWhenEmpty !== true) {
      const content = seats.length
        ? seats.map((seat) => `<span class="ticket-template-seat">${escapeHtml(seat)}</span>`).join('')
        : `<span class="ticket-template-empty">${escapeHtml(blocks.seats.emptyMessage || 'NO HAY ASIENTOS REGISTRADOS')}</span>`;
      pushSection(`<div class="ticket-template-seats"><strong>${escapeHtml(blocks.seats.title || 'ASIENTO(S)')}</strong><div>${content}</div></div>`);
    }
  }

  if (blockEnabled(blocks.paymentTitle)) {
    pushSection(`<div class="ticket-template-section-title">${escapeHtml(blocks.paymentTitle.text || 'DETALLE DE PAGO')}</div>`);
  }

  if (blockEnabled(blocks.fareDetails)) {
    const columns = asObject(blocks.fareDetails.columns);
    const items = getTicketItems(ticket);
    const rows = items.map((item) => {
      const name = firstValue(item.ticketTypeName, item.ticket_type_name, item.name, item.description, 'Pasaje');
      const quantity = firstValue(item.quantity, item.cant, 0);
      const unitPrice = firstValue(item.unitPrice, item.unit_price, item.basePrice, item.base_price, item.price, 0);
      const subtotal = firstValue(item.subtotal, item.lineTotal, item.line_total, item.total, Number(unitPrice || 0) * Number(quantity || 0));
      return `<tr><td>${escapeHtml(name)}</td>${columns.quantity === false ? '' : `<td>${escapeHtml(quantity)}</td>`}${columns.unitPrice === false ? '' : `<td>$${formatMoney(unitPrice)}</td>`}${columns.subtotal === false ? '' : `<td>$${formatMoney(subtotal)}</td>`}</tr>`;
    }).join('');
    if (rows) {
      pushSection(`<table class="ticket-template-fares"><thead><tr><th>${escapeHtml(columns.type === false ? '' : 'Tipo')}</th>${columns.quantity === false ? '' : '<th>Cant.</th>'}${columns.unitPrice === false ? '' : '<th>Precio</th>'}${columns.subtotal === false ? '' : '<th>Subtotal</th>'}</tr></thead><tbody>${rows}</tbody></table>`);
    }
  }

  if (blockEnabled(blocks.total)) {
    pushSection(`<div class="ticket-template-total"><span>${escapeHtml(blocks.total.label || 'TOTAL')}</span><strong>$${formatMoney(ticket.total, Number(blocks.total.decimals || 0))}</strong></div>`);
  }

  if (blockEnabled(blocks.paymentMethod) && fieldEnabled(blocks.paymentMethod, 'enabled')) {
    pushSection(renderLabelValue(blocks.paymentMethod.label || 'Medio de pago', firstValue(ticket.method, blocks.paymentMethod.value)));
  }

  if (blockEnabled(blocks.transactionNumber) && fieldEnabled(blocks.transactionNumber, 'enabled')) {
    pushSection(renderLabelValue(blocks.transactionNumber.label || 'N.º Transacción', firstValue(ticket.transactionId, ticket.transaction_id, blocks.transactionNumber.value, '—')));
  }

  if (blockEnabled(blocks.qr) && qrImage) {
    const size = Number(blocks.qr.size || 110);
    pushSection(`<div class="ticket-template-qr${blocks.qr.centered === false ? '' : ' ticket-template-qr--centered'}"><img src="${escapeHtml(qrImage)}" width="${size}" height="${size}" alt="Código QR"></div>`);
  }

  if (blockEnabled(blocks.footer)) {
    const footerFields = asObject(blocks.footer.fields);
    const footer = [];
    if (controlCopy && footerFields.copyControl !== false) footer.push('<div class="ticket-template-control-copy">-Copia de control-</div>');
    const transactionId = firstValue(ticket.transactionId, ticket.transaction_id);
    if (footerFields.transactionId !== false && transactionId) footer.push(renderLabelValue('ID de transacción:', transactionId));
    if (footerFields.vehiclePlate !== false && firstValue(ticket.vehiclePlate, ticket.vehicle_plate, ticket.plate)) footer.push(renderLabelValue('Patente:', firstValue(ticket.vehiclePlate, ticket.vehicle_plate, ticket.plate)));
    if (footerFields.optionalText !== false && blocks.footer.optionalText) footer.push(`<div class="ticket-template-footer-text">${escapeHtml(blocks.footer.optionalText)}</div>`);
    if (footer.length) pushSection(`<div class="ticket-template-footer">${footer.join('')}</div>`);
  }

  const reprintCount = Number(ticket.print ?? ticket.reprintCount ?? ticket.reprint_count ?? 0);
  const reprintNotice = reprintCount > 1
    ? `<div class="ticket-template-reprint">(COPIA REIMPRESA POR EL OPERADOR ${escapeHtml(nameUser || '')})</div>`
    : '';

  return `<section class="ticket-template-copy ${controlCopy ? 'ticket-template-copy--control' : ''}">${sections.join(renderSeparator(showSeparators))}${reprintNotice}</section>`;
}

export function getTicketTemplateConfig(ticket = {}) {
  let config = ticket.ticket_template_config ?? ticket.ticketTemplateConfig;

  for (let attempt = 0; attempt < 3 && typeof config === 'string'; attempt += 1) {
    const serializedConfig = config.trim();
    if (!serializedConfig) return null;

    try {
      config = JSON.parse(serializedConfig);
    } catch (error) {
      return null;
    }
  }

  return config && typeof config === 'object' && !Array.isArray(config) ? config : null;
}

export function buildTicketTemplateMarkup({
  ticket = {},
  config = {},
  branch = {},
  companyName = 'Empresa',
  companyImageUrl = '',
  qrImage = '',
  nameUser = '',
} = {}) {
  return `<div class="ticket-template-print ticket-template-print--${config.spacing === 'compact' ? 'compact' : 'comfortable'}">${renderCopy({ ticket, config, branch, companyName, companyImageUrl, qrImage, nameUser, controlCopy: false })}${renderCopy({ ticket, config, branch, companyName, companyImageUrl, qrImage, nameUser, controlCopy: true })}</div>`;
}

export function buildTicketTemplatePrintHtml(options = {}) {
  const markup = buildTicketTemplateMarkup(options);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket de Viaje</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;padding:10px;color:#111;font-size:13px}.ticket-template-print{max-width:100%;margin:0 auto}.ticket-template-copy{break-inside:avoid}.ticket-template-copy--control{margin-top:18px;padding-top:14px;border-top:1px dashed #000}.ticket-template-block{margin-bottom:10px}.ticket-template-print--compact .ticket-template-block{margin-bottom:6px}.ticket-template-logo{display:block;width:150px;height:80px;object-fit:contain;margin:0 auto 8px}.ticket-template-company{text-align:center}.ticket-template-company-name{font-size:18px;font-weight:700;margin-bottom:5px}.ticket-template-title,.ticket-template-section-title{text-align:center;font-weight:700;font-size:15px}.ticket-template-section-title{border-bottom:1px solid #111;padding-bottom:5px}.ticket-template-row{display:flex;justify-content:space-between;gap:12px;margin-bottom:5px}.ticket-template-row span{font-weight:500}.ticket-template-row strong{text-align:right}.ticket-template-seats>div{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}.ticket-template-seat{padding:4px 7px;border:1px solid #111;border-radius:4px}.ticket-template-empty{font-size:11px}.ticket-template-fares{width:100%;border-collapse:collapse}.ticket-template-fares th,.ticket-template-fares td{padding:4px 3px;border-bottom:1px solid #ddd;text-align:left}.ticket-template-fares th:not(:first-child),.ticket-template-fares td:not(:first-child){text-align:right}.ticket-template-total{display:flex;justify-content:space-between;border-top:1px solid #111;padding-top:7px;font-size:16px}.ticket-template-qr--centered{text-align:center}.ticket-template-qr img{object-fit:contain}.ticket-template-control-copy{text-align:center;font-style:italic;margin-bottom:7px}.ticket-template-footer-text{text-align:center;font-size:11px}.ticket-template-reprint{text-align:center;font-size:11px;text-transform:uppercase;margin-top:8px}.ticket-template-separator{border-top:1px dashed #111;margin:10px 0}@page{size:auto;margin:0}@media print{body{padding:5px}}
  </style></head><body>${markup}<script>setTimeout(() => { window.print(); window.close(); }, 300);<\/script></body></html>`;
}
