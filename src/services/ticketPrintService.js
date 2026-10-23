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

function formatCurrency(value, decimals = 0) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
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

function renderThermalCopy({
  ticket,
  config,
  branch,
  companyName,
  qrImage,
  nameUser,
  controlCopy,
}) {
  const blocks = asObject(config.blocks);
  const branchData = asObject(branch);
  const companyData = asObject(branchData.company);
  const showSeparators = config.showSeparators !== false;
  const section = (content, className = 'ticket-section') => (
    content ? `<div class="${className}">${content}</div>` : ''
  );
  const companyFields = asObject(blocks.companyData?.fields);
  const routeFields = asObject(blocks.route?.fields);
  const dateFields = asObject(blocks.dateTime?.fields);
  const vehicleFields = asObject(blocks.vehicleData?.fields);
  const fareColumns = asObject(blocks.fareDetails?.columns);
  const footerFields = asObject(blocks.footer?.fields);
  const sections = [];

  if (blockEnabled(blocks.logo)) {
    sections.push('<header class="busgo-ticket-logo-header"><div class="logo-box">TV</div></header>');
  }

  if (blockEnabled(blocks.companyData) && (
    companyFields.name !== false
    || companyFields.rut !== false
    || companyFields.address !== false
  )) {
    const company = [];
    if (companyFields.name !== false) {
      company.push(`<strong class="ticket-company-name">${escapeHtml(firstValue(companyName, companyData.name, branchData.name, 'Empresa'))}</strong>`);
    }
    if (companyFields.rut !== false) {
      company.push(`<div class="ticket-preview-row">RUT ${escapeHtml(firstValue(branchData.rut, companyData.rut))}</div>`);
    }
    if (companyFields.address !== false) {
      company.push(`<div class="ticket-preview-row">${escapeHtml(firstValue(branchData.address, companyData.address))}</div>`);
    }
    sections.push(section(company.join(''), 'ticket-section company-section'));
  }

  if (blockEnabled(blocks.tripTitle)) {
    sections.push(section(`<div class="ticket-title">${escapeHtml(blocks.tripTitle.text || 'DETALLE DEL VIAJE')}</div>`, 'ticket-section title-section'));
  }

  if (blockEnabled(blocks.route) && (
    routeFields.origin !== false
    || routeFields.destination !== false
    || routeFields.tripId !== false
  )) {
    const route = [];
    if (routeFields.origin !== false) {
      route.push(`<div class="ticket-place"><span class="ticket-small-label">Origen</span><strong>${escapeHtml(firstValue(ticket.tripOrigin, ticket.origin, ticket.origin_label, 'No especificado'))}</strong></div>`);
    }
    if (routeFields.destination !== false) {
      route.push(`<div class="ticket-place ticket-place--destination"><span class="ticket-small-label">Destino</span><strong>${escapeHtml(firstValue(ticket.tripDestination, ticket.destination, ticket.destination_label, 'No especificado'))}</strong></div>`);
    }
    if (routeFields.tripId !== false) {
      const trip = asObject(ticket.trip);
      const tripId = firstValue(ticket.tripId, ticket.trip_id, trip.id, trip.tripId, trip.trip_id, ticket.id);
      route.push(`<div class="ticket-trip-id"><span>ID del viaje</span><strong>${escapeHtml(tripId)}</strong></div>`);
    }
    sections.push(section(route.join(''), 'ticket-section route-section'));
  }

  if (blockEnabled(blocks.dateTime) && (
    dateFields.tripDate !== false
    || dateFields.departureTime !== false
    || dateFields.arrivalDate !== false
    || dateFields.arrivalTime !== false
  )) {
    const departureValue = firstValue(ticket.departureDateTime, ticket.departure_datetime, ticket.schedule);
    const arrivalValue = firstValue(ticket.arrivalDateTime, ticket.arrival_datetime);
    const dateTime = [];
    if (dateFields.tripDate !== false) {
      dateTime.push(`<div class="ticket-schedule-item"><span class="ticket-small-label">Fecha del viaje</span><strong>${escapeHtml(formatDatePart(firstValue(ticket.tripDate, ticket.trip_date, departureValue)))}</strong></div>`);
    }
    if (dateFields.departureTime !== false) {
      dateTime.push(`<div class="ticket-schedule-item"><span class="ticket-small-label">Hora de salida</span><strong class="ticket-departure-time">${escapeHtml(formatTimePart(departureValue))}</strong></div>`);
    }
    if (dateFields.arrivalDate !== false) {
      dateTime.push(`<div class="ticket-schedule-item"><span class="ticket-small-label">Fecha de llegada</span><strong>${escapeHtml(formatDatePart(firstValue(ticket.arrivalDate, ticket.arrival_date, arrivalValue)))}</strong></div>`);
    }
    if (dateFields.arrivalTime !== false) {
      dateTime.push(`<div class="ticket-schedule-item"><span class="ticket-small-label">Hora de llegada</span><strong>${escapeHtml(formatTimePart(firstValue(ticket.arrivalTime, ticket.arrival_time, arrivalValue)))}</strong></div>`);
    }
    sections.push(section(dateTime.join(''), 'ticket-section ticket-schedule-grid'));
  }

  if (blockEnabled(blocks.vehicleData) && (
    vehicleFields.vehiclePlate !== false
    || vehicleFields.internalNumber !== false
  )) {
    const vehicle = [];
    if (vehicleFields.vehiclePlate !== false) {
      vehicle.push(`<div><span class="ticket-small-label">Patente</span><strong>${escapeHtml(firstValue(ticket.vehiclePlate, ticket.vehicle_plate, ticket.plate))}</strong></div>`);
    }
    if (vehicleFields.internalNumber !== false) {
      vehicle.push(`<div><span class="ticket-small-label">N° interno</span><strong>${escapeHtml(firstValue(ticket.internalNumber, ticket.internal_number))}</strong></div>`);
    }
    sections.push(section(`<div class="ticket-subtitle">Datos del vehículo</div><div class="ticket-vehicle-grid">${vehicle.join('')}</div>`, 'ticket-section vehicle-section'));
  }

  if (blockEnabled(blocks.seats)) {
    const seats = getSeats(ticket);
    if (seats.length || blocks.seats.hideWhenEmpty !== true) {
      const seatsMarkup = seats.length
        ? `<div class="ticket-seat-list">${seats.map((seat) => `<strong class="ticket-seat-number">${escapeHtml(seat)}</strong>`).join('')}</div>`
        : `<div class="ticket-preview-row ticket-empty-seats">${escapeHtml(blocks.seats.emptyMessage || 'NO HAY ASIENTOS REGISTRADOS')}</div>`;
      sections.push(section(`<div class="ticket-subtitle">${escapeHtml(blocks.seats.title || 'ASIENTO(S)')}</div>${seatsMarkup}`, 'ticket-section seats-section'));
    }
  }

  if (blockEnabled(blocks.paymentTitle)) {
    sections.push(section(`<div class="ticket-title">${escapeHtml(blocks.paymentTitle.text || 'DETALLE DE PAGO')}</div>`, 'ticket-section title-section'));
  }

  if (blockEnabled(blocks.fareDetails) && Object.values(fareColumns).some(Boolean)) {
    const items = getTicketItems(ticket);
    const headers = [];
    if (fareColumns.type !== false) headers.push('<th scope="col">Pasaje</th>');
    if (fareColumns.quantity !== false) headers.push('<th scope="col" class="fare-quantity">Cant.</th>');
    if (fareColumns.unitPrice !== false) headers.push('<th scope="col" class="fare-amount">Precio</th>');
    if (fareColumns.subtotal !== false) headers.push('<th scope="col" class="fare-amount">Subtotal</th>');
    const rows = items.map((item) => {
      const name = firstValue(item.ticketTypeName, item.ticket_type_name, item.name, item.description, 'Pasaje');
      const quantity = firstValue(item.quantity, item.cant, 0);
      const unitPrice = firstValue(item.unitPrice, item.unit_price, item.basePrice, item.base_price, item.price, 0);
      const subtotal = firstValue(item.subtotal, item.lineTotal, item.line_total, item.total, Number(unitPrice || 0) * Number(quantity || 0));
      const cells = [];
      if (fareColumns.type !== false) cells.push(`<td>${escapeHtml(name)}</td>`);
      if (fareColumns.quantity !== false) cells.push(`<td class="fare-quantity">${escapeHtml(quantity)}</td>`);
      if (fareColumns.unitPrice !== false) cells.push(`<td class="fare-amount">${escapeHtml(formatCurrency(unitPrice))}</td>`);
      if (fareColumns.subtotal !== false) cells.push(`<td class="fare-amount">${escapeHtml(formatCurrency(subtotal))}</td>`);
      return `<tr>${cells.join('')}</tr>`;
    }).join('');
    if (headers.length) {
      sections.push(section(`<table class="fare-table" aria-label="Detalle de pasajes"><thead><tr>${headers.join('')}</tr></thead><tbody>${rows}</tbody></table>`, 'ticket-section fare-section'));
    }
  }

  if (blockEnabled(blocks.total)) {
    sections.push(section(`<div class="ticket-preview-row total-row"><strong>${escapeHtml(blocks.total.label || 'TOTAL')}</strong><span>${escapeHtml(formatCurrency(ticket.total, Number(blocks.total.decimals || 0)))}</span></div>`, 'ticket-section total-section'));
  }

  if (blockEnabled(blocks.paymentMethod)) {
    sections.push(section(`<div class="ticket-reference-row"><span>${escapeHtml(blocks.paymentMethod.label || 'Medio de pago')}</span><strong>${escapeHtml(firstValue(blocks.paymentMethod.value, ticket.method))}</strong></div>`, 'ticket-section ticket-reference-section'));
  }

  if (blockEnabled(blocks.transactionNumber)) {
    sections.push(section(`<div class="ticket-reference-row"><span>${escapeHtml(blocks.transactionNumber.label || 'N° Transacción')}</span><strong class="ticket-reference-number">${escapeHtml(firstValue(blocks.transactionNumber.value, ticket.transactionId, ticket.transaction_id, '—'))}</strong></div>`, 'ticket-section ticket-reference-section'));
  }

  if (blockEnabled(blocks.qr) && qrImage) {
    const size = Number(blocks.qr.size || 110);
    const alignment = blocks.qr.centered === false ? '0' : '0 auto';
    sections.push(section(`<div class="qr-wrapper" style="width:${size}px;margin:${alignment}"><img src="${escapeHtml(qrImage)}" width="${size}" height="${size}" alt="Código QR" class="qr-image"></div>`, 'ticket-section qr-section'));
  }

  if (blockEnabled(blocks.footer) && (
    footerFields.copyControl !== false
    || footerFields.transactionId !== false
    || footerFields.optionalText !== false
  )) {
    const footer = [];
    if (controlCopy && footerFields.copyControl !== false) footer.push('<div class="ticket-preview-row ticket-copy-label">Copia de control</div>');
    const transactionId = firstValue(ticket.transactionId, ticket.transaction_id);
    if (footerFields.transactionId !== false) footer.push(`<div class="ticket-preview-row">ID ${escapeHtml(transactionId)}</div>`);
    if (footerFields.optionalText !== false && blocks.footer.optionalText) footer.push(`<div class="ticket-preview-row">${escapeHtml(blocks.footer.optionalText)}</div>`);
    if (footer.length) sections.push(section(footer.join(''), 'ticket-section footer-section'));
  }

  const reprintCount = Number(ticket.print ?? ticket.reprintCount ?? ticket.reprint_count ?? 0);
  const reprintNotice = reprintCount > 1
    ? `<div class="ticket-reprint">(COPIA REIMPRESA POR EL OPERADOR ${escapeHtml(nameUser || '')})</div>`
    : '';
  const thermalClass = config.spacing === 'compact' ? ' compact' : '';
  const separatorClass = showSeparators ? '' : ' thermal-paper--no-separators';
  return `<section class="ticket-template-copy ${controlCopy ? 'ticket-template-copy--control' : ''}"><div class="thermal-paper${thermalClass}${separatorClass}">${sections.join('')}${reprintNotice}</div></section>`;
}

