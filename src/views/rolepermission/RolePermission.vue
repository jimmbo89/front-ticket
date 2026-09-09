<template>
  <div class="permission-page">
    <v-snackbar v-model="snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10">
      <div class="notice"><v-icon :icon="sb_icon" /><div><strong>{{ sb_title }}</strong><div>{{ sb_message }}</div></div></div>
    </v-snackbar>

    <div class="permission-toolbar">
      <div>
        <div class="content-title">Permisos asignados</div>
        <div class="content-subtitle">{{ rolepermissions.length }} permisos habilitados para {{ role.name }}</div>
      </div>
      <div class="toolbar-actions">
        <v-text-field v-model="search" class="search-field" density="compact" placeholder="Buscar permiso..." prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable />
        <v-btn class="add-button" prepend-icon="mdi-plus" elevation="0" @click="showAdd">Asignar permiso</v-btn>
      </div>
    </div>

    <v-card class="permission-panel" elevation="0">
      <v-data-table :headers="headers" :items="rolepermissions" :search="search" :loading="loading" :items-per-page="10"
        items-per-page-text="Elementos por página" no-data-text="Este rol no tiene permisos asignados"
        loading-text="Cargando permisos..." class="permission-table">
        <template #loading><v-skeleton-loader type="table-row@5" /></template>
        <template #[`item.name`]="{ item }">
          <div class="permission-name"><span class="permission-icon"><v-icon size="17">mdi-shield-check-outline</v-icon></span><div><strong>{{ item.name }}</strong></div></div>
        </template>
        <template #[`item.module`]="{ item }"><span class="module-badge"><v-icon size="14">mdi-view-grid-outline</v-icon>{{ item.module || "General" }}</span></template>
        <template #[`item.description`]="{ item }"><div class="description" :title="item.description">{{ item.description || "Sin descripción" }}</div></template>
        <template #[`item.actions`]="{ item }">
          <v-tooltip text="Quitar permiso" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="delete-action" @click="deleteItem(item)" /></template></v-tooltip>
        </template>
      </v-data-table>
      <div class="panel-note"><v-icon size="15">mdi-information-outline</v-icon>Los cambios se aplican al rol inmediatamente.</div>
    </v-card>

    <v-dialog v-model="dialog" max-width="560" persistent>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading"><span class="dialog-icon"><v-icon>mdi-shield-plus-outline</v-icon></span><div><h3>Asignar permiso</h3><p>Selecciona un permiso disponible para {{ role.name }}</p></div></div>
            <v-btn icon="mdi-close" variant="text" :disabled="loading" @click="close" />
          </div>
          <v-divider />
          <v-card-text class="dialog-body">
            <v-autocomplete v-model="editedItem.permission_ids" :items="permissions" item-title="name" item-value="id"
              label="Permiso" placeholder="Busca por nombre o módulo" prepend-inner-icon="mdi-shield-search-outline"
              variant="outlined" density="comfortable" :rules="selectRules" no-data-text="No hay permisos disponibles"
              multiple chips closable-chips
              :menu-props="{ maxHeight: 420, minWidth: 540, contentClass: 'permission-menu' }">
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="undefined"
                  :subtitle="undefined"
                  class="permission-option"
                >
                  <template #prepend>
                    <span class="option-icon">
                      <v-icon size="18">mdi-shield-outline</v-icon>
                    </span>
                  </template>

                  <template #title>
                    <div class="option-header">
                      <span class="option-name">{{ item.raw.name }}</span>
                      <span class="option-module">
                        {{ item.raw.module || "General" }}
                      </span>
                    </div>
                  </template>

                  <template #subtitle>
                    <div class="option-description">
                      {{ item.raw.description || "Sin descripción" }}
                    </div>
                  </template>
                </v-list-item>
              </template>

            </v-autocomplete>

            <div v-if="editedItem.permission_ids.length" class="selection-summary">
              <v-icon size="16">mdi-shield-check-outline</v-icon>
              {{ editedItem.permission_ids.length }}
              {{ editedItem.permission_ids.length === 1 ? "permiso seleccionado" : "permisos seleccionados" }}
            </div>
          </v-card-text>
          <v-divider />
            <v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading">Asignar permisos</v-btn></v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="430" persistent>
      <v-card class="delete-dialog" elevation="0">
        <span class="delete-icon"><v-icon size="27">mdi-shield-remove-outline</v-icon></span>
        <h3>Quitar permiso</h3>
        <p>¿Deseas quitar <strong>{{ editedItem.name || "este permiso" }}</strong> del rol <strong>{{ role.name }}</strong>?</p>
        <div><v-btn variant="text" class="cancel-button" :disabled="loading" @click="closeDelete">Cancelar</v-btn><v-btn class="remove-button" elevation="0" :loading="loading" @click="deleteItemConfirm">Quitar permiso</v-btn></div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { handleRequest } from "@/utils/api";

