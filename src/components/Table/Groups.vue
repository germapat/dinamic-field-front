<template>
  <div>
    <q-table
      :class="'shadow-' + datatable.shadow "
      :title="datatable.hideHeader ? '' : datatable.title"
      :grid="datatable.grid"
      :selection="datatable.selection"
      :row-key="datatable.rowKey || 'id' "
      no-data-label="No hay datos disponibles"
      loading-label="Cargando datos..."
      :columns="datatable.columns"
      :data="serverData"
      :color="datatable.color || 'secondary' "
      :loading="loading"
      :pagination.sync="serverPagination"
      :selected.sync="selected"
      binary-state-sort
      @request="request">

      <q-tr v-if="!datatable.hideHeader" slot="header" slot-scope="props" :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          <b>{{ col.label }}</b>
        </q-th>
      </q-tr>

      <template slot="top-right" slot-scope="props" class="row" v-if="!datatable.hasOwnProperty('selection')">
          <div class="col-xs-12 col-md-6">
            <q-field icon="search">
              <q-input
                placeholder="Buscar"
                :loading="loading"
                v-model.trim="search_text"
                @clear="search_clear"
                v-on:keyup.tab="search()"
                v-on:keyup.enter="search()"
                v-on:keyup.esc="search_clear()"
                :after="[{icon: 'arrow_forward', content: true, handler () { search() }}]"
              />
            </q-field>
          </div>
          <div class="col-xs-12 col-md-6 q-ml-md btn-new crater">
            <q-btn
              v-if="$q.localStorage.get.item('permissions').indexOf('pyctivex.add_groups') > -1 || $isAdmin()"
              color="secondary"
              wait-for-ripple
              icon="add"
              class="q-mr-sm"
              @click.native="$router.push($route.path + 'add/')">
              <q-tooltip anchor="bottom middle" self="top middle">
                Nuevo Grupo
              </q-tooltip>
            </q-btn>
          </div>
        </template>

      <q-td v-if="datatable.hasOwnProperty('actions') && datatable.actions ? true : datatable.hasOwnProperty('actions') && !datatable.actions ? false : true" slot="body-cell-manage" slot-scope="props" :props="props">
        <q-btn
          color="blue-grey"
          flat
          round
          icon="visibility"
          @click.native="$router.push(`${$route.path + props.row.id}/detail/`)">
          <q-tooltip anchor="top middle" self="bottom middle">Ver</q-tooltip>
        </q-btn>
        <q-btn
          v-if="props.row.type != 'default'"
          color="info"
          flat
          round
          icon="border_color"
          @click.native="$router.push(`${$route.path + props.row.id}/`)">
          <q-tooltip anchor="top middle" self="bottom middle">Editar</q-tooltip>
        </q-btn>
        <q-btn
          v-if="$q.localStorage.get.item('permissions').indexOf('db.delete_custom_') > -1 || ($q.localStorage.get.item('permissions').indexOf('pyctivex.executive') > -1 || $q.localStorage.get.item('permissions').indexOf('pyctivex.leader') > -1) && props.row.type != 'default'"
          color="negative"
          flat
          :disable="props.row.user_set.length > 0"
          round
          icon="delete"
          @click="delItem(props.row.id)"
        >
          <q-tooltip v-if="!props.row.user_set.length" anchor="top middle" self="bottom middle">Eliminar</q-tooltip>
          <q-tooltip v-else anchor="top middle" self="bottom middle">Grupo con usuarios asociados</q-tooltip>
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
            <div>Grupos: <q-chip small class="text-black">{{ serverPagination.rowsNumber }}</q-chip>, cantidad a listar</div>
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
</template>
<script>
import { filter } from 'quasar'
export default {
  name: 'Groups',
  data () {
    return {
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
      this.$props.datatable.columns.push({ name: 'manage', label: 'Acciones', field: 'manage', align: 'center' })
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
      this.$axios.get(this.$props.datatable.serverPage, {
        params: {
          page_size: pagination.rowsPerPage,
          page: pagination.page,
          search: filter,
          ordering: pagination.descending ? '-' + pagination.sortBy : pagination.sortBy
        }
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
        }
        this.loading = false
      }).catch(() => {
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
    delItem (id) {
      this.$q.dialog({
        title: '¿Está seguro?',
        message: 'Al aceptar el grupo se eliminará de manera permanente.',
        ok: 'Aceptar',
        cancel: 'Cancelar',
        preventClose: true,
        noBackdropDismiss: false,
        noEscDismiss: false
      }).then(() => {
        this.$axios.delete(`${this.$props.datatable.serverPage + id}/`).then((response) => {
          if (response.status === 204) {
            this.selected = []
            this.run_request()
            this.$q.notify({
              type: 'info',
              icon: 'info',
              position: 'bottom',
              message: 'El grupo se eliminó exitosamente'
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
    },
    selected: function (val, oldVal) {
      this.$emit('groups', val)
    }
  },
  props: {
    datatable: Object
  }
}
</script>

<style scoped>
</style>
