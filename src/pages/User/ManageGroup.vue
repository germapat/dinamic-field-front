<template>
  <q-layout id="listgroup">
    <div class="bg-form"></div>
      <div class="row">
        <div class="q-table-title-br col-md-6">
          <div>
            <q-breadcrumbs-el :label="$route.params.id ? `Editando ${labelTitle}` : 'Crear grupo'" />
          </div>
            <div class="btn-actions btn-new-ac">
              <q-btn color="tigouner" icon="reply" to="/home/groups/">
              <q-tooltip anchor="bottom middle" self="top middle">
              Volver
            </q-tooltip>
              </q-btn>
            </div>
        </div>
        <q-page-sticky expand position="top-right" :offset="[30, 80]" style="z-index:100">
          <q-btn
            v-if="!$route.params.id && ($isAdmin() || $q.localStorage.get.item('permissions').indexOf('pyctivex.add_groups') !== -1)"
            color="secondary"
            @click="$refs.groupform.save() "
            label="Guardar"
          />
          <q-btn
            v-else-if="$isAdmin() || $q.localStorage.get.item('permissions').indexOf('pyctivex.change_groups') !== -1"
            color="secondary"
            @click="$refs.groupform.edit()"
            label="Actualizar"
          />
        </q-page-sticky>
      </div>
    <br>
    <q-page-container>
      <group-form ref="groupform" :id="parseInt(this.$route.params.id)" @labelTitle="title" />
    </q-page-container>
  </q-layout>
</template>

<script>
import GroupForm from 'components/User/GroupForm'
export default {
  name: 'ManageGroup',
  data () {
    return {
      labelTitle: null
    }
  },
  components: {
    GroupForm
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
