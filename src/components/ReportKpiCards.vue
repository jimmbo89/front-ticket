<template>
  <div :class="['collection-kpi-grid', { 'collection-kpi-grid--three': items.length === 3 }]">
    <v-card
      v-for="card in items"
      :key="card.key"
      :class="['collection-kpi-card', `collection-kpi-card--${card.variant}`]"
      elevation="0"
    >
      <v-avatar :color="card.color" class="collection-kpi-icon">
        <v-icon>{{ card.icon }}</v-icon>
      </v-avatar>

      <div>
        <div class="collection-kpi-label">{{ card.label }}</div>
        <div class="collection-kpi-value">{{ card.value }}</div>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "ReportKpiCards",
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.collection-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 0 0 16px;
}

.collection-kpi-card {
  position: relative;
  display: flex;
  min-height: 72px;
  align-items: center;
  gap: 11px;
  padding: 13px 15px !important;
  overflow: hidden;
  background: #ffffff !important;
  border: 1px solid #e8edf5 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035) !important;
}

.collection-kpi-card::after {
  position: absolute;
  top: 0;
  right: 0;
  width: 62px;
  height: 62px;
  content: "";
  background: radial-gradient(circle at 100% 0, rgba(36, 84, 214, 0.09), transparent 68%);
  pointer-events: none;
}

.collection-kpi-card::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  content: "";
  background: #16875a;
}

.collection-kpi-card--passengers::before { background: #4f46e5; }
.collection-kpi-card--prints::before { background: #d97706; }
.collection-kpi-card--revenue::before { background: #2454d6; }
.collection-kpi-card--trips::before { background: #2454d6; }
.collection-kpi-card--incident::before { background: #2454d6; }
.collection-kpi-card--delay::before { background: #d97706; }
.collection-kpi-card--scan::before { background: #16875a; }
.collection-kpi-card--vehicle::before { background: #2454d6; }

.collection-kpi-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.collection-kpi-icon {
  flex: 0 0 36px;
  width: 36px !important;
  height: 36px !important;
  border-radius: 9px !important;
  box-shadow: 0 5px 12px rgba(15, 23, 42, 0.12);
}

.collection-kpi-label {
  color: #526176 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
}

.collection-kpi-value {
  margin-top: 4px !important;
  color: #0f172a !important;
  font-size: 20px !important;
  font-weight: 900 !important;
  letter-spacing: -0.025em;
}

@media (max-width: 1200px) {
  .collection-kpi-grid,
  .collection-kpi-grid--three {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .collection-kpi-grid,
  .collection-kpi-grid--three {
    grid-template-columns: 1fr;
  }
}
</style>
