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
.ticket-template-preview-host { color:#111; font-size:13px; }
.ticket-template-preview-host .ticket-template-print { max-width:100%; margin:0 auto; }
.ticket-template-preview-host .ticket-template-copy { break-inside:avoid; }
.ticket-template-preview-host .ticket-template-copy--control { margin-top:18px; padding-top:14px; border-top:1px dashed #000; }
.ticket-template-preview-host .ticket-template-block { margin-bottom:10px; }
.ticket-template-preview-host .ticket-template-print--compact .ticket-template-block { margin-bottom:6px; }
.ticket-template-preview-host .ticket-template-logo { display:block; width:150px; height:80px; object-fit:contain; margin:0 auto 8px; }
.ticket-template-preview-host .ticket-template-company { text-align:center; }
.ticket-template-preview-host .ticket-template-company-name { font-size:18px; font-weight:700; margin-bottom:5px; }
.ticket-template-preview-host .ticket-template-title,.ticket-template-preview-host .ticket-template-section-title { text-align:center; font-weight:700; font-size:15px; }
.ticket-template-preview-host .ticket-template-section-title { border-bottom:1px solid #111; padding-bottom:5px; }
.ticket-template-preview-host .ticket-template-row { display:flex; justify-content:space-between; gap:12px; margin-bottom:5px; }
.ticket-template-preview-host .ticket-template-row span { font-weight:500; }
.ticket-template-preview-host .ticket-template-row strong { text-align:right; }
.ticket-template-preview-host .ticket-template-seats > div { display:flex; flex-wrap:wrap; gap:5px; margin-top:5px; }
.ticket-template-preview-host .ticket-template-seat { padding:4px 7px; border:1px solid #111; border-radius:4px; }
.ticket-template-preview-host .ticket-template-empty { font-size:11px; }
.ticket-template-preview-host .ticket-template-fares { width:100%; border-collapse:collapse; }
.ticket-template-preview-host .ticket-template-fares th,.ticket-template-preview-host .ticket-template-fares td { padding:4px 3px; border-bottom:1px solid #ddd; text-align:left; }
.ticket-template-preview-host .ticket-template-fares th:not(:first-child),.ticket-template-preview-host .ticket-template-fares td:not(:first-child) { text-align:right; }
.ticket-template-preview-host .ticket-template-total { display:flex; justify-content:space-between; border-top:1px solid #111; padding-top:7px; font-size:16px; }
.ticket-template-preview-host .ticket-template-qr--centered { text-align:center; }
.ticket-template-preview-host .ticket-template-qr img { object-fit:contain; }
.ticket-template-preview-host .ticket-template-control-copy { text-align:center; font-style:italic; margin-bottom:7px; }
.ticket-template-preview-host .ticket-template-footer-text { text-align:center; font-size:11px; }
.ticket-template-preview-host .ticket-template-reprint { text-align:center; font-size:11px; text-transform:uppercase; margin-top:8px; }
.ticket-template-preview-host .ticket-template-separator { border-top:1px dashed #111; margin:10px 0; }
</style>