function renderCopy({
  ticket,
  config,
  branch,
  companyName,
  qrImage,
  nameUser,
  controlCopy,
}) {
  return renderThermalCopy({ ticket, config, branch, companyName, qrImage, nameUser, controlCopy });
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
  const originalCopy = renderCopy({ ticket, config, branch, companyName, companyImageUrl, qrImage, nameUser, controlCopy: false });
  const controlCopy = renderCopy({ ticket, config, branch, companyName, companyImageUrl, qrImage, nameUser, controlCopy: true });

  return `<div class="ticket-template-print ticket-template-print--${config.spacing === 'compact' ? 'compact' : 'comfortable'}">${originalCopy}${controlCopy}</div>`;
}

export function buildTicketTemplatePrintHtml(options = {}) {
  const markup = buildTicketTemplateMarkup(options);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket de Viaje</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;padding:10px;color:#111;font-size:13px}.ticket-template-print{max-width:100%;margin:0 auto}.ticket-template-copy{break-inside:avoid}.ticket-template-copy--control{margin-top:18px;padding-top:14px;border-top:1px dashed #000}@page{size:auto;margin:0}@media print{body{padding:5px}}
    .thermal-paper{width:100%;max-width:360px;box-sizing:border-box;background:#fff;color:#000;border:1px solid #d9d9d9;padding:18px 15px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;box-shadow:0 4px 12px rgba(0,0,0,.08);overflow-wrap:anywhere}.thermal-paper.compact{padding:12px;line-height:1.3}.ticket-preview-row,.ticket-section,.ticket-title,.ticket-subtitle{width:100%}.ticket-section{border-top:1px dashed #000;padding-top:10px;margin-top:10px}.thermal-paper.compact .ticket-section{padding-top:6px;margin-top:6px}.ticket-section:first-child{border-top:none;padding-top:0;margin-top:0}.thermal-paper--no-separators .ticket-section{border-top:0}.ticket-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.ticket-subtitle{margin-bottom:7px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}.title-section{text-align:center}.thermal-paper>.busgo-ticket-logo-header{display:block!important;width:100%;padding:0 0 7px;text-align:center}.thermal-paper>.busgo-ticket-logo-header>.logo-box{display:grid!important;place-items:center;width:38px;height:38px;margin:0 auto!important;border:2px solid #000;border-radius:7px;color:#000;font-size:14px;font-weight:800}.thermal-paper>.company-section{display:block!important;width:100%;padding-top:0;margin-top:0;border-top:0;text-align:center;font-size:10px;line-height:1.5}.thermal-paper .ticket-company-name{display:block!important;width:100%;margin:0 0 7px;text-align:center!important;font-size:17px;font-weight:800;line-height:1.2}.route-section{border-top:0;padding-top:8px;margin-top:0}.ticket-small-label{display:block;margin-bottom:3px;font-size:9px;font-weight:600;line-height:1.3;text-transform:uppercase;letter-spacing:.04em}.ticket-place+.ticket-place{margin-top:9px}.ticket-place strong{display:block;font-size:14px;font-weight:700;line-height:1.25}.ticket-place--destination strong{font-size:18px;font-weight:800}.ticket-trip-id{display:flex;align-items:baseline;justify-content:center;gap:6px;margin-top:9px;font-size:10px}.ticket-trip-id span{font-weight:500}.ticket-trip-id strong{font-size:11px;font-weight:800;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.ticket-schedule-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 12px;align-items:start}.ticket-schedule-item{min-width:0}.ticket-schedule-item strong{display:block;font-size:12px;line-height:1.3;font-variant-numeric:tabular-nums}.ticket-schedule-item .ticket-departure-time{font-size:23px;font-weight:800;line-height:1}.ticket-vehicle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ticket-vehicle-grid strong{display:block;font-size:14px;font-weight:750;font-variant-numeric:tabular-nums}.ticket-seat-list{display:flex;flex-wrap:wrap;gap:6px}.ticket-seat-number{display:grid;place-items:center;min-width:36px;min-height:30px;padding:3px 7px;color:#000;border:1px solid #000;border-radius:4px;font-size:17px;line-height:1;font-variant-numeric:tabular-nums}.ticket-empty-seats{font-size:10px}.fare-section{margin-top:0;padding-top:7px;border-top:0}.fare-table{width:100%;table-layout:auto;border-collapse:collapse;font-size:11px}.fare-table th{border-bottom:1px solid #000;padding:0 3px 5px 0;font-size:9px;font-weight:700;text-align:left}.fare-table td{border-bottom:0;padding:6px 3px 0 0;text-align:left;overflow-wrap:anywhere}.fare-table .fare-quantity{text-align:center;white-space:nowrap}.fare-table .fare-amount{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.fare-table th:last-child,.fare-table td:last-child{padding-right:0}.total-section{border-top:2px solid #000;padding-top:9px;margin-top:11px}.total-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.total-row>strong{font-size:12px;font-weight:800;text-transform:uppercase}.total-row>span{flex-shrink:0;font-size:23px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums}.ticket-reference-section{padding-top:7px;margin-top:0;border-top:0}.ticket-reference-row{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:3px 10px}.ticket-reference-row>span{font-size:10px}.ticket-reference-row>strong{min-width:0;max-width:100%;font-size:11px;text-align:right;overflow-wrap:anywhere}.ticket-reference-number{font-family:'Courier New',monospace;font-variant-numeric:tabular-nums}.qr-section{padding-top:12px;margin-top:10px;border-top:0}.qr-wrapper{max-width:100%;background:#fff}.qr-image{display:block;max-width:100%;height:auto;border:0;background:#fff}.footer-section{padding-top:8px;margin-top:9px;text-align:center;font-size:9px;line-height:1.5}.ticket-copy-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}.ticket-reprint{text-align:center;font-size:11px;text-transform:uppercase;margin-top:8px}
  </style></head><body>${markup}<script>setTimeout(() => { window.print(); window.close(); }, 300);<\/script></body></html>`;
}
