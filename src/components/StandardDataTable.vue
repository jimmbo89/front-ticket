<template>
  <v-data-table
    v-bind="$attrs"
    class="standard-data-table"
    :headers="normalizedHeaders"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "StandardDataTable",

  inheritAttrs: false,

  props: {
    headers: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    normalizedHeaders() {
      return this.headers.map((header) => {
        if (typeof header === "string") {
          return { title: this.toUpperCase(header), key: header };
        }

        if (!header || typeof header !== "object") {
          return header;
        }

        const key = header.key || header.value;
        const isActionColumn = key === "actions" || key === "data-table-expand";
        const sourceTitle = header.title || header.text || "";
        const title = sourceTitle || (isActionColumn ? "Acciones" : "");

        return {
          ...header,
          title: this.toUpperCase(title),
          align: isActionColumn ? "center" : header.align,
          sortable: isActionColumn ? false : header.sortable,
          headerProps: {
            ...(header.headerProps || {}),
            class: this.mergeClass(
              header.headerProps?.class,
              isActionColumn
                ? "standard-table-actions-header"
                : "standard-table-header-cell"
            ),
          },
          ...(isActionColumn
            ? { cellProps: this.normalizeCellProps(header.cellProps) }
            : {}),
        };
      });
    },
  },

  methods: {
    mergeClass(existingClass, standardClass) {
      return existingClass ? [existingClass, standardClass] : standardClass;
    },

    normalizeCellProps(cellProps) {
      if (typeof cellProps === "function") {
        return (...args) => {
          const props = cellProps(...args) || {};
          return {
            ...props,
            class: this.mergeClass(props.class, "standard-table-action-cell"),
          };
        };
      }

      return {
        ...(cellProps || {}),
        class: this.mergeClass(cellProps?.class, "standard-table-action-cell"),
      };
    },

    toUpperCase(value) {
      return String(value).toLocaleUpperCase("es-ES");
    },
  },
};
</script>

<style>
.standard-data-table {
  --standard-table-header-bg: #f8fafc;
  --standard-table-header-border: #e8edf5;
  --standard-table-header-color: #334155;
  --standard-table-header-size: 11px;
  --standard-table-header-weight: 850;
  --standard-table-header-spacing: 0.04em;
}

.standard-data-table :is(.v-data-table__th, .v-data-table-header__content) {
  font-family: inherit;
}

.standard-data-table .v-data-table__th {
  height: 40px !important;
  color: var(--standard-table-header-color) !important;
  background: var(--standard-table-header-bg) !important;
  border-bottom: 1px solid var(--standard-table-header-border) !important;
  font-size: var(--standard-table-header-size) !important;
  font-weight: var(--standard-table-header-weight) !important;
  letter-spacing: var(--standard-table-header-spacing);
  text-transform: uppercase;
  white-space: nowrap;
}

.standard-data-table .standard-table-header-cell,
.standard-data-table .standard-table-actions-header {
  font-family: inherit !important;
  text-transform: uppercase !important;
}

.standard-data-table .standard-table-header,
.standard-data-table .standard-table-header > *,
.standard-data-table .standard-table-header .v-card-text,
.standard-data-table .standard-table-header button {
  font-family: inherit !important;
  font-size: 11px !important;
  font-weight: 850 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
}

.standard-data-table .standard-table-header__actions {
  text-align: right !important;
  justify-content: flex-end !important;
}

.standard-data-table .standard-table-actions-header {
  text-align: center !important;
}

.standard-data-table .standard-table-actions-header .v-data-table-header__content {
  justify-content: center !important;
}

.standard-data-table .standard-table-actions-heading {
  display: flex !important;
  align-items: center !important;
  text-align: center !important;
  justify-content: center !important;
}

.standard-data-table .standard-table-action-cell {
  text-align: right !important;
}

.standard-data-table .standard-table-action-cell > :where(
  .action-buttons,
  .action-cell,
  .actions,
  .table-actions,
  .structure-actions,
  .trip-worker-assignment-inline,
  .busgo-actions
) {
  display: flex !important;
  justify-content: flex-end !important;
  margin-inline-start: auto;
}

.standard-data-table :where(
  .action-buttons,
  .action-cell,
  .actions,
  .table-actions,
  .structure-actions,
  .trip-worker-assignment-inline,
  .template-row-actions,
  .collection-route-actions,
  .busgo-actions
) {
  justify-content: flex-end !important;
}

.standard-data-table .v-data-table-header__content {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
}

.standard-data-table .v-data-table__th--sortable {
  cursor: pointer;
  user-select: none;
}

.standard-data-table .v-data-table-header__sort-icon {
  display: inline-flex !important;
  visibility: visible !important;
  flex: 0 0 auto;
  width: 15px !important;
  height: 15px !important;
  margin-left: 1px !important;
  color: #94a3b8 !important;
  font-size: 15px !important;
  opacity: 0.72 !important;
  transition: color 0.18s ease, opacity 0.18s ease;
}

.standard-data-table .v-data-table__th--sorted,
.standard-data-table .v-data-table__th--sortable:hover {
  color: #2454d6 !important;
  background: #f5f7ff !important;
}

.standard-data-table .v-data-table__th--sortable:hover .v-data-table-header__sort-icon,
.standard-data-table .v-data-table__th--sorted .v-data-table-header__sort-icon {
  color: #2454d6 !important;
  opacity: 1 !important;
}
</style>
