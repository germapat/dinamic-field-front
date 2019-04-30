<template>
  <q-table
    ref="tableGroups"
    hide-header
    :data="tableData"
    :columns="columns"
    :filter="filter"
    selection="multiple"
    :selected.sync="selected"
    color="secondary"
    no-data-label="No hay grupos disponibles"
    loading-label="Cargando grupos..."
    row-key="id"
    separator="none"
    class="shadow-0">
    <!-- <div slot="bottom" slot-scope="props" class="row flex-center fit">
      <q-btn
        round dense icon="chevron_left" color="primary" class="q-mr-md"
        :disable="!previous"
        @click="request(previous)" />
      <q-btn
        round dense icon="chevron_right" color="primary"
        :disable="!next"
        @click="request(next)" />
    </div> -->
  </q-table>
</template>

<script>
export default {
  name: 'Groups',
  data () {
    return {
      filter: '',
      selected: [],
      tableData: [],
      previous: null,
      next: null,
      columns: [
        { name: 'name', label: 'Nombre', field: 'name', align: 'left' }
      ]
    }
  },
  created () {
    let self = this
    this.request('users/group')
    this.$root.$on('setGroup', function (data) {
      self.selected = data.slice()
    })
  },
  methods: {
    request (page) {
      this.$axios.get(page, {
        params: {
          page_size: 3
        }
      }).then(response => {
        this.tableData = response.data.results.slice()
        this.previous = response.data.previous
        this.next = response.data.next
      }).catch({})
    }
  },
  watch: {
    selected: function (val, oldVal) {
      this.$emit('groups', val)
    }
  }
}
</script>

<style scoped>
</style>
