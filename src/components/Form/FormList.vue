<template>
  <div id="listform">
    <div class="bg-form"></div>
    <main-form :datatable="info_datatable" />
  </div>
</template>
<script>
import MainForm from 'components/Table/MainForm'
export default {
  name: 'FormList',
  components: { MainForm },
  data () {
    return {
      info_datatable: {
        columns: [
          { name: 'label', label: 'Nombre', field: 'label', align: 'left', sortable: true },
          { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
          { name: 'color', label: 'Color', field: 'color', align: 'left' },
          { name: 'access', label: 'Acceso', field: 'access', align: 'left' }
        ],
        serverPage: 'forms/manage/',
        title: 'Lista de formularios',
        permissions: {
          add: 'form.add_form',
          edit: 'form.change_form',
          delete: 'form.delete_form'
        },
        entries: true
      }
    }
  }
}
</script>

<style scoped>
</style>
