import { LocalStorage } from 'quasar'

export default ({ Vue }) => {
  Vue.prototype.$baseUrl = process.env.API_URL

  Vue.prototype.$redirect = function (route) {
    let routeFormated = null
    switch (route) {
      case 'login': routeFormated = '/'
        break
    }
    this.$router.replace({ path: routeFormated, query: { 'returnRoute': this.$route.path } })
  }

  // Retorna un Boolenano, 'True' en caso de que hayan valores duplicados dentro del objeto en la llave especificada
  Vue.prototype.$duplicatedValueObject = function (txt, key, obj) {
    let value = obj => obj[key] === txt
    if (obj.some(value)) return true
    else return false
  }

  // Retorna el número de índice donde se encontró el valor que coincidió con el valor enviado (Teniendo en cuenta que en el objeto no se están guardando valores duplicados)
  Vue.prototype.$searchValueObject = function (obj, keySearch, txtSearch) {
    for (var i in obj) {
      if (obj[i][keySearch] === txtSearch) {
        return parseInt(i)
      }
    }
  }

  Vue.prototype.$isAdmin = function () {
    if (LocalStorage.get.item('permissions').indexOf('pyctivex.executive') !== -1 || LocalStorage.get.item('permissions').indexOf('pyctivex.leader') !== -1) {
      return true
    } else {
      return false
    }
  }

  Vue.prototype.$configDialog = {
    preventClose: true,
    ok: {
      flat: true,
      color: 'secondary',
      label: 'Aceptar'
    },
    cancel: {
      flat: true,
      color: 'grey',
      label: 'Cancelar'
    }
  }

  Vue.prototype.$errorVeeValidate = function (fieldName, msg) {
    let field = this.$validator.fields.find({ name: fieldName })
    this.errors.add({
      field: field.name,
      msg: msg,
      id: field.id
    })
  }

  // Formatea un objecto (Que tenga obligatoriamente las llaves 'name' y 'label') para ajustarlo al formato requerido por el atributo Options
  Vue.prototype.$parseOptions = function (data) {
    return data.map(item => {
      if (item.label != null) {
        return {
          value: item.name,
          label: item.label.toUpperCase()
        }
      } else {
        return []
      }
    })
  }
  // Función global que limpia las valores de las llaves de un objeto JSON
  Vue.prototype.$cleanObj = function (obj) {
    let keys = Object.keys(obj)
    let object = {}
    for (var i in keys) {
      if (obj[keys[i]] instanceof Array) {
        object[keys[i]] = []
      } else if (obj[keys[i]] instanceof Object) {
        object[keys[i]] = {}
      } else {
        object[keys[i]] = null
      }
    }
    return object
  }

  // Retorna el valor enviado en un formato string y guion bajo en caso de que hayan espacios
  Vue.prototype.$formatName = function (value) {
    let newVal = (value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')).toLowerCase().split(' ').join('_')
    return newVal
  }

  // Función para mostrar mensajes tipo Notificación (Notify)
  Vue.prototype.$messages = function (type, message) {
    let icon = 'new_releases'
    if (type === 'negative') icon = 'cancel'
    if (type === 'warning') icon = 'info'
    if (type === 'info') icon = 'check_circle'
    this.$q.notify({
      type: type,
      icon: icon,
      textColor: 'black',
      position: 'bottom',
      message: message
    })
  }

  // Funciones de sesión
  Vue.prototype.$sessionLogin = function () {
    if (!LocalStorage.has('token') && !LocalStorage.has('user') && !LocalStorage.has('pemrissions')) {
      this.$router.replace({ path: '/', query: { 'returnRoute': this.$route.path } })
    }
  }
}
