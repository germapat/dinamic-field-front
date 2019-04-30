<template>
  <div id="listform">
    <div class="bg-form"></div>
    <div class="row">
      <div class="q-table-title-br col-md-6">
        <div>
          <q-breadcrumbs-el :label="$route.params.id ? `Editando ${labelTitle}` : 'Crear formulario'" />
        </div>
        <div class="btn-actions btn-new-ac">
          <q-btn color="tigouner" icon="reply" to="/home/forms/">
            <q-tooltip anchor="bottom middle" self="top middle">
              Volver
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <div class="col-md-6 text-right btns-actions">
        <q-btn
          v-if="!$route.params.id && ($isAdmin() || $q.localStorage.get.item('permissions').indexOf('form.add_form') > -1)"
          color="secondary"
          @click="$refs.mainform.manage('save')"
          label="Guardar"
        />
        <q-btn
          v-else
          color="secondary"
          flat
          @click="$refs.mainform.manage('edit')"
          label="Actualizar"
        />
      </div>
    </div>
    <q-list no-border>
      <q-item class="bg-container">
        <q-item-main>
          <main-form ref="mainform" :id="parseInt(this.$route.params.id)" @labelTitle="title" />
        </q-item-main>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import MainForm from 'components/Form/MainForm'
export default {
  name: 'ManageForm',
  data () {
    return {
      labelTitle: null
    }
  },
  components: {
    MainForm
  },
  methods: {
    title (data) {
      if (data.length > 50) {
        this.labelTitle = data.substr(0, 50) + '...'
      } else {
        this.labelTitle = data
      }
    }
  }
}
</script>

<style scoped>
</style>
