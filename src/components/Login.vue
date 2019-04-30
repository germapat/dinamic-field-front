<template>
<div id="login" class="flex flex-center">
    <div class="container-left">
        <div class="container-form flex flex-center">
            <div class="form-login">
              <div class="row">
                <div class="col-12">
                  <div class="logo"></div>
                </div>
                <!-- <div class="col-3">
                  <div class="logo3"></div>
                </div> -->
              </div>
                <div class="form-inputs">
                    <div class="row">
                        <div class="col-12 text-center">
                          <!-- <h5>Bienvenido</h5> -->
                            <p>Por favor ingresa tus credenciales</p>
                        </div>
                        <div class="col-12">
            <q-field
              icon="person"
              :error="errors.has('user_name')"
              :error-label="errors.first('user_name')">
              <q-input
                type="text"
                color="lightSecondary"
                name="user_name"
                v-validate="'alpha|required|max:50'"
                v-model="userName"
                v-on:keyup.enter="login()"
                float-label="Usuario (*)" />
            </q-field>
          </div>
          <div class="col-12">
            <q-field
              icon="lock"
              :error="errors.has('password')"
              :error-label="errors.first('password')">
              <q-input
                type="password"
                color="lightSecondary"
                name="password"
                v-validate="'required|max:60'"
                v-model="password"
                v-on:keyup.enter="login()"
                float-label="Contraseña (*)" />
            </q-field>
          </div>
          <div class="col-12 text-center">
            <q-btn label="Ingresar" color="tigoune" class="q-mt-lg full-width" @click="login" :loading="load" />
            <q-btn label="Gestionar contraseña" class="no-shadow" color="blue-grey" flat no-caps icon="vpn_lock" @click="openURL('http://emtelco.co/showLogin.cc')" />
          </div>
                    </div>
                </div>
            </div>
            <div class="footer">
                <div class="logo2"></div>
                <div class="copyright">
                    Copyright © 2019 Emtelco S.A.S Med/Col Gerencia de Ingeniería y Desarrollo |   <a href="https://www.emtelco.com.co/ZonaE/sites/default/files/politicas_de_privacidad.pdf" target="_black">Políticas de privacidad</a>
                </div>
            </div>
            <!-- <img class="emtelco-small" src="~assets/emtelco2.png" alt=""> -->
        </div>
    </div>
    <div class="bg-login"></div>
     <div class="bg-login-color"></div>
    </div>
</template>

<script>
import { openURL } from 'quasar'
export default {
  name: 'Login',
  data () {
    return {
      load: false,
      userName: null,
      password: null
    }
  },
  methods: {
    openURL,
    login () {
      let self = this
      this.$validator.validate().then(result => {
        if (result) {
          this.load = true
          this.$axios.post('api-token-auth/', {
            username: this.userName,
            password: this.password
          }).then((response) => {
            if (response.status === 200) {
              let session = self.$q.localStorage
              session.set('token', response.data.token)
              session.set('user', response.data.user)
              session.set('permissions', response.data.permissions)
              if (session.has('token')) {
                self.$axios.defaults.headers.common['Authorization'] = 'JWT ' + session.get.item('token')

                if (self.$route.query.hasOwnProperty('returnRoute')) {
                  self.$router.replace(self.$route.query.returnRoute)
                } else {
                  self.$router.replace('/home/')
                }
              }
            }
          }).catch((error) => {
            self.load = false
            if (error.hasOwnProperty('response') && error.response.hasOwnProperty('data')) {
              if (error.response.data.hasOwnProperty('non_field_errors')) {
                if (error.response.data.non_field_errors[0] === 'Error consultando LDAP') {
                  this.$messages('negative', 'El usuario está inactivo.')
                } else if (error.response.data.non_field_errors[0] === 'Usuario o password incorrectos') {
                  this.$messages('negative', 'No puede iniciar sesión con las credenciales proporcionadas.')
                } else {
                  this.$messages('negative', error.response.data.non_field_errors[0])
                }
                this.password = null
                this.$validator.reset()
              } else {
                if (error.response.data.hasOwnProperty('username')) self.$errorVeeValidate('user_name', error.response.data.username[0])
                else if (error.response.data.hasOwnProperty('password')) self.$errorVeeValidate('password', error.response.data.password[0])
              }
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
