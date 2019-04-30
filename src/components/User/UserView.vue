<template>
  <div id="listgroup">
    <div class="bg-form"></div>
    <div class="row q-mb-md">
      <div class="q-table-title-br col-md-6">
        <div>
          <q-breadcrumbs-el :label="`Detalle ${username}`" />
        </div>
        <div class="btn-actions btn-new-ac">
          <q-btn color="tigouner" icon="reply" to="/home/users/">
            <q-tooltip anchor="bottom middle" self="top middle">Volver</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <q-card flat>
      <q-card-main class="row">
        <div class="col-xs-12 col-xl-6">
        <q-field
          icon="fingerprint"
        >
          <q-input
            stack-label="Documento"
            readonly
            v-model.trim="dataUser.document"
             />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="email"
        >
          <q-input
            stack-label="Correo electrónico"
            v-model.trim="dataUser.email"
            readonly
          />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="title"
        >
          <q-input
            float-label="Nombres"
            v-model.trim="dataUser.first_name"
            readonly
          />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="text_fields"
        >
          <q-input
            float-label="Apellidos"
            v-model.trim="dataUser.last_name"
            readonly
          />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="bookmark"
        >
          <q-select
            id="is_active"
            color="secondary"
            name="is_active"
            float-label="Estado"
            v-model.trim="dataUser.is_active"
            readonly
            :options="[
              { label: 'Activo', value: true },
              { label: 'Inactivo', value: false }
            ]" />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="spellcheck"
        >
          <q-select
            float-label="Tipo de autenticación"
            v-model.trim="dataUser.login_type"
            readonly
            :options="[
              { label: 'Aplicación', value: 'APPLICATION' },
              { label: 'Directorio activo', value: 'LDAP' }
            ]"
          />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="group_work"
          label="Grupos"
          orientation="vertical"
        >
          <q-chip class="q-mr-sm q-mb-sm" square color="tigoune" v-for="(group, indexGroup) in dataUser.groups" :key="indexGroup">{{ group.name | cut }}</q-chip>
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="date_range"
        >
          <q-datetime
            float-label="Fecha de registro"
            format="DD/MM/YYYY"
            v-model.trim="dataUser.date_joined"
            readonly
          />
        </q-field>
      </div>
      </q-card-main>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'UserView',
  data () {
    return {
      userId: this.$route.params.id,
      dataUser: {},
      username: null
    }
  },
  created () {
    this.getUser()
  },
  methods: {
    getUser () {
      this.$axios.get(`users/account/${this.userId}/`).then(response => {
        this.username = response.data.username
        this.dataUser = response.data
      }).catch()
    }
  },
  filters: {
    cut: function (value) {
      if (!value) return ''
      value = value.toString()
      let group = value.split('_')
      return group[1]
    }
  }
}
</script>

<style scoped>
</style>
