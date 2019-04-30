<template>
  <div id="listuser">
    <div class="bg-form"></div>
    <div class="row">
      <div class="q-table-title-br col-md-6">
        <div>
          <q-breadcrumbs-el :label="$route.params.id ? `Editando ${labelTitle}` :  'Crear usuario'" />
        </div>
        <div class="btn-actions btn-new-ac">
          <q-btn color="tigouner" icon="reply" to="/home/users/">
            <q-tooltip anchor="bottom middle" self="top middle">
              Volver
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <div class="col-md-6 text-right btns-actions">
        <q-btn
          v-if="!$route.params.id && ($isAdmin() || $q.localStorage.get.item('permissions').indexOf('pyctivex.add_user') !== -1)"
          color="secondary"
          @click="$refs.userform.save()"
          label="Guardar"
        />
        <q-btn
          v-else-if="$route.params.id && ($isAdmin() || $q.localStorage.get.item('permissions').indexOf('pyctivex.change_user') !== -1)"
          color="secondary"
          @click="$refs.userform.edit()"
          label="Actualizar"
        />
      </div>
    </div>
    <q-list no-border>
      <q-item class="bg-container">
        <q-item-main>
          <user-form ref="userform" :id="parseInt(this.$route.params.id)" @labelTitle="title" />
        </q-item-main>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import UserForm from 'components/User/UserForm'
export default {
  name: 'ManageUser',
  data () {
    return {
      labelTitle: null
    }
  },
  components: {
    UserForm
  },
  methods: {
    title (data) {
      this.labelTitle = data
    }
  }
}
</script>

<style scoped>
</style>
