<template>
  <div>
    <v-dialog v-model="isOpen" max-width="680" persistent>
      <v-card class="form-dialog" elevation="0">
        <div class="dialog-header">
          <div class="dialog-heading">
            <div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-bus</v-icon><v-icon class="dialog-icon-action" size="11">mdi-link-variant</v-icon></div>
            <div><div class="dialog-title">Vehículo del dispositivo</div><div class="dialog-subtitle">Asocia un vehículo de {{ deviceVehicleBranchName }} al equipo seleccionado</div></div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="deviceVehicleSaving" @click="close" />
        </div>
        <v-divider />

        <v-card-text class="dialog-body">
          <div class="device-association-heading">
            <div class="association-avatar"><v-icon size="20">mdi-cellphone</v-icon></div>
            <div class="cell-copy"><div class="device-name">{{ device?.name || "Dispositivo seleccionado" }}</div><div class="device-serial">Serie: {{ device?.serial || "Sin serie" }}</div></div>
          </div>

          <div v-if="deviceVehicleLoading" class="association-loading"><v-progress-circular indeterminate color="primary" size="24" /><span>Cargando asociación y vehículos disponibles...</span></div>
          <template v-else>
            <div class="form-section-label form-section-label--spaced">Asociaciones del dispositivo</div>
            <div v-if="deviceVehicles.length" class="association-list">
              <div v-for="association in deviceVehicles" :key="association.id" class="association-row">
                <div class="association-vehicle">
                  <div class="association-avatar association-avatar--vehicle"><v-icon size="19">mdi-bus</v-icon></div>
                  <div class="cell-copy"><div class="association-plate">{{ getDeviceVehiclePlate(association) }}</div><div class="association-caption">Interno: {{ getDeviceVehicleInternalNumber(association) }}</div></div>
                </div>
                <div class="association-row-actions">
                  <span class="status-badge" :class="isDeviceVehicleActive(association) ? 'status-badge--active' : 'status-badge--inactive'"><span class="status-dot" />{{ isDeviceVehicleActive(association) ? "Activa" : "Inactiva" }}</span>
                  <v-tooltip :text="isDeviceVehicleActive(association) ? 'Desactivar asociación' : (isDeviceVehicleActivationBlocked(association) ? 'El dispositivo ya tiene otra asociación activa' : 'Activar asociación')" location="top"><template #activator="{ props }"><v-btn v-bind="props" :icon="isDeviceVehicleActive(association) ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'" variant="text" size="small" class="action-button action-button--associate" :disabled="deviceVehicleSaving || isDeviceVehicleActivationBlocked(association)" @click="setDeviceVehicleActive(association, !isDeviceVehicleActive(association))" /></template></v-tooltip>
                  <v-tooltip v-if="!isDeviceVehicleActive(association)" text="Eliminar asociación" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" :disabled="deviceVehicleSaving" @click="openDeviceVehicleDelete(association)" /></template></v-tooltip>
                </div>
              </div>
            </div>
            <div v-else class="association-empty"><v-icon size="20">mdi-link-variant-off</v-icon><span>Este dispositivo no tiene vehículos asociados.</span></div>

            <template v-if="!hasActiveDeviceVehicle">
              <div class="form-section-label form-section-label--spaced">Nuevo vehículo</div>
              <v-autocomplete
                v-model="selectedDeviceVehicleId"
                :items="availableDeviceVehicles"
                item-title="label"
                item-value="id"
                label="Vehículo de la sucursal"
                placeholder="Busca por patente o número interno"
                prepend-inner-icon="mdi-bus-search-outline"
                variant="outlined"
                density="comfortable"
                no-data-text="No hay vehículos disponibles para asociar"
                :menu-props="{ contentClass: 'device-vehicle-select-menu' }"
                :disabled="deviceVehicleSaving || !deviceVehicleRelationsLoaded"
                clearable
              >
                <template #item="{ props, item }"><v-list-item v-bind="props" :title="item.raw.label" :subtitle="item.raw.subtitle"><template #prepend><v-avatar size="36" rounded="lg" class="select-avatar"><v-icon size="18">mdi-bus</v-icon></v-avatar></template></v-list-item></template>
                <template #selection="{ item }"><v-chip class="selected-vehicle-chip"><template #prepend><v-avatar size="23" class="select-avatar"><v-icon size="14">mdi-bus</v-icon></v-avatar></template>{{ item.raw.label }}</v-chip></template>
              </v-autocomplete>
              <div v-if="!deviceVehicleRelationsLoaded" class="association-warning"><v-icon size="18">mdi-shield-alert-outline</v-icon><span>No se pudieron cargar los vehículos de la sucursal. Intenta nuevamente antes de crear una asociación.</span></div>
              <div class="selection-summary" :class="{ 'has-selection': selectedDeviceVehicleId }"><v-icon size="18">{{ selectedDeviceVehicleId ? 'mdi-bus-check' : 'mdi-information-outline' }}</v-icon><span>{{ selectedDeviceVehicleId ? 'El vehículo quedará asociado y activo para este dispositivo.' : 'Selecciona un vehículo asociado a la sucursal.' }}</span></div>
            </template>
            <div v-else class="association-warning"><v-icon size="18">mdi-information-outline</v-icon><span>El dispositivo ya tiene una asociación activa. Desactívala antes de activar o crear otra.</span></div>
          </template>
        </v-card-text>

        <v-divider />
        <v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="deviceVehicleSaving" @click="close">Cerrar</v-btn><v-btn v-if="!hasActiveDeviceVehicle" class="save-button" elevation="0" :loading="deviceVehicleSaving" :disabled="deviceVehicleLoading || !deviceVehicleRelationsLoaded || !selectedDeviceVehicleId" @click="createDeviceVehicle">Asociar vehículo</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDeviceVehicleDelete" max-width="430" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-icon"><v-icon size="27">mdi-link-variant-off</v-icon></div>
        <div class="delete-title">Eliminar asociación</div>
        <div class="delete-message">¿Deseas eliminar la asociación con <strong>{{ getDeviceVehiclePlate(deviceVehicleToDelete) }}</strong>? El vehículo no será eliminado del sistema.</div>
        <div class="delete-actions"><v-btn variant="text" class="cancel-button" :disabled="deviceVehicleSaving" @click="closeDeviceVehicleDelete">Cancelar</v-btn><v-btn class="delete-button" elevation="0" :loading="deviceVehicleSaving" @click="deleteDeviceVehicle">Eliminar</v-btn></div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { handleRequest } from "@/utils/api";

