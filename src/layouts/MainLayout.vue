<template>
  <q-layout view="hHh Lpr fff">
    <q-layout-drawer v-model="leftDrawerOpen" side="left">
      <q-list-header v-ripple.mat class="relative-position" style="background-image: url(../statics/background.jpg);background-size:cover;">
        <div>
          <q-item>
            <q-item-side avatar="../statics/avatars/man-1.png" />
            <q-item-main :label="userData.hasOwnProperty('username') ? userData.username.toUpperCase() : ''" class="text-white" />
          </q-item>
          <q-item v-if="userData.hasOwnProperty('email')">
            <q-item-main :label="userData.email" class="text-white text-truncate" />
          </q-item>
        </div>
      </q-list-header>
      <q-list no-border>
        <q-item v-if="$isAdmin() || (userPermissions.indexOf('form.view_form') !== -1 || userPermissions.indexOf('form.change_form') !== -1 || userPermissions.indexOf('form.delete_form') !== -1 || userPermissions.indexOf('form.add_form') !== -1)" to="/home/forms/" replace>
          <q-item-side icon="assignment" class="text-faded" />
          <q-item-main label="Formularios" class="text-faded" />
        </q-item>
        <q-item v-if="$isAdmin() || (userPermissions.indexOf('pyctivex.list_user') !== -1 || userPermissions.indexOf('pyctivex.retrieve_user') !== -1 || userPermissions.indexOf('pyctivex.change_user') !== -1 || userPermissions.indexOf('pyctivex.add_user') !== -1)" to="/home/users/" replace>
          <q-item-side icon="group" class="text-faded" />
          <q-item-main label="Usuarios" class="text-faded" />
        </q-item>
        <q-item v-if="$isAdmin() || (userPermissions.indexOf('pyctivex.list_groups') !== -1 || userPermissions.indexOf('pyctivex.retrieve_groups') !== -1 || userPermissions.indexOf('pyctivex.change_groups') !== -1 || userPermissions.indexOf('pyctivex.add_groups') !== -1 || userPermissions.indexOf('pyctivex.delete_groups') !== -1)" to="/home/groups/" replace>
          <q-item-side icon="group_work" class="text-faded" />
          <q-item-main label="Grupos" class="text-faded" />
        </q-item>
        <q-item @click.native="exit()" link>
          <q-item-side icon="exit_to_app" class="text-faded" />
          <q-item-main label="Salir" class="text-faded" />
        </q-item>
      </q-list>
    </q-layout-drawer>
    <q-page-container>
      <q-toolbar
        color="tigoune">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu">
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          <div class="title">
            <span>e-Survey</span>
            <div slot="subtitle">Gestor de formularios</div>
          </div>
          <img src="statics/emtelcot.png" alt="">
        </q-toolbar-title>
      </q-toolbar>
      <router-view class="q-pa-lg" />
      <q-ajax-bar size="5px" color="lightSecondary" />
    </q-page-container>
    <div class="footer bg-main">
        <footer>
            Copyright © 2019 Emtelco S.A.S Med/Col Gerencia de Ingeniería y Desarrollo |   <a href="https://www.emtelco.com.co/ZonaE/sites/default/files/politicas_de_privacidad.pdf" target="_black">Políticas de privacidad</a>
        </footer>
    </div>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      userData: {},
      userPermissions: []
    }
  },
  created () {
    if (this.$q.localStorage.has('user')) this.userData = this.$q.localStorage.get.item('user')
    if (this.$q.localStorage.has('permissions')) this.userPermissions = this.$q.localStorage.get.item('permissions')
  },
  methods: {
    exit () {
      this.$q.localStorage.remove('token')
      this.$q.localStorage.remove('user')
      this.$q.localStorage.remove('permissions')
      this.$router.push('/')
    }
  }
}
</script>
<style>
</style>
