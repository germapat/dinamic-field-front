<template>
  <div>
    <div class="row">
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="person"
          :error="errors.has('username')"
          :error-label="errors.first('username')">
          <q-input
            id="username"
            type="text"
            color="secondary"
            name="username"
            float-label="Usuario (Usuario de red sí tiene uno) (*)"
            v-model.trim="dataUser.username"
            @keyup.enter="ldap()"
            v-validate="'alpha|required|max:50'"
            :readonly="($route.params.id && dataUser.login_type === 'LDAP' ) && disabledLoginType || !$isAdmin()"
            :after="[
              {
                content: true,
                icon: 'search',
                handler () {
                  ldap()
                }
              }
            ]" />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="fingerprint"
          :error="errors.has('document')"
          :error-label="errors.first('document')">
          <q-input
            id="document"
            type="text"
            color="secondary"
            name="document"
            float-label="Documento (*)"
            v-model.trim="dataUser.document"
            v-validate="'required|alpha_num|max:12'"
            :readonly="dataUser.login_type === 'LDAP' || !$isAdmin()" />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="email"
          :error="errors.has('email')"
          :error-label="errors.first('email')">
          <q-input
            id="email"
            type="email"
            color="secondary"
            name="email"
            float-label="Correo electrónico"
            v-model.trim="dataUser.email"
            v-validate="'max:75|email'"
           />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="title"
          :error="errors.has('first_name')"
          :error-label="errors.first('first_name')">
          <q-input
            id="first_name"
            type="text"
            color="secondary"
            name="first_name"
            float-label="Nombres (*)"
            v-model.trim="dataUser.first_name"
            v-validate="'required|alpha_spaces|max:30'"
            :readonly="dataUser.login_type === 'LDAP' || !$isAdmin()" />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6">
        <q-field
          icon="text_fields"
          :error="errors.has('last_name')"
          :error-label="errors.first('last_name')">
          <q-input
            id="last_name"
            type="text"
            color="secondary"
            name="last_name"
            float-label="Apellidos (*)"
            v-model.trim="dataUser.last_name"
            v-validate="'required|alpha_spaces|max:150'"
            :readonly="dataUser.login_type === 'LDAP' || !$isAdmin()" />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6" v-if="!$route.params.id && $q.localStorage.get.item('permissions').indexOf('pyctivex.executive') !== -1">
        <q-field
          icon="group_work"
          :error="errors.has('login_type')"
          :error-label="errors.first('login_type')">
          <q-select
            id="login_type"
            color="secondary"
            name="login_type"
            ref="login_type"
            float-label="Tipo de autenticación"
            v-model.trim="dataUser.login_type"
            :disable="(disabledLoginType || ($q.localStorage.get.item('permissions').indexOf('pyctivex.executive') === -1)) || dataUser.login_type === 'LDAP'"
            :options="[
              { label: 'Aplicación', value: 'APPLICATION' },
              { label: 'Directorio activo', value: 'LDAP' }
            ]"
          />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6" v-if="dataUser.login_type === 'APPLICATION' && $q.localStorage.get.item('permissions').indexOf('pyctivex.executive') !== -1">
        <q-field
          icon="lock"
          :error="errors.has('password')"
          :error-label="errors.first('password')">
          <q-input
            type="password"
            float-label="Contraseña (*)"
            data-vv-as="Contraseña"
            name="password"
            ref="password"
            v-model="dataUser.password"
            v-validate="'max:60'" />
        </q-field>
      </div>
      <div class="col-xs-12 col-xl-6" v-if="dataUser.hasOwnProperty('password') && dataUser.password !== '' && $q.localStorage.get.item('permissions').indexOf('pyctivex.executive') !== -1">
        <q-field
          icon="lock"
          :error="errors.has('confirmPassword')"
          :error-label="errors.first('confirmPassword')">
          <q-input
            type="password"
            float-label="Confirmar contraseña (*)"
            name="confirmPassword"
            v-model="confirmPassword"
            v-validate="'required|confirmed:password'" />
        </q-field>
      </div>
    </div>
    <div class="row q-mt-md">
      <div class="col-12">
        <q-field
          class="q-mt-md"
          icon="group"
          label="Grupos (*)"
          orientation="vertical">
          <groups
            ref="groups"
            :datatable="info_datatable"
            @groups="groupsUpdate" />
        </q-field>
      </div>
    </div>
  </div>
</template>