export default {
  name: "DeviceVehicleDialog",
  props: {
    modelValue: { type: Boolean, default: false },
    device: { type: Object, default: () => ({}) },
    branches: { type: Array, default: () => [] },
    fallbackBranchId: { type: [String, Number], default: "" },
  },
  emits: ["update:modelValue", "alert"],
  data: () => ({
    dialogDeviceVehicleDelete: false,
    deviceVehicles: [],
    branchVehicles: [],
    deviceVehicleRelationsLoaded: false,
    deviceVehicleToDelete: null,
    selectedDeviceVehicleId: null,
    deviceVehicleLoading: false,
    deviceVehicleSaving: false,
  }),
  computed: {
    isOpen: {
      get() { return this.modelValue; },
      set(value) { this.$emit("update:modelValue", value); },
    },
    deviceVehicleBranchName() {
      const deviceBranchId = this.getDeviceBranchId();
      return this.device?.branch?.name || this.branches.find((branch) => String(branch.id) === String(deviceBranchId))?.name || "la sucursal";
    },
    hasActiveDeviceVehicle() { return this.deviceVehicles.some((association) => this.isDeviceVehicleActive(association)); },
   availableDeviceVehicles() {
      const associatedVehicleIds = new Set(this.deviceVehicles.map((association) => String(this.getDeviceVehicleId(association))).filter((id) => id !== "" && id !== "undefined"));
     return this.branchVehicles
       .map((branchVehicle) => this.toDeviceVehicleOption(branchVehicle))
        .filter((vehicle) => vehicle.id !== null && !associatedVehicleIds.has(String(vehicle.id)));
    },
  },
  watch: {
    modelValue(value) {
      if (value) this.loadDeviceVehicleData();
      else this.resetState();
    },
  },
  methods: {
    notify(type, message, timeout = 3000) { this.$emit("alert", type, message, timeout); },
    resetState() {
      this.dialogDeviceVehicleDelete = false;
      this.deviceVehicles = [];
      this.branchVehicles = [];
      this.deviceVehicleRelationsLoaded = false;
      this.deviceVehicleToDelete = null;
      this.selectedDeviceVehicleId = null;
      this.deviceVehicleLoading = false;
      this.deviceVehicleSaving = false;
    },
    close() {
      if (this.deviceVehicleSaving) return;
      this.isOpen = false;
    },
    getDeviceBranchId() { return this.device?.branch_id ?? this.device?.branchId ?? this.device?.branch?.id ?? this.fallbackBranchId; },
    getDeviceVehicleId(association) { return association?.vehicle_id ?? association?.vehicleId ?? association?.vehicle?.id ?? ""; },
    isDeviceVehicleActive(association) { return association?.active === true || Number(association?.active) === 1 || String(association?.active).toLowerCase() === "true"; },
    isDeviceVehicleActivationBlocked(association) {
      if (this.isDeviceVehicleActive(association)) return false;
      return this.deviceVehicles.some((item) => item !== association && this.isDeviceVehicleActive(item));
    },
    getBranchVehicleSource(branchVehicle) { return branchVehicle?.vehicle && typeof branchVehicle.vehicle === "object" ? branchVehicle.vehicle : branchVehicle || {}; },
    toDeviceVehicleOption(branchVehicle) {
      const source = this.getBranchVehicleSource(branchVehicle);
      const vehicleId = branchVehicle?.vehicle_id ?? branchVehicle?.vehicleId ?? branchVehicle?.vehicle?.id ?? (!branchVehicle?.vehicle ? branchVehicle?.id : null);
      const plate = source.plate || branchVehicle?.plate || "Sin patente";
      const internalNumber = source.internal_number ?? source.internalNumber ?? branchVehicle?.internal_number ?? branchVehicle?.internalNumber ?? "No asignado";
      return { id: vehicleId ?? null, label: plate, subtitle: "Interno: " + internalNumber + (source.brand ? " · " + source.brand : ""), plate, internalNumber, source };
    },
    getAssociatedVehicle(association) {
      if (association?.vehicle && typeof association.vehicle === "object") return association.vehicle;
      const associationVehicleId = this.getDeviceVehicleId(association);
      const branchVehicle = this.branchVehicles.find((item) => String(this.toDeviceVehicleOption(item).id) === String(associationVehicleId));
      return branchVehicle ? this.toDeviceVehicleOption(branchVehicle) : {};
    },
    getDeviceVehiclePlate(association) { return this.getAssociatedVehicle(association)?.plate || "Sin patente"; },
    getDeviceVehicleInternalNumber(association) { const vehicle = this.getAssociatedVehicle(association); return vehicle?.internal_number ?? vehicle?.internalNumber ?? "No asignado"; },
    async loadDeviceVehicleData() {
      const deviceId = this.device?.id;
      const branchId = this.getDeviceBranchId();
      if (!this.modelValue || !deviceId || !branchId) {
        if (this.modelValue) this.notify("warning", "No se pudo identificar el dispositivo o la sucursal.");
        return;
      }

      this.deviceVehicleLoading = true;
      this.deviceVehicleRelationsLoaded = false;
      try {
        const [associationResult, branchVehiclesResult] = await Promise.all([
          handleRequest({ endpoint: "device-vehicles", method: "POST", data: { device_id: deviceId } }),
          handleRequest({ endpoint: "branch-vehicles", method: "POST", data: { branch_id: branchId } }),
        ]);

        this.deviceVehicles = associationResult.success && Array.isArray(associationResult.data?.deviceVehicles)
          ? associationResult.data.deviceVehicles
          : [];
        this.branchVehicles = branchVehiclesResult.success && Array.isArray(branchVehiclesResult.data?.branchVehicles)
          ? branchVehiclesResult.data.branchVehicles
          : [];
        this.deviceVehicleRelationsLoaded = branchVehiclesResult.success;
        this.selectedDeviceVehicleId = null;

        if (!associationResult.success && (associationResult.networkError || associationResult.data)) {
          this.notify("warning", associationResult.message || "No fue posible consultar la asociación.");
        }
        if (!branchVehiclesResult.success) {
          this.notify("warning", branchVehiclesResult.message || "No fue posible cargar los vehículos de la sucursal.");
        }
      } catch (error) {
        this.deviceVehicles = [];
        this.branchVehicles = [];
        this.deviceVehicleRelationsLoaded = false;
        this.notify("error", "Ocurrió un error al cargar la asociación del dispositivo.");
      } finally {
        this.deviceVehicleLoading = false;
      }
    },
    async createDeviceVehicle() {
      if (this.hasActiveDeviceVehicle) {
        this.notify("warning", "El dispositivo ya tiene una asociación activa.");
       return;
      }
      if (!this.selectedDeviceVehicleId) {
        this.notify("warning", "Selecciona un vehículo.");
        return;
      }

      this.deviceVehicleSaving = true;
      try {
        const result = await handleRequest({
          endpoint: "device-vehicle",
          method: "POST",
          data: {
            device_id: this.device.id,
            vehicle_id: this.selectedDeviceVehicleId,
            branch_id: this.getDeviceBranchId(),
            active: true,
          },
        });
        if (result.success) {
          this.notify("success", result.message || "Vehículo asociado correctamente.");
          await this.loadDeviceVehicleData();
        } else {
          this.notify("warning", result.message || "No fue posible asociar el vehículo.");
        }
      } catch (error) {
        this.notify("error", "Ocurrió un error al asociar el vehículo.");
      } finally {
        this.deviceVehicleSaving = false;
      }
    },
    async setDeviceVehicleActive(association, active) {
      if (active && this.deviceVehicles.some((item) => item !== association && this.isDeviceVehicleActive(item))) {
        this.notify("warning", "El dispositivo ya tiene otra asociación activa.");
        return;
      }

      this.deviceVehicleSaving = true;
      try {
        const result = await handleRequest({
          endpoint: "device-vehicle-update",
          method: "POST",
          data: { id: association.id, active },
        });
        if (result.success) {
          this.notify("success", active ? "Asociación activada correctamente." : "Asociación desactivada correctamente.");
          await this.loadDeviceVehicleData();
        } else {
          this.notify("warning", result.message || "No fue posible actualizar la asociación.");
        }
      } catch (error) {
        this.notify("error", "Ocurrió un error al actualizar la asociación.");
      } finally {
        this.deviceVehicleSaving = false;
      }
    },
    openDeviceVehicleDelete(association) {
      if (this.isDeviceVehicleActive(association)) {
        this.notify("warning", "Desactiva la asociación antes de eliminarla.");
        return;
      }
      this.deviceVehicleToDelete = association;
      this.dialogDeviceVehicleDelete = true;
    },
    closeDeviceVehicleDelete() {
      if (this.deviceVehicleSaving) return;
      this.dialogDeviceVehicleDelete = false;
      this.deviceVehicleToDelete = null;
    },
    async deleteDeviceVehicle() {
      if (!this.deviceVehicleToDelete || this.isDeviceVehicleActive(this.deviceVehicleToDelete)) {
        this.closeDeviceVehicleDelete();
        return;
      }

      this.deviceVehicleSaving = true;
      try {
        const result = await handleRequest({
          endpoint: "device-vehicle-destroy",
          method: "POST",
          data: { id: this.deviceVehicleToDelete.id },
        });
        if (result.success) {
          this.dialogDeviceVehicleDelete = false;
          this.deviceVehicleToDelete = null;
          this.notify("success", result.message || "Asociación eliminada correctamente.");
          await this.loadDeviceVehicleData();
        } else {
          this.notify("warning", result.message || "No fue posible eliminar la asociación.");
        }
      } catch (error) {
        this.notify("error", "Ocurrió un error al eliminar la asociación.");
      } finally {
        this.deviceVehicleSaving = false;
      }
    },
  },
};
</script>

