<template>
  <div class="row">
    <div class="col-12">
      <q-table
        @fullscreen="true"
        grid
        hide-header
        selection="multiple"
        row-key="id"
        title="Administrador de formularios"
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

        <template slot="top-right" slot-scope="props" class="row">
          <div class="col-xs-12 col-md-6">
            <q-btn-dropdown flat dense no-caps color="primary" label="Ordenar por" align="center">
              <q-btn label="Nombre - Asc" no-caps @click="order('label')" v-close-overlay /><br>
              <q-btn label="Nombre - Des" no-caps @click="order('-label')" v-close-overlay />
            </q-btn-dropdown>
          </div>
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
          <div class="col-xs-12 col-md-6 q-ml-md btn-new crater"
            v-if="($q.localStorage.get.item('permissions').indexOf('pyctivex.executive') > -1 || $q.localStorage.get.item('permissions').indexOf('pyctivex.leader') > -1 || $q.localStorage.get.item('permissions').indexOf('form.add_form') > -1)">
            <q-btn
              color="secondary"
              wait-for-ripple
              icon="add"
              class="q-mr-sm"
              @click.native="$router.push($route.path + 'add/')">
              <q-tooltip anchor="bottom middle" self="top middle">
                Formulario nuevo
              </q-tooltip>
            </q-btn>
          </div>
        </template>
        <div
          slot="item"
          slot-scope="props"
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 transition-generic"
          :style="props.selected ? 'transform: scale(0.95);' : ''">
          <q-card
            class="transition-generic cursor-pointer"
            :class="props.selected ? 'bg-grey-2' : ''"
            @click.native="props.selected = !props.selected">
            <q-context-menu v-if="($isAdmin() || ($q.localStorage.get.item('permissions').indexOf('form.view_form') > -1 || $q.localStorage.get.item('permissions').indexOf('form.delete_form') > -1))">
              <q-list link separator style="min-width: 150px; max-height: 300px;">
                <q-item
                  v-if="($isAdmin() || $q.localStorage.get.item('permissions').indexOf('form.view_form') > -1)"
                  v-close-overlay
                  @click.native="$router.push($route.path  + props.row.id + '/')">
                  <q-item-main label="Editar" />
                </q-item>
                <q-item
                  v-if="($isAdmin() || $q.localStorage.get.item('permissions').indexOf('form.delete_form') > -1)"
                  v-close-overlay
                  @click.native="delItem(props.row.id)">
                  <q-item-main label="Eliminar" />
                </q-item>
              </q-list>
            </q-context-menu>
            <q-card-title >
              <span :style="`color:${props.row.color}`">{{ props.row.label | cut}}</span>
              <span slot="subtitle">{{ props.row.access | traslate }}</span>
              <q-icon slot="right" :name="props.row.icon || 'description'" :style="`color: grey;`" />
              <q-btn round flat icon="more_vert" slot="right" @click="disableSelect">
                <q-popover>
                  <q-list link class="no-border">
                    <q-item v-if="($isAdmin() || $q.localStorage.get.item('permissions').indexOf('form.view_form') > -1)"
                      v-close-overlay
                      @click.native="$router.push($route.path  + props.row.id + '/')"
                    >
                      <q-item-side icon="border_color" color="blue-grey-6" />
                      <q-item-main label="Editar" />
                    </q-item>
                    <q-item v-if="($isAdmin() || $q.localStorage.get.item('permissions').indexOf('form.delete_form') > -1)"
                      v-close-overlay
                      @click.native="delItem(props.row.id)"
                    >
                      <q-item-side icon="visibility_off" color="negative"/>
                      <q-item-main label="Ocultar" />
                    </q-item>
                  </q-list>
                </q-popover>
              </q-btn>
            </q-card-title>
            <q-card-main>
              <p class="text-italic text-grey-7 q-caption" v-if="props.row.description">{{ props.row.description.substr(0,45) + '...'}}</p>
              <p class="text-italic text-grey q-caption" v-else>Sin descripción</p>
            </q-card-main>
            <q-card-separator />
            <q-card-actions class="bg-blue-grey">
              <q-btn-group class="full-width justify-between" flat>
                <q-btn
                  v-if="($isAdmin() || $q.localStorage.get.item('permissions').indexOf('db.graph_custom_' + props.row.model) > -1)"
                  icon="pie_chart"
                  flat
                  color="warning"
                  @click.native="$router.push('/home/form/charts/' + props.row.id +'/' )">
                  <q-tooltip anchor="top middle" self="bottom middle">Ver gráficas</q-tooltip>
                </q-btn>
                <q-btn
                  icon="list"
                  flat
                  color="info"
                  @click.native="viewEntries(props.row.id, props.row.label)">
                  <q-tooltip anchor="top middle" self="bottom middle">Ver entradas</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="($isAdmin() || $q.localStorage.get.item('permissions').indexOf('db.export_custom_' + props.row.model) > -1)"
                  icon="import_export"
                  flat
                  color="green-4"
                  @click.native="download(props.row.id)">
                  <q-tooltip anchor="top middle" self="bottom middle">Exportar</q-tooltip>
                </q-btn>
                <q-btn
                  icon="note_add"
                  flat
                  color="white"
                  @click="$router.push('/forms/' + props.row.id + '/new/')">
                  <q-tooltip anchor="top middle" self="bottom middle">Crear registro</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-card-actions>
          </q-card>
        </div>
        <div slot="bottom" slot-scope="props" class="fit">
          <div class="flex-center justify-between">
            <div class="col-xs-12 col-sm-3 col-md-2 text-center">
              <span v-if="selected.length > 0">
                {{selected.length > 1 ? (selected.length - count_selected) + ' registros seleccionados' : (selected.length - count_selected) + ' registro seleccionado' }}
              </span>
            </div>
            <div class="row col-xs-12 col-sm-7 col-md-4 flex-center">
              <div>Formularios: <q-chip small class="text-black">{{ serverPagination.rowsNumber }}</q-chip>, cantidad a listar</div>
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
export default {
  name: 'MainForm',
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
    this.run_request()
  },
  methods: {
    download (id) {
      window.open(`${this.$baseUrl}forms/data/export/${id}/`)
    },
    /*
        Buscar, paginar, ordenar y filtrar en servidor
        NOTA: Todas los cambios realizados en el component QTable son buscados en servidor para obtener información actualizada
    */
    request ({ pagination, filter }) {
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
    viewEntries (id, label) {
      this.$q.localStorage.set('titleform', label)
      this.$router.push(this.$route.path + id + '/entries/')
    },
    viewCharts (id) {
      this.$router.push(this.$route.path + 'charts/' + id + '/')
    },
    delItem (id) {
      this.$q.dialog({
        title: '¿Está seguro?',
        message: 'Al aceptar el formulario será eliminado de manera permanente',
        ok: 'Aceptar',
        cancel: 'Cancelar',
        preventClose: true,
        noBackdropDismiss: false,
        noEscDismiss: false
      }).then(() => {
        this.$axios.delete(`forms/manage/${id}/`).then((response) => {
          if (response.status === 204) {
            this.selected = []
            this.run_request()
            this.$messages('info', 'Se elimino el formulario exitosamente')
          }
        }).catch((error) => {
          if (error.response.status === 404) {
            this.run_request()
          }
        })
      }).catch(() => {
      })
    },
    disableSelect () {
      this.selected.splice(0, this.selected.length)
    },
    disableItem (id) {
      let configDialog = Object.assign(this.$configDialog, {
        title: '¿Está seguro?',
        message: 'Al aceptar el formulario será eliminado de manera permanente'
      })
      this.$q.dialog(configDialog).then(() => {
        this.$axios.delete(`${this.$props.datatable.serverPage + id}/`).then((response) => {
          if (response.status === 204) {
            this.selected = []
            this.run_request()
            this.$messages('info', 'Se elimino el registro exitosamente')
          }
        }).catch((error) => {
          if (error.response.status === 404) {
            this.run_request()
          }
        })
      }).catch(() => {
      })
    },
    order (val) {
      this.$axios.get(`forms/manage/?ordering=${val}`).then(({ data }) => {
        this.serverData = data.results
      }).catch(response => {
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
  },
  filters: {
    traslate: function (value) {
      if (value === 'public') {
        return 'Público'
      } else {
        return 'Privado'
      }
    },
    cut: function (value) {
      if (value.length > 30) {
        return value.substr(0, 30) + '...'
      } else {
        return value
      }
    }
  }
}
</script>

<style scoped>
</style>
