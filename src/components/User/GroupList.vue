<template>
  <div id="listform">
    <div class="bg-form"></div>
    <groups :datatable="info_datatable" />
  </div>
</template>
<script>
import Groups from 'components/Table/Groups.vue'
export default {
  name: 'GroupList',
  components: { Groups },
  data () {
    return {
      info_datatable: {
        columns: [
          { name: 'name', label: 'Grupo', field: 'name', align: 'left', sortable: true }
        ],
        serverPage: 'users/group/',
        title: 'Administrador de grupos',
        permissions: {
          add: 'auth.add_group',
          edit: 'auth.change_group',
          delete: 'auth.delete_group'
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
