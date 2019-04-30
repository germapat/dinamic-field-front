<template>
  <q-table
    ref="tablePermissions"
    hide-header
    :data="tableData"
    :columns="columns"
    :filter="filter"
    selection="multiple"
    :selected.sync="selected"
    no-data-label="No hay permisos disponibles"
    loading-label="Cargando permisos..."
    color="secondary"
    row-key="id"
    separator="none"
    class="shadow-0">
    <div slot="bottom" slot-scope="props" class="row flex-center fit">
      <q-btn
        round dense icon="chevron_left" color="primary" class="q-mr-md"
        :disable="!previous"
        @click="request(previous)" />
      <q-btn
        round dense icon="chevron_right" color="primary"
        :disable="!next"
        @click="request(next)" />
    </div>
  </q-table>
</template>

<script>
export default {
  name: 'Permissions',
  data () {
    return {
      filter: '',
      selected: [],
      tableData: [],
      previous: null,
      next: null,
      columns: [
        { name: 'name', label: 'Nombre', field: 'name', align: 'left' }
      ],
      arrayIdPermissions: []
    }
  },
  created () {
    let self = this
    this.request('users/permission')
    this.$root.$on('setPermissions', function (data) {
      self.selected = data.slice()
    })
  },
  methods: {
    request (page) {
      this.$axios.get(page, {
        params: {
          page_size: 10
        }
      }).then(response => {
        this.tableData = response.data.results.slice()
        this.previous = response.data.previous
        this.next = response.data.next
        this.$refs.tablePermissions.innerPagination.rowsPerPage = 10
      }).catch({})
    }
  },
  watch: {
    selected: function (val, oldVal) {
      this.$emit('permissions', val)
    }
  }
}
</script>

<style scoped>
</style>