export default {
  name: "RolePermission",
  props: { role: { type: Object, required: true, default: () => ({}) } },
  data: () => ({
    snackbar:false, sb_type:"", sb_message:"", sb_timeout:2000, sb_title:"", sb_icon:"",
    valid:false, loading:false, dialog:false, dialogDelete:false, rolepermissions:[], permissions:[],
    editedItem:{ id:"", role_id:"", permission_ids:[], name:"" }, defaultItem:{ id:"", role_id:"", permission_ids:[], name:"" }, search:"",
    headers:[
      { title:"Permiso", key:"name", value:"name", width:"25%" },
      { title:"Módulo", key:"module", value:"module", width:"20%" },
      { title:"Descripción", key:"description", value:"description", width:"45%" },
      { title:"", key:"actions", value:"actions", sortable:false, align:"end", width:"10%" },
    ],
    selectRules:[(v) => Array.isArray(v) && v.length > 0 || "Debes seleccionar al menos un permiso"],
  }),
  mounted(){ this.initialize(); },
  methods:{
    unwrap(item){ return item?.raw ?? item ?? {}; },
    resetEditor(){ this.editedItem={...this.defaultItem,permission_ids:[]}; this.valid=false; },
    async initialize(){
      this.loading=true;
      try{
        const result=await handleRequest({ endpoint:"role-permissions", method:"POST", data:{ role_id:this.role.id } });
        this.rolepermissions=result.success ? (result.data?.permissionroles || []) : [];
      }catch(error){ this.rolepermissions=[]; this.showAlert("error","Ocurrió un error al cargar los permisos.",3000); }
      finally{ this.loading=false; }
    },
    async showAdd(){
      this.loading=true;
      try{
        const result=await handleRequest({ endpoint:"permission", method:"GET" });
        const assigned=new Set(this.rolepermissions.map((item)=>Number(item.permission_id)));
        this.permissions=result.success ? (result.data?.permissions || []).filter((item)=>!assigned.has(Number(item.id))) : [];
        this.resetEditor(); this.dialog=true;
        this.$nextTick(()=>this.$refs.form?.resetValidation());
      }catch(error){ this.showAlert("error","Ocurrió un error al cargar los permisos disponibles.",3000); }
      finally{ this.loading=false; }
    },
    close(){ if(this.loading)return; this.dialog=false; this.resetEditor(); },
    async save(){
      const validation=await this.$refs.form?.validate();
      if(!validation?.valid)return;

      const selectedIds=[...this.editedItem.permission_ids];
      const assigned=[];
      const failed=[];
      this.loading=true;

      try{
        for(const permissionId of selectedIds){
          try{
            const result=await handleRequest({
              endpoint:"permission-role",
              method:"POST",
              data:{ role_id:this.role.id, permission_id:permissionId },
            });

            if(result.success) assigned.push(permissionId);
            else failed.push(permissionId);
          }catch(error){
            failed.push(permissionId);
          }
        }

        await this.initialize();

        if(failed.length===0){
          this.dialog=false;
          this.showAlert("success",assigned.length===1 ? "Permiso asignado correctamente." : `${assigned.length} permisos asignados correctamente.`,3000);
          this.resetEditor();
        }else{
          this.editedItem.permission_ids=failed;
          this.permissions=this.permissions.filter((permission)=>!assigned.includes(permission.id));
          this.showAlert("warning",`Se asignaron ${assigned.length} permisos y ${failed.length} no pudieron asignarse.`,4000);
        }
      }finally{
        this.loading=false;
      }
    },
    deleteItem(item){ const permission=this.unwrap(item); this.editedItem={...this.defaultItem,...permission}; this.dialogDelete=true; },
    closeDelete(){ if(!this.loading){ this.dialogDelete=false; this.resetEditor(); } },
    async deleteItemConfirm(){
      this.loading=true;
      try{
        const result=await handleRequest({ endpoint:"permission-role-destroy", method:"POST", data:{ id:this.editedItem.id } });
        if(result.success){ this.dialogDelete=false; this.showAlert("success",result.message || "Permiso eliminado correctamente.",3000); await this.initialize(); this.resetEditor(); }
        else this.showAlert("warning",result.message || "No fue posible quitar el permiso.",3000);
      }catch(error){ this.showAlert("error","Ocurrió un error al quitar el permiso.",3000); }
      finally{ this.loading=false; }
    },
    showAlert(type,message,timeout=3000){
      const config={ success:{title:"Éxito",icon:"mdi-check-circle"}, error:{title:"Error",icon:"mdi-close-circle"}, warning:{title:"Advertencia",icon:"mdi-alert-circle"} }[type];
      this.sb_type=type; this.sb_title=config.title; this.sb_icon=config.icon; this.sb_message=message; this.sb_timeout=timeout; this.snackbar=true;
    },
  },
};
</script>

