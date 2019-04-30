<template>
  <div class="row">
    <div class="col-12">
      <div class="row justify-end">
        <q-btn
          color="secondary"
          wait-for-ripple
          label="Crear registro"
          @click.native="$router.push(`/forms/${$route.params.id}/new/`)"/>
      </div>
    </div>
    <div class="col-12 q-mt-md">
      <q-table
        :grid="datatable.grid"
        :selection="datatable.selection"
        :row-key="datatable.rowKey || 'id'"
        no-data-label="No hay datos disponibles"
        loading-label="Cargando datos..."
        :columns="datatable.columns"
        :data="datatable.hasOwnProperty('valuesJSON') ? entries : serverData"
        :color="datatable.color || 'secondary' "
        :loading="loading"
        :pagination.sync="serverPagination"
        :selected.sync="selected"
        binary-state-sort
        @request="request">

        <q-tr slot="header" slot-scope="props" :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            <b>{{ col.label }}</b>
          </q-th>
        </q-tr>

        <q-td slot="body-cell-status" slot-scope="props" :props="props">
          <q-chip v-if="props.row.status === 'joined'" tag square color="positive">Ingresado</q-chip>
          <q-chip v-else-if="props.row.status === 'in_process'" tag square color="warning">En proceso</q-chip>
          <q-chip v-else-if="props.row.status === 'finalized'" tag square color="info">Finalizado</q-chip>
        </q-td>

        <q-td slot="body-cell-manage" slot-scope="props" :props="props">
          <q-btn
            color="info"
            flat
            round
            icon="visibility"
            @click.native="$router.push(`/home/forms/${$route.params.id}/${props.row.id}/`)">
            <q-tooltip anchor="top middle" self="bottom middle">Ver</q-tooltip>
          </q-btn>
          <q-btn
            v-if="(datatable.scaling && ($isAdmin() || $q.localStorage.get.item('permissions').indexOf(datatable.permissions.manage) > -1)) && (props.row.status === 'joined' || props.row.status === 'in_process')"
            color="positive"
            flat
            round
            icon="bookmarks"
            @click.native="$router.push(`/home/forms/${$route.params.id}/manage/${props.row.id}/`)">
            <q-tooltip anchor="top middle" self="bottom middle">Gestionar caso</q-tooltip>
          </q-btn>
          <q-btn
            v-if="$isAdmin() || $q.localStorage.get.item('permissions').indexOf('delete_custom_') > -1"
            color="negative"
            flat
            :disable="props.row.hasOwnProperty('type') && props.row.type == 'custom'"
            round
            icon="delete"
            @click="delItem(props.row.id)">
            <q-tooltip anchor="top middle" self="bottom middle">Eliminar</q-tooltip>
          </q-btn>
        </q-td>
        <div slot="bottom" slot-scope="props" class="fit">
          <div class="flex-center justify-between">
            <div class="col-xs-12 col-sm-3 col-md-2 text-center">
              <span v-if="selected.length > 0">
                {{selected.length > 1 ? (selected.length - count_selected) + ' registros seleccionados' : (selected.length - count_selected) + ' registro seleccionado' }}
              </span>
            </div>
            <div class="row col-xs-12 col-sm-7 col-md-4 flex-center">
              <span>Número de filas</span>
              <q-select
                :color="datatable.color || 'secondary' "
                @input="pagination_rowsPerPage"
                v-model="serverPagination.rowsPerPage"
                :options="[
                  { label: '10', value: 10 },
                  { label: '20', value: 20 },
                  { label: '30', value: 30 },
                  { label: '40', value: 40 },
                  { label: '50', value: 50 }
                ]"
                class="q-ml-md" />
              <q-pagination :color="datatable.color || 'secondary' " input v-model="serverPagination.page" :value="serverPagination.page" @input="pagination_handler" :min="1" :max="serverPagination.total_pages" :max-pages="6" />
            </div>
          </div>
        </div>
      </q-table>
    </div>
  </div>
