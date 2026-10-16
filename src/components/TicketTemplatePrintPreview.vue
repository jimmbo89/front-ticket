<template>
  <div class="ticket-template-preview-host" v-html="markup"></div>
</template>

<script>
import { buildTicketTemplateMarkup } from '@/services/ticketPrintService';

export default {
  name: 'TicketTemplatePrintPreview',
  props: {
    ticket: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
    branch: { type: Object, default: () => ({}) },
    companyName: { type: String, default: 'Empresa' },
    companyImageUrl: { type: String, default: '' },
    qrImage: { type: String, default: '' },
    nameUser: { type: String, default: '' },
  },
  computed: {
    markup() {
      return buildTicketTemplateMarkup({
        ticket: this.ticket,
        config: this.config,
        branch: this.branch,
        companyName: this.companyName,
        companyImageUrl: this.companyImageUrl,
        qrImage: this.qrImage,
        nameUser: this.nameUser,
      });
    },
  },
};
</script>

<style>
.ticket-template-preview-host { color:#111; font-family:Arial,Helvetica,sans-serif; font-size:13px; }
.ticket-template-preview-host,.ticket-template-preview-host * { box-sizing:border-box; }
.ticket-template-preview-host .ticket-template-print { max-width:100%; margin:0 auto; }
.ticket-template-preview-host .ticket-template-copy { break-inside:avoid; }
.ticket-template-preview-host .ticket-template-copy--control { margin-top:18px; padding-top:14px; border-top:1px dashed #000; }
.ticket-template-preview-host .thermal-paper { width:100%; max-width:360px; box-sizing:border-box; background:#fff; color:#000; border:1px solid #d9d9d9; padding:18px 15px; margin:0 auto; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.4; box-shadow:0 4px 12px rgba(0,0,0,.08); overflow-wrap:anywhere; }
.ticket-template-preview-host .thermal-paper.compact { padding:12px; line-height:1.3; }
.ticket-template-preview-host .ticket-preview-row,.ticket-template-preview-host .ticket-section,.ticket-template-preview-host .ticket-title,.ticket-template-preview-host .ticket-subtitle { width:100%; }
.ticket-template-preview-host .ticket-section { border-top:1px dashed #000; padding-top:10px; margin-top:10px; }
.ticket-template-preview-host .thermal-paper.compact .ticket-section { padding-top:6px; margin-top:6px; }
.ticket-template-preview-host .ticket-section:first-child { border-top:none; padding-top:0; margin-top:0; }
.ticket-template-preview-host .thermal-paper--no-separators .ticket-section { border-top:0; }
.ticket-template-preview-host .ticket-title { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.09em; }
.ticket-template-preview-host .ticket-subtitle { margin-bottom:7px; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.07em; }
.ticket-template-preview-host .title-section { text-align:center; }
.ticket-template-preview-host .thermal-paper > .busgo-ticket-logo-header { display:block!important; width:100%; padding:0 0 7px; text-align:center; }
.ticket-template-preview-host .thermal-paper > .busgo-ticket-logo-header > .logo-box { display:grid!important; place-items:center; width:38px; height:38px; margin:0 auto!important; border:2px solid #000; border-radius:7px; color:#000; font-size:14px; font-weight:800; }
.ticket-template-preview-host .thermal-paper > .company-section { display:block!important; width:100%; padding-top:0; margin-top:0; border-top:0; text-align:center; font-size:10px; line-height:1.5; }
.ticket-template-preview-host .thermal-paper .ticket-company-name { display:block!important; width:100%; margin:0 0 7px; text-align:center!important; font-size:17px; font-weight:800; line-height:1.2; }
.ticket-template-preview-host .route-section { border-top:0; padding-top:8px; margin-top:0; }
.ticket-template-preview-host .ticket-small-label { display:block; margin-bottom:3px; font-size:9px; font-weight:600; line-height:1.3; text-transform:uppercase; letter-spacing:.04em; }
.ticket-template-preview-host .ticket-place + .ticket-place { margin-top:9px; }
.ticket-template-preview-host .ticket-place strong { display:block; font-size:14px; font-weight:700; line-height:1.25; }
.ticket-template-preview-host .ticket-place--destination strong { font-size:18px; font-weight:800; }
.ticket-template-preview-host .ticket-trip-id { display:flex; align-items:baseline; justify-content:center; gap:6px; margin-top:9px; font-size:10px; }
.ticket-template-preview-host .ticket-trip-id span { font-weight:500; }
.ticket-template-preview-host .ticket-trip-id strong { font-size:11px; font-weight:800; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.ticket-template-preview-host .ticket-schedule-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px 12px; align-items:start; }
.ticket-template-preview-host .ticket-schedule-item { min-width:0; }
.ticket-template-preview-host .ticket-schedule-item strong { display:block; font-size:12px; line-height:1.3; font-variant-numeric:tabular-nums; }
.ticket-template-preview-host .ticket-schedule-item .ticket-departure-time { font-size:23px; font-weight:800; line-height:1; }
.ticket-template-preview-host .ticket-vehicle-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.ticket-template-preview-host .ticket-vehicle-grid strong { display:block; font-size:14px; font-weight:750; font-variant-numeric:tabular-nums; }
.ticket-template-preview-host .ticket-seat-list { display:flex; flex-wrap:wrap; gap:6px; }
.ticket-template-preview-host .ticket-seat-number { display:grid; place-items:center; min-width:36px; min-height:30px; padding:3px 7px; color:#000; border:1px solid #000; border-radius:4px; font-size:17px; line-height:1; font-variant-numeric:tabular-nums; }
.ticket-template-preview-host .ticket-empty-seats { font-size:10px; }
.ticket-template-preview-host .fare-section { margin-top:0; padding-top:7px; border-top:0; }
.ticket-template-preview-host .fare-table { width:100%; table-layout:auto; border-collapse:collapse; font-size:11px; }
.ticket-template-preview-host .fare-table th { border-bottom:1px solid #000; padding:0 3px 5px 0; font-size:9px; font-weight:700; text-align:left; }
.ticket-template-preview-host .fare-table td { border-bottom:0; padding:6px 3px 0 0; text-align:left; overflow-wrap:anywhere; }
.ticket-template-preview-host .fare-table .fare-quantity { text-align:center; white-space:nowrap; }
.ticket-template-preview-host .fare-table .fare-amount { text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }
.ticket-template-preview-host .fare-table th:last-child,.ticket-template-preview-host .fare-table td:last-child { padding-right:0; }
.ticket-template-preview-host .total-section { border-top:2px solid #000; padding-top:9px; margin-top:11px; }
.ticket-template-preview-host .total-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.ticket-template-preview-host .total-row > strong { font-size:12px; font-weight:800; text-transform:uppercase; }
.ticket-template-preview-host .total-row > span { flex-shrink:0; font-size:23px; font-weight:800; line-height:1.1; font-variant-numeric:tabular-nums; }
.ticket-template-preview-host .ticket-reference-section { padding-top:7px; margin-top:0; border-top:0; }
.ticket-template-preview-host .ticket-reference-row { display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:3px 10px; }
.ticket-template-preview-host .ticket-reference-row > span { font-size:10px; }
.ticket-template-preview-host .ticket-reference-row > strong { min-width:0; max-width:100%; font-size:11px; text-align:right; overflow-wrap:anywhere; }
.ticket-template-preview-host .ticket-reference-number { font-family:'Courier New',monospace; font-variant-numeric:tabular-nums; }
.ticket-template-preview-host .qr-section { padding-top:12px; margin-top:10px; border-top:0; }
.ticket-template-preview-host .qr-wrapper { max-width:100%; background:#fff; }
.ticket-template-preview-host .qr-image { display:block; max-width:100%; height:auto; border:0; background:#fff; }
.ticket-template-preview-host .footer-section { padding-top:8px; margin-top:9px; text-align:center; font-size:9px; line-height:1.5; }
.ticket-template-preview-host .ticket-copy-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
.ticket-template-preview-host .ticket-reprint { text-align:center; font-size:11px; text-transform:uppercase; margin-top:8px; }
</style>
