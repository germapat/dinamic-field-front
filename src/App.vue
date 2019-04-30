<template>
  <div id="q-app">
    <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
      <router-view />
    </transition>
  </div>
</template>

<script>
import VeeValidate from 'vee-validate'
import Vue from 'vue'
export default {
  name: 'App',
  created () {
    let self = this

    const dictionary = {
      es: {
        messages: {
          required: () => 'Se requiere este campo',
          alpha: () => 'El campo solo permite el ingreso de letras',
          email: () => 'Correo electrónico inválido',
          min: function (fieldName, params, data) {
            if (params < 2) {
              return `Se requiere por lo menos ${params} caracter`
            } else {
              return `El mínimo de caracteres permitidos es de ${params}`
            }
          },
          max: function (fieldName, params, data) {
            if (params < 2) {
              return `Ha superado el máximo de ${params} caracter permitido`
            } else {
              return `Ha superado el máximo de ${params} caracteres permitidos`
            }
          },
          max_value: (fieldName, params, data) => `El valor ingresado supera el máximo permitido de ${params}`,
          numeric: () => 'Solo se permiten ingresar números',
          alpha_spaces: () => 'El campo solo permite el ingreso de letras y espacios',
          alpha_dash: () => 'El campo solo permite el ingreso de letras, números, guiones bajos o medios',
          credit_card: () => 'La tarjeta de crédito ingresada es incorrecta',
          ip: () => 'La IP ingresada es incorrecta',
          url: () => 'La URL ingresada es incorrecta',
          after: () => 'La fecha ingresada no cumple con la validación',
          alpha_num: () => 'Solo se permiten letras y números',
          confirmed: (fieldName, params, data) => `Este valor no coincide con el ingresado en el campo '${params}'`,
          regex: () => 'Este campo solo permite el ingreso de letras, números y espacios'
        }
      }
    }
    // const duplicatedValueObject = {
    //   getMessage (field, args) {
    //     return 'Un campo con este nombre ya existe'
    //   },
    //   validate (value, args) {
    //     if (filter(value, { field: 'label', list: LocalStorage.get.item('dataForm').fields }).length > 1) {
    //       return false
    //     } else {
    //       return true
    //     }
    //   }
    // }
    // Validator.extend('duplicatedValueObject', duplicatedValueObject)

    // Controlador de errores para campos de ingreso de información
    Vue.use(VeeValidate, {
      events: 'input|change',
      fastExit: true,
      dictionary: dictionary,
      fieldsBagName: 'fields',
      locale: 'es',
      inject: true
    })
    this.$axios.interceptors.response.use(function (response) {
      return response
    }, function (error) {
      let status = error.response.status
      switch (status) {
        case 401:
          self.$q.localStorage.remove('token')
          self.$q.localStorage.remove('user')
          self.$q.localStorage.remove('permissions')
          self.$redirect('login')
          break
      }
      return Promise.reject(error)
    })
    // Se establece la url base
    this.$axios.defaults.baseURL = this.$baseUrl
    // Se establece los Headers de Axios siempre que allá un Token en SessionStorage
    if (this.$q.localStorage.has('token')) {
      this.$axios.defaults.headers.common['Authorization'] = 'JWT ' + this.$q.localStorage.get.item('token')
    }
  }
}
</script>
<style scope lang="stylus">
</style>