<style scoped>
.permission-page{min-height:100%;color:#1e293b}.permission-toolbar{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:14px}.content-title{color:#0f172a;font-size:16px;font-weight:850}.content-subtitle{margin-top:3px;color:#64748b;font-size:11.5px;font-weight:650}.toolbar-actions{display:flex;align-items:center;gap:10px}.search-field{width:280px}.search-field :deep(.v-field){border-radius:9px;font-size:12px}.add-button,.save-button{min-height:40px;color:#fff!important;background:linear-gradient(100deg,#2454d6,#3266e4)!important;border-radius:9px!important;font-size:12px;font-weight:800;letter-spacing:0;text-transform:none;box-shadow:0 5px 12px rgba(36,84,214,.2)!important}.permission-panel{overflow:hidden;border:1px solid #e8edf5;border-radius:13px!important}.permission-table :deep(thead th){height:40px!important;color:#475569!important;font-size:10.5px!important;font-weight:850!important;background:#f8fafc!important}.permission-table :deep(tbody td){height:58px!important;color:#334155;font-size:12px;border-bottom:1px solid #eef2f6!important}.permission-name{display:flex;align-items:center;gap:9px}.permission-name>div{display:flex;flex-direction:column}.permission-name strong{font-size:12.5px}.permission-name small{color:#64748b;font-size:9.5px}.permission-icon{display:grid;width:31px;height:31px;place-items:center;color:#2454d6;background:#eef3ff;border-radius:8px}.module-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;color:#7c3aed;background:#f3efff;border-radius:7px;font-size:10.5px;font-weight:750}.description{max-width:520px;overflow:hidden;color:#475569;font-size:11.5px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.delete-action{color:#dc2626!important}.delete-action:hover{background:#fff1f2}.panel-note{display:flex;align-items:center;gap:6px;padding:10px 16px;color:#64748b;font-size:10.5px;font-weight:650;border-top:1px solid #edf1f5}.form-dialog,.delete-dialog{overflow:hidden;background:#fff;border-radius:14px!important}.dialog-header{display:flex;align-items:center;justify-content:space-between;padding:17px 20px}.dialog-heading{display:flex;align-items:center;gap:11px}.dialog-icon{display:grid;width:38px;height:38px;place-items:center;color:#fff;background:linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px}.dialog-heading h3,.delete-dialog h3{margin:0;color:#0f172a;font-size:16px;font-weight:850}.dialog-heading p{margin:4px 0 0;color:#64748b;font-size:11.5px}.dialog-body{padding:22px!important}.dialog-body :deep(.v-field){border-radius:9px}.dialog-actions{justify-content:flex-end;gap:9px;padding:14px 20px!important}.cancel-button{min-height:39px;color:#475569!important;font-size:12.5px;font-weight:750;text-transform:none}.save-button{min-width:140px}.delete-dialog{padding:29px 27px 24px;text-align:center}.delete-icon{display:grid;width:56px;height:56px;margin:0 auto 16px;place-items:center;color:#dc2626;background:#fff1f2;border-radius:15px}.delete-dialog p{max-width:350px;margin:10px auto 22px;color:#64748b;font-size:12.5px;line-height:1.55}.delete-dialog strong{color:#334155}.remove-button{min-height:40px;margin-left:8px;color:#fff!important;background:#dc2626!important;border-radius:9px!important;font-size:12px;font-weight:800;text-transform:none}.notice{display:flex;align-items:center;gap:10px}.notice strong{font-size:11px}.notice div div{font-size:9.5px}.option-module{color:#2454d6;font-size:10px;font-weight:750}.option-description{margin-top:2px;overflow:hidden;color:#64748b;font-size:10px;text-overflow:ellipsis;white-space:nowrap}
.permission-option{min-height:72px!important;margin:4px 6px;padding:8px 10px!important;border:1px solid transparent;border-radius:10px!important;transition:background-color .15s ease,border-color .15s ease}.permission-option:hover{background:#f5f8ff!important;border-color:#dfe7f5}.permission-option :deep(.v-list-item__prepend){margin-right:10px}.permission-option :deep(.v-list-item__content){min-width:0;overflow:visible}.option-icon{display:grid;width:34px;height:34px;place-items:center;color:#2454d6;background:#eef3ff;border-radius:8px}.option-header{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0}.option-name{overflow:hidden;color:#172033;font-size:12.5px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}.option-module{flex:0 0 auto;padding:3px 7px;color:#2454d6;background:#eef3ff;font-size:9px;font-weight:800;line-height:1;border-radius:6px}.option-description{display:-webkit-box;margin-top:5px;overflow:hidden;color:#64748b;font-size:10.5px;font-weight:600;line-height:1.35;-webkit-box-orient:vertical;-webkit-line-clamp:2;white-space:normal}.selected-permission{display:flex;align-items:center;gap:6px;min-width:0;color:#1e293b;font-size:12.5px;font-weight:750}.selected-permission span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.selection-summary{display:flex;align-items:center;gap:6px;margin-top:-8px;padding:8px 10px;color:#2454d6;background:#eef3ff;border-radius:8px;font-size:10.5px;font-weight:750}.dialog-body :deep(.v-chip){color:#2454d6;background:#eef3ff;font-size:10.5px;font-weight:750}.dialog-body :deep(.v-field__input){row-gap:5px}
@media(max-width:700px){.permission-toolbar{align-items:stretch;flex-direction:column}.toolbar-actions{align-items:stretch;flex-direction:column}.search-field{width:100%}.add-button{width:100%}.permission-table{overflow-x:auto}.permission-table :deep(.v-table__wrapper){min-width:760px}}
</style>