<style scoped>
.form-dialog,.delete-dialog { overflow:hidden; color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }
.dialog-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 20px; }.dialog-heading { display:flex; align-items:center; gap:11px; }.dialog-icon { position:relative; display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#fff; background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }.dialog-icon-main { transform:translate(-2px,1px); }.dialog-icon-action { position:absolute; right:5px; bottom:5px; padding:1px; color:#0e1f46; background:#fff; border-radius:50%; box-shadow:0 1px 3px rgba(15,23,42,.22); }.dialog-title { color:#0f172a; font-size:16px; font-weight:850; line-height:1.2; }.dialog-subtitle { margin-top:4px; color:#64748b; font-size:11.5px; font-weight:600; }.dialog-close { color:#64748b!important; }
.dialog-body { max-height:70vh; padding:21px 22px 16px!important; overflow-y:auto; }.form-section-label { margin-bottom:13px; color:#475569; font-size:10.5px; font-weight:850; letter-spacing:.065em; text-transform:uppercase; }.form-section-label--spaced { margin-top:7px; }.dialog-body :deep(.v-field) { border-radius:9px; }.dialog-body :deep(.v-field__outline) { color:#d6dee9; }.dialog-body :deep(.v-label) { color:#64748b; font-size:13px; font-weight:650; opacity:1; }.dialog-body :deep(.v-field__input) { color:#1e293b; font-size:13px; font-weight:650; }
.dialog-actions { justify-content:flex-end; gap:9px; padding:14px 20px!important; }.cancel-button { min-width:94px; min-height:39px; color:#475569!important; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; border-radius:9px!important; }.cancel-button:hover { background:#f1f5f9; }.save-button { min-width:150px; padding-inline:18px!important; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px rgba(36,84,214,.2)!important; }
.delete-dialog { padding:29px 27px 24px; text-align:center; }.delete-icon { display:grid; width:56px; height:56px; margin:0 auto 16px; place-items:center; color:#dc2626; background:#fff1f2; border:1px solid #ffe0e4; border-radius:15px; }.delete-title { color:#0f172a; font-size:18px; font-weight:850; }.delete-message { max-width:340px; margin:10px auto 22px; color:#64748b; font-size:12.5px; font-weight:600; line-height:1.55; }.delete-message strong { color:#334155; font-weight:800; }.delete-actions { display:flex; justify-content:center; gap:9px; }.delete-button { min-width:112px; min-height:40px; color:#fff!important; background:#dc2626!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; }
.device-association-heading { display:flex; align-items:center; gap:10px; padding:11px 12px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }.association-avatar { display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; border-radius:9px; }.association-avatar--vehicle { color:#16875a; background:#eaf8f1; border-color:#d7f1e5; }.association-loading { display:flex; align-items:center; justify-content:center; gap:10px; min-height:150px; color:#64748b; font-size:11.5px; font-weight:650; }.association-list { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:10px; }.association-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px; border-bottom:1px solid #eef2f6; }.association-row:last-child { border-bottom:0; }.association-vehicle { display:flex; align-items:center; gap:10px; min-width:0; }.association-plate { overflow:hidden; color:#0f172a; font-size:13px; font-weight:850; text-overflow:ellipsis; white-space:nowrap; }.association-caption { margin-top:2px; color:#64748b; font-size:10.5px; font-weight:650; }.association-row-actions { display:flex; align-items:center; gap:4px; flex:0 0 auto; }.association-empty,.association-warning { display:flex; align-items:flex-start; gap:8px; padding:11px 12px; color:#64748b; background:#f8fafc; border:1px solid #e8edf5; border-radius:9px; font-size:11px; font-weight:650; line-height:1.45; }.association-empty .v-icon { color:#94a3b8; }.association-warning { color:#8a5a00; background:#fff8e7; border-color:#f7e3ad; }.association-warning .v-icon { color:#d48a00; }
.cell-copy { min-width:0; }.device-name { overflow:hidden; color:#0f172a; font-size:13.5px; font-weight:850; text-overflow:ellipsis; white-space:nowrap; }.device-serial { margin-top:2px; overflow:hidden; color:#526176; font-size:11px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }.status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 7px; font-size:11.5px; font-weight:800; border-radius:7px; }.status-badge--active { color:#116b49; background:#eaf8f1; }.status-badge--inactive { color:#475569; background:#f1f5f9; }.status-dot { width:6px; height:6px; background:currentColor; border-radius:50%; }.action-button { border-radius:8px!important; }.action-button--associate { color:#16875a!important; }.action-button--associate:hover { background:#eaf8f1; }.action-button--delete { color:#dc2626!important; }.action-button--delete:hover { background:#fff1f2; }.selected-vehicle-chip { max-width:205px; color:#1e293b!important; background:#eef3ff!important; font-size:11px!important; font-weight:750!important; }.select-avatar { display:grid; flex:0 0 auto; place-items:center; overflow:hidden; color:#2454d6; background:#eef3ff; }.selection-summary { display:flex; align-items:flex-start; gap:7px; margin-top:3px; padding:10px 11px; color:#526176; background:#f8fafc; border:1px solid #e8edf5; border-radius:9px; font-size:10.5px; font-weight:650; line-height:1.45; }.selection-summary.has-selection { color:#116b49; background:#eaf8f1; border-color:#d7f1e5; }
@media (max-width:600px) { .dialog-header { padding:14px; }.dialog-body { padding:17px 14px 12px!important; }.dialog-actions { padding-inline:13px!important; }.association-row { align-items:flex-start; flex-direction:column; }.association-row-actions { width:100%; justify-content:flex-end; } }
</style>

<style>
.device-vehicle-select-menu .v-list { padding:6px!important; }.device-vehicle-select-menu .v-list-item { min-height:62px!important; margin:3px 0; border-radius:9px!important; }.device-vehicle-select-menu .v-list-item:hover { background:#f4f7ff!important; }.device-vehicle-select-menu .v-list-item-title { color:#0f172a!important; font-size:13px!important; font-weight:850!important; }.device-vehicle-select-menu .v-list-item-subtitle { color:#64748b!important; font-size:10.5px!important; font-weight:650!important; opacity:1!important; }
</style>
