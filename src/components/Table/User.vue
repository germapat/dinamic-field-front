<template>
  <div class="row">
    <div class="col-12">
      <q-table
        selection="none"
        row-key="id"
        title="Administrador de usuarios"
        no-data-label="No se encontró ningún usuario"
        loading-label="Cargando usuarios..."
        :columns="datatable.columns"
        :data="serverData"
        color="secondary"
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

        <template slot="top-right" slot-scope="props" class="row">
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
              v-if="$q.localStorage.get.item('permissions').indexOf('pyctivex.add_user') > -1 || $isAdmin()"
              color="secondary"
              wait-for-ripple
              icon="add"
              class="q-mr-sm"
              @click.native="$router.push($route.path + 'new/')">
              <q-tooltip anchor="bottom middle" self="top middle">
                Usuario nuevo
              </q-tooltip>
            </q-btn>
          </div>
        </template>

        <q-td slot="body-cell-groups" slot-scope="props" :props="props" style="width: 20px">{{ props.row.groupsName[0] }}</q-td>
        <q-td slot="body-cell-login" slot-scope="props" :props="props" style="width: 5px">
          {{ props.row.login }}
        </q-td>
        <q-td slot="body-cell-is_active" slot-scope="props" :props="props" style="width: 4px">
          <q-toggle
            v-if="$q.localStorage.get.item('permissions').indexOf('pyctivex.change_user') > -1 || $isAdmin()"
            v-model="props.row.is_active" unchecked-icon="cancel" checked-icon="check_circle"
            @input="props.row.is_active ? updateItem(props.row.id, props.row) : delItem(props.row.id, props.row.username)"
            >
              <q-tooltip anchor="top middle" self="bottom middle">Cambiar estado</q-tooltip>
          </q-toggle>
          <span v-else>{{ props.row.is_active === true ? 'Activo' : 'Inactivo' }}</span>
        </q-td>
        <q-td slot="body-cell-manage" slot-scope="props" :props="props">
          <q-btn
            flat
            color="blue-grey"
            icon="visibility"
            @click.native="$router.push($route.path + props.row.id + '/detail/')">
            <q-tooltip anchor="top middle" self="bottom middle">Ver</q-tooltip>
          </q-btn>
          <q-btn
            flat
            v-if="$q.localStorage.get.item('permissions').indexOf('pyctivex.change_user') > -1 || $isAdmin()"
            color="info"
            icon="border_color"
            @click.native="$router.push($route.path + props.row.id + '/')"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Editar</q-tooltip>
          </q-btn>
          <!-- <q-btn
            flat
            v-if="$q.localStorage.get.item('permissions').indexOf('pyctivex.leader') > -1 || $q.localStorage.get.item('permissions').indexOf('pyctivex.executive') > -1"
            color="negative"
            :disable="props.row.is_active === false"
            icon="cancel"
            @click="delItem(props.row.id, props.row.username)">
            <q-tooltip anchor="top middle" self="bottom middle">Inactivar</q-tooltip>
          </q-btn> -->
        </q-td>
        <div slot="bottom" slot-scope="props" class="fit">
          <div class="flex-center justify-between">
            <div class="col-xs-12 col-sm-3 col-md-2 text-center">
              <span v-if="selected.length > 0">
                {{selected.length > 1 ? (selected.length - count_selected) + ' registros seleccionados' : (selected.length - count_selected) + ' registro seleccionado' }}
              </span>
            </div>
            <div class="row col-xs-12 col-sm-7 col-md-4 flex-center">
              <div>Usuarios: <q-chip small class="text-black">{{ serverPagination.rowsNumber }}</q-chip>, cantidad a listar</div>
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
  name: 'User',
  data () {
    return {
      serverData: [],
      loading: false,
      filter: this.search_text,
      count_selected: 0,
      entries: [],
      selected: [],
      datatable: {
        columns: [
          { name: 'document', label: 'Documento', field: 'document', align: 'left' },
          { name: 'username', label: 'Usuario', field: 'username', align: 'left', sortable: true },
          { name: 'first_name', label: 'Nombres', field: 'first_name', align: 'left', sortable: true },
          { name: 'last_name', label: 'Apellidos', field: 'last_name', align: 'left', sortable: true },
          { name: 'groups', label: 'Grupo principal', field: 'groupsName', align: 'left' },
          { name: 'login', label: 'Tipo de autenticación', field: 'login', align: 'left' },
          { name: 'is_active', label: 'Estado', field: 'is_active', align: 'center' },
          { name: 'manage', label: 'Acciones', field: 'manage', align: 'center' }
        ]
      },
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
    /*
        Buscar, paginar, ordenar y filtrar en servidor
        NOTA: Todas los cambios realizados en el component QTable son buscados en servidor para obtener información actualizada
    */
    request ({ pagination, filter }) {
      this.entries = []
      // Se activa el estado 'Cargando'
      this.loading = true
      // Se realiza petición al servidor con los parámetros que vamos a filtrar
      this.$axios.get('users/account/', {
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
          for (let g = 0; g < this.serverData[i].groups.length; g++) {
            this.serverData[i].groupsName.push(this.serverData[i].groups[g].name.replace('default_', '').replace('custom_', ''))
          }
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
    delItem (id, user) {
      this.$q.dialog({
        title: '¿Está seguro?',
        message: 'Un usuario inactivo no puede acceder a la aplicación',
        ok: 'Aceptar',
        cancel: 'Cancelar',
        preventClose: true,
        noBackdropDismiss: false,
        noEscDismiss: false
      }).then(() => {
        this.$axios.delete(`users/account/${id}/`).then((response) => {
          if (response.status === 204) {
            this.selected = []
            this.run_request()
            this.$messages('warning', `El usuario ${user} se inactiva con éxito`)
          }
        }).catch((error) => {
          if (error.response.status === 404) {
            this.run_request()
          }
        })
      }).catch(() => {
        this.run_request()
      })
    },
    updateItem (id, data) {
      delete data['groups']
      this.$axios.put('users/account/' + id + '/', data).then(response => {
        if (response.status === 200) {
          this.$messages('info', `El usuario ${data.username} se activa con éxito`)
          this.run_request()
        }
      }).catch(error => {
        if (error.hasOwnProperty('response')) {
          console.log('error')
        }
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
    edit: Boolean
  }
}
</script>

<style scoped>
</style>
