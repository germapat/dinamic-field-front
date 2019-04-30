<template>
  <div>
    <div class="row">
      <div class="col-12">
        <q-field
          icon="title"
          :error="errors.has('groupName')"
          :error-label="errors.first('groupName')">
          <q-input
            type="text" color="secondary"
            name="groupName"
            :readonly="!($isAdmin() || $q.localStorage.get.item('permissions').indexOf('pyctivex.change_groups') !== -1)"
            float-label="Nombre del grupo (*)"
            v-model.trim="groupName"
            v-validate="'required|max:50'"
          />
        </q-field>
      </div>
      <br><br><br><br><br>
      <div class="col-12">
        <q-field
          v-if="(($route.params.id && $q.localStorage.get.item('permissions').indexOf('pyctivex.change_groups') !== -1) || $q.localStorage.get.item('permissions').indexOf('pyctivex.add_groups') !== -1) || $isAdmin()"
          label="Permisos(*)"
          orientation="vertical"
          icon="vpn_lock">
            <permissions ref="permissions" :datatable="info_datatable" @permissions="permissionsUpdate" />
        </q-field>
      </div>
    </div>
  </div>
</template>

<script>
import Permissions from 'components/Table/Permissions'
export default {
  name: 'GroupForm',
  components: { Permissions },
  data () {
    return {
      groupId: this.$route.params.id ? this.$route.params.id : null,
      dataGroup: {
        name: null,
        permissions: []
      },
      info_datatable: {
        columns: [
          { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true }
        ],
        serverPage: 'users/permission/',
        hideHeader: true,
        shadow: 0,
        selection: 'multiple',
        actions: false
      },
      permissions: [],
      groupName: null
    }
  },
  created () {
    if (this.groupId) {
      this.getGroup()
    } else {
      this.$axios.get('users/group/').then(response => {
        this.userGroup = response.data.results
      }).catch(response => {})
    }
  },
  methods: {
    permissionsUpdate (data) {
      this.dataGroup.permissions = data.slice()
    },
    getGroup () {
      this.$axios.get(`users/group/${this.groupId}/`).then(response => {
        if (response.data.type === 'default') {
          this.$messages('warning', `El grupo ${response.data.name} no se puede editar`)
          this.$router.replace('/home/groups/')
        } else {
          this.groupName = response.data.name
          this.dataGroup = response.data
          this.$root.$emit('setPermissions', response.data.permissions)
          this.$emit('labelTitle', this.dataGroup.name)
          this.$refs.permissions.selected = response.data.permissions
        }
      }).catch(error => {
        if (error.hasOwnProperty('response')) {
          if (error.response.status === 404) {
            this.$router.push('/home/groups/')
          }
        }
      })
    },
    save () {
      this.$validator.validate().then(result => {
        if (result) {
          if (this.dataGroup.permissions.length > 0) {
            this.$axios.post('users/group/', this.dataGroup).then(response => {
              this.$messages('info', 'Grupo creado exitosamente')
              this.$router.replace('/home/groups/')
            }).catch((error) => {
              if (error.response.status === 400) {
                this.$errorVeeValidate('groupName', 'Ya existe un grupo con este nombre')
              }
            })
          } else {
            this.$messages('negative', 'El grupo debe tener mínimo un permiso')
          }
        }
      })
    },
    edit () {
      this.$validator.validate().then(result => {
        if (result) {
          if (this.dataGroup.permissions.length > 0) {
            this.$axios.put(`users/group/${this.groupId}/`, this.dataGroup).then(response => {
              if (response.status === 200) {
                this.$messages('info', 'Grupo actualizado correctamente')
                this.$router.replace('/home/groups/')
              }
            }).catch(error => {
              if (error.response.status === 400) {
                this.$errorVeeValidate('groupName', 'Ya existe un grupo con este nombre')
              }
              if (error.response.status === 404) {
                this.request({
                  pagination: this.serverPagination,
                  filter: ''
                })
              }
            })
          } else {
            this.$messages('negative', 'El grupo debe tener mínimo un permiso')
          }
        }
      })
    }
  },
  watch: {
    groupName: function (val, oldVal) {
      if (this.$route.params.id) {
        this.dataGroup.name = (this.dataGroup.type + '_' + this.groupName)
      } else {
        this.dataGroup.name = ('custom_' + this.groupName)
      }
    }
  },
  props: {
    id: Number
  }
}
</script>

<style scoped>

</style>
