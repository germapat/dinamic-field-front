<template>
  <q-field
    :error="validators.length > 0"
    :error-label="validators[0]"
    :icon="config.icon || 'radio_button_checked'"
    :helper="config.helper"
    :label="config.label || 'Etiqueta del campo'"
    orientation="vertical">
    <q-option-group
      type="radio"
      @input="setValue"
      :readonly="config.readonly || false"
      v-model="select"
      color="secondary"
      :options="config.options || opts" />
  </q-field>
</template>
<script>
export default {
  name: 'InputRadio',
  data () {
    return {
      select: this.value,
      opt: []
    }
  },
  props: {
    config: Object,
    value: String,
    validators: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  watch: {
    value (val) {
      this.select = val
    }
  },
  methods: {
    setValue () {
      this.$emit('input', this.select)
    }
  }
}
</script>
<style scoped>
</style>
