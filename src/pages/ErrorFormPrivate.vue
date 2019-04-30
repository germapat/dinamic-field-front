<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/private.svg"
        style="width:30vw;max-width:150px;filter:grayscale(50%)"
      >
    </p>
    <p class="text-faded" v-if="$q.localStorage.has('token')">No tienes acceso a este formulario</p>
    <p class="text-faded" v-else>Este formulario es privado</p>
    <q-btn
      color="primary"
      style="width:200px;"
      @click="redirect"
    >Ir al inicio</q-btn>
  </div>
</template>

<script>
export default {
  name: 'ErrorFormPrivate',
  methods: {
    redirect () {
      if (this.$q.localStorage.has('token')) {
        this.$router.push('/home/forms/')
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>