</template>
<script>
import { filter } from 'quasar'
export default {
  name: 'DataForm',
  data () {
    return {
      entries: [],
      serverData: [],
      loading: false,
      filter: this.search_text,
      count_selected: 0,
      selected: [],
      serverPagination: {
        page: 1,
        rowsPerPage: 10
      },
      search_text: null
    }
  },
  created () {
    if (filter('manage', { field: 'name', list: this.$props.datatable.columns }).length === 0) {
      this.$props.datatable.columns.push({ name: 'manage', label: 'Acciones', field: 'manage', align: 'right' })
    }
    this.run_request()
  },
  methods: {
    /*
        Buscar, paginar, ordenar y filtrar en servidor
        NOTA: Todas los cambios realizados en el component QTable son buscados en servidor para obtener información actualizada
    */
    request ({ pagination, filter }) {
      this.entries = []
      // Se activa el estado 'Cargando'
      this.loading = true
      // Se realiza petición al servidor con los parámetros que vamos a filtrar
      let params = {
        page_size: pagination.rowsPerPage,
        page: pagination.page,
        ordering: this.$parent.actions.search.ordering
      }
      if (this.$parent.actions.search.filter !== null) {
        params['valuesJSON__' + this.$parent.actions.search.select] = this.$parent.actions.search.filter
      }
      this.$axios.get(this.$props.datatable.serverPage, {
        params: params
      }).then(({ data }) => {
        // Se actualiza la información de la paginación
        pagination['total_pages'] = data.num_pages
        this.serverPagination = pagination
        // Se actualizan número de filas
        this.serverPagination.rowsNumber = data.count
        // Se actualizan los resultados
        this.serverData = data.results
        for (let i in this.serverData) {
          this.entries.push(this.serverData[i].valuesJSON)
          this.entries[i].id = this.serverData[i].id
          if (this.serverData[i].formScaling) {
            this.entries[i].status = this.serverData[i].status
          }
          this.entries[i].created_at = this.serverData[i].created_at
        }
        this.loading = false
      }).catch(response => {
        this.loading = false
      })
    },
    /*
        Funciones para buscar registros.
        NOTA: Se modifica la funcionalidad del campo 'Search' para que solo busque un registro cuando se haga click en el botón buscar
              y no cuando se escriba sobre el campo para evitar sobre cargar el servidor de peticiones
    */
    run_request () {
      this.request({
        pagination: this.serverPagination,
        filter: this.search_text
      })
    },
    search () {
      this.run_request()
    },
    ordering () {
      this.run_request()
    },
    search_clear () {
      this.search_text = null
      this.run_request()
    },
    pagination_handler () {
      this.run_request()
    },
    pagination_rowsPerPage () {
      this.run_request()
    },
    viewEntries (id) {
      this.$router.push(this.$route.path + 'entries/' + id + '/')
    },
    viewCharts (id) {
      this.$router.push(`${this.$route.path}charts/${id}/`)
    },
    delItem (id) {
      this.$q.dialog({
        title: '¿Está seguro?',
        message: 'Al aceptar el registro será eliminado de manera permanente',
        ok: 'Aceptar',
        cancel: 'Cancelar',
        preventClose: true,
        noBackdropDismiss: false,
        noEscDismiss: false
      }).then(() => {
        this.$axios.delete(`/forms/data/${this.$route.params.id}/${id}/`).then((response) => {
          if (response.status === 204) {
            this.selected = []
            this.run_request()
            this.$q.notify({
              type: 'info',
              icon: 'info',
              position: 'bottom',
              message: 'Se elimino el registro exitosamente'
            })
          }
        }).catch((error) => {
          if (error.response.status === 404) {
            this.run_request()
          }
        })
      }).catch(() => {
      })
    }
  },
  watch: {
    search_text: function (val, oldVal) {
      if (val === null || val.length === 0) {
        this.run_request()
      }
    }
  },
  props: {
    datatable: Object
  }
}
</script>

<style scoped>
</style>
