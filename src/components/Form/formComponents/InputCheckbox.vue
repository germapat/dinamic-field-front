<template>
  <q-field
    :icon="config.icon || 'touch_app'"
    :helper="config.helper"
    :label="config.label || 'Etiqueta del campo'"
    orientation = "vertical"
    :error="validators.length > 0"
    :error-label="validators[0]"
  >
    <q-option-group
      type="checkbox"
      v-model="checked"
      :readonly="config.readonly || false"
      @input="setValue"
      :color="config.color || 'secondary'"
      :options="config.options || opts"
    />
  </q-field>
</template>
<script>
export default {
  name: 'InputCheckbox',
  created () {
    this.checked = this.value || []
  },
  data () {
    return {
      checked: this.value,
      opts: []
    }
  },
  props: {
    config: Object,
    value: Array,
    validators: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  watch: {
    value (val) {
      if (val) {
        this.checked = val
      }
    }
  },
  methods: {
    setValue () {
      this.$emit('input', this.checked)
    }
  }
}
</script>
<style scoped>

</style>
