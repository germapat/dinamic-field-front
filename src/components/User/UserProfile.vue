<template>
  <div>
    <div>
      <p class="q-title text-center">Información de usuario <span class="text-secondary">{{ dataUser.username }}</span></p>
    </div>
    <div class="row">
    <q-card class="q-ma-sm col">
      <q-item>
        <q-item-side :avatar="`statics/avatars/${avatarSelected}`" />
        <q-item-main>
          <!-- <q-btn-dropdown icon="sync" rounded flat dense>
            <q-list link>
              <q-item v-for="(avatar, indexAvatar) in avatars" :key="indexAvatar" v-close-overlay
                @click.native="avatarSelected = avatar">
                <q-item-side :avatar="`statics/avatars/${avatar}`"/>
              </q-item>
            </q-list>
          </q-btn-dropdown> -->
        </q-item-main>
        <q-item-side right>
          <q-btn icon="send" dense round flat color="secondary" @click="sendUpdate" />
        </q-item-side>
      </q-item>
      <q-card-separator />
      <q-card-main>
        <div class="row">
          <div class="col-xs-12 col-xl-6">
            <q-field icon="tab">
              <q-input type="number" stack-label="Documento" color="secondary" v-model.trim="dataUser.document" readonly />
            </q-field>
          </div>
          <div class="col-xs-12 col-xl-6">
            <q-field icon="person" >
              <q-input type="text" stack-label="Nombres" color="secondary" v-model.trim="dataUser.first_name" readonly />
            </q-field>
          </div>
          <div class="col-xs-12 col-xl-6">
            <q-field icon="account_circle">
              <q-input type="text" stack-label="Apellidos" color="secondary" v-model.trim="dataUser.last_name" readonly/>
            </q-field>
          </div>
          <div class="col-xs-12 col-xl-6">
            <q-field icon="meeting_room" >
              <q-input type="text" stack-label="Tipo de ingreso" color="secondary" v-model.trim="dataUser.login" readonly/>
            </q-field>
          </div>
          <div class="col-xs-12 col-xl-6">
            <q-field icon="vpn_lock">
              <q-input type="password" stack-label="Contraseña" color="secondary" v-model.trim="dataUser.password" />
            </q-field>
          </div>
          <div class="col-xs-12 col-xl-6">
            <q-field icon="email">
              <q-input type="email" stack-label="Correo Electronico" color="secondary" v-model.trim="dataUser.email" />
            </q-field>
          </div>
        </div>
      </q-card-main>
      <q-card-actions>
        <q-btn icon="arrow_back" flat dense round color="tertiary" replace to="/home/" />
      </q-card-actions>
    </q-card>
    </div>
  </div>
</template>
<script>
export default {
  name: 'UserProfile',
  data () {
    return {
      dataUser: {},
      avatars: ['boy.png', 'girl.png', 'girl-1.png', 'man.png', 'man-1.png', 'man-2.png', 'man-3.png',
        'man-4.png', 'user.png'],
      avatarSelected: 'man-1.png'
    }
  },
  created () {
    this.$axios.get('users/profile/').then(response => {
      this.dataUser = response.data
    }).catch(response => {})
  },
  methods: {
    sendUpdate () {
      this.$axios.put('users/profile/', this.dataUser).then(response => {
        if (response.status === 200) {
          this.$messages('info', 'Se actualizó correctamente')
          this.$router.replace('/home/forms/')
        }
      }).catch(error => {
        if (error.response.status === 400) {
          this.errorsMessage = this.$errors(error)
        }
      })
    }
  }

}
</script>
<style scoped>
</style>
