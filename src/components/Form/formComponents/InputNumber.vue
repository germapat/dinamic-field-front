<template>
  <q-field
    :icon="config.icon || 'exposure'"
    :helper="config.helper"
    :error="validators.length > 0"
    :error-label="validators[0]"
  >
    <q-input
      color="secondary"
      type="number"
      :readonly="config.readonly || false"
      :float-label="config.label || 'Nombre'"
      :prefix="config.prefix"
      :suffix="config.suffix"
      v-model="content"
      @input="setValue" />
    </q-field>
</template>
<script>
export default {
  name: 'InputNumber',
  data () {
    return {
      content: this.value
    }
  },
  props: {
    config: Object,
    value: Number,
    validators: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  watch: {
    value (val) {
      this.content = val
    }
  },
  methods: {
    setValue () {
      this.$emit('input', this.content)
    }
  }
}
</script>
<style scoped>
</style>
