<template>
  <div id="listgroup">
    <div class="bg-form"></div>
    <div class="row q-mb-md">
      <div class="q-table-title-br col-md-6">
        <div>
          <q-breadcrumbs-el :label="`Detalle ${groupName}`" />
        </div>
        <div class="btn-actions btn-new-ac">
          <q-btn color="tigouner" icon="reply" to="/home/groups/">
            <q-tooltip anchor="bottom middle" self="top middle">Volver</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <div class="row justify-around">
      <q-field
        class="col-6"
        label="Usuarios"
        orientation="vertical"
        icon="groups">
        <q-chip square tag color="tigoune" v-for="(user, indexUser) in dataGroup.user_set" :key="indexUser" class="q-mr-sm q-mb-sm">{{ user }}</q-chip>
      </q-field>
      <q-field
        class="col-5"
        label="Permisos"
        orientation="vertical"
        icon="vpn_lock">
        <q-chip square tag color="tigoune" v-for="(permission, indexPermission) in dataGroup.permissions" :key="indexPermission" class="q-mr-sm q-mb-sm">
          <span v-if="permission.name === 'executive' || permission.name === 'leader'">{{`El grupo ${groupName} tiene todos los permisos`}}</span>
          <span v-else-if="permission.name === 'agent'">Agente</span>
          <span v-else>{{ permission.name }}</span>
        </q-chip>
      </q-field>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GroupView',
  data () {
    return {
      groupId: this.$route.params.id,
      dataGroup: {},
      groupName: null
    }
  },
  created () {
    this.getGroup()
  },
  methods: {
    getGroup () {
      this.$axios.get(`users/group/${this.groupId}/`).then(response => {
        this.groupName = response.data.name
        this.dataGroup = response.data
      }).catch()
    }
  }
}
</script>

<style scoped>
</style>