<script>
import Groups from 'components/Table/Groups.vue'
export default {
  name: 'UserForm',
  components: {
    Groups
  },
  data () {
    return {
      userId: this.$route.params.id ? this.$route.params.id : null,
      disabledLoginType: true,
      confirmPassword: null,
      dataUser: {
        document: null,
        first_name: null,
        last_name: null,
        email: null,
        login_type: null,
        username: null,
        is_active: null,
        groups: []
      },
      info_datatable: {
        columns: [
          { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true }
        ],
        serverPage: 'users/group/',
        hideHeader: true,
        shadow: 0,
        selection: 'multiple',
        actions: false
      },
      userGroup: [],
      visible: true
    }
  },
  created () {
    if (this.userId) {
      this.getUser()
    }
  },
  methods: {
    groupsUpdate (data) {
      this.userGroup = data
    },
    getUser () {
      this.$axios.get(`users/account/${this.userId}/`).then(response => {
        this.dataUser = Object.assign(response.data)
        if (this.$route.params.id && (this.$q.localStorage.get.item('permissions').indexOf('pyctivex.change_user') !== -1 || this.$isAdmin())) {
          this.info_datatable.selection = 'multiple'
        } else {
          this.info_datatable.selection = 'none'
        }
        this.$refs.groups.selected = response.data.groups
        if (this.dataUser.groups.length > 0) {
          if (this.dataUser.groups[0].id === 1 || this.dataUser.groups[0].id === 2) {
            this.dataUser.user_permissions = []
            for (let i = 0; i < response.data.user_permissions.length; i++) {
              this.dataUser.user_permissions.push(response.data.user_permissions[i].id)
            }
          }
        }
        this.$root.$emit('setPermissions', this.dataUser.user_permissions)
        this.$emit('labelTitle', this.dataUser.username)
        this.$root.$emit('setGroup', this.dataUser.groups)
      }).catch({})
    },
    // Metodo para buscar usuarios en el directorio activo
    ldap () {
      if (this.dataUser.hasOwnProperty('is_active')) {
        delete this.dataUser['is_active']
      }
      this.$axios.post('users/active_directory/check/', {
        user: this.dataUser.username
      }).then(response => {
        if (response.data[1] === 200) {
          this.dataUser.document = response.data[0].epersonal.document
          this.dataUser.first_name = response.data[0].epersonal.first_name
          this.dataUser.last_name = response.data[0].epersonal.last_name + ' ' + response.data[0].epersonal.surname
          this.dataUser.email = response.data[0].epersonal.email
          this.dataUser.login_type = 'LDAP'
          this.disabledLoginType = false
        } else {
          this.$messages('warning', 'El usuario no existe en el directorio activo')
          this.dataUser.login_type = 'APPLICATION'
          this.disabledLoginType = true
        }
      }).catch({})
    },
    // Registra al colaborador en la base de datos de Sysform
    save () {
      this.$validator.validate().then(result => {
        if (result) {
          if (this.dataUser.groups.length > 0) {
            this.$axios.post('users/account/', this.dataUser).then(response => {
              this.$messages('info', 'Usuario creado exitosamente')
              this.$router.replace('/home/users/')
            }).catch((error) => {
              if (error.hasOwnProperty('response')) {
                if (error.response.hasOwnProperty('status') && error.response.status === 400) {
                  if (this.dataUser.login_type === 'APPLICATION' && !this.$q.localStorage.get.item('permissions').indexOf('pyctivex.executive') !== -1) {
                    this.$messages('negative', 'No puede registrar usuarios que no existen en el directorio activo')
                  } else {
                    let key = Object.keys(error.response.data)[0]
                    this.$errorVeeValidate('username', error.response.data[key][0])
                  }
                }
              }
            })
          } else {
            this.$messages('negative', 'El usuario debe pertenecer por lo menos a un grupo')
          }
        }
      })
    },
    edit () {
      this.$validator.validate().then(result => {
        if (result) {
          if (this.dataUser.groups.length > 0) {
            this.$axios.put('users/account/' + this.userId + '/', this.dataUser).then(response => {
              if (response.status === 200) {
                this.$messages('info', 'Usuario actualizado exitosamente')
                this.$router.replace('/home/users/')
              }
            }).catch(error => {
              if (error.hasOwnProperty('response')) {
                if (error.response.hasOwnProperty('status') && error.response.status === 400) {
                  let key = Object.keys(error.response.data)[0]
                  this.$errorVeeValidate('username', error.response.data[key][0])
                }
              }
            })
          } else {
            this.$messages('negative', 'El usuario debe pertenecer por lo menos a un grupo')
          }
        }
      })
    }
  },
  watch: {
    'dataUser.login_type': function (val, oldVal) {
      if (val === 'APPLICATION' && !this.userId) {
        if (!this.dataUser.hasOwnProperty('password')) {
          this.dataUser['password'] = null
        }
      } else {
        if (this.dataUser.hasOwnProperty('password')) {
          delete this.dataUser['password']
        }
      }
    },
    userGroup: {
      handler: function (val, oldVal) {
        this.dataUser.groups = []
        for (var i in val) {
          this.dataUser.groups.push(val[i].id)
          if (val[i].id === 1 || val[i].id === 2) {
            this.visible = false
          } else {
            if (this.dataUser.groups.indexOf(1) > -1 || this.dataUser.groups.indexOf(2) > -1) {
              this.visible = false
            } else {
              this.visible = true
            }
          }
        }
      },
      deep: true
    }
  },
  props: {
    id: Number
  }
}
</script>
<style scoped>
</style>
