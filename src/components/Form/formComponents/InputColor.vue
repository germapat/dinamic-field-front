<template>
   <q-field
    :helper="config.helper"
    :icon="config.icon || 'format_color_fill'">
    <q-color
      v-model="styleObject.backgroundColor"
      modal
      clearable
      :readonly="config.readonly || false"
      color="secondary"
      ok-label="Establecer"
      cancel-label="Cancelar"
      :float-label="config.label || 'Elige un color'"
      :default-value="config.default ? config.default : '#00377B'" />
  </q-field>
</template>
<script>
export default {
  name: 'InputColor',
  data () {
    return {
      styleObject: {
        backgroundColor: this.value
      }
    }
  },
  watch: {
    value (val) {
      this.styleObject.backgroundColor = val
    }
  },
  props: {
    config: Object
  }
}
</script>
<style scoped>
</style>
