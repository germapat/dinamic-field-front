<template>
  <q-field
    :icon="config.icon || 'description'"
    :helper="config.helper"
    :error="validators.length > 0"
    :error-label="validators[0]"
  >
    <q-input
      color="secondary"
      type="textarea"
      :float-label="config.label || 'Nombre'"
      :prefix="config.prefix"
      :suffix="config.suffix"
      :readonly="config.readonly || false"
      v-model="content"
      @input="setValue" />
    </q-field>
</template>
<script>
export default {
  name: 'InputText',
  data () {
    return {
      content: this.value
    }
  },
  watch: {
    value (val) {
      this.content = val
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
  methods: {
    setValue () {
      this.$emit('input', this.content)
    }
  }
}
</script>
<style scoped>
</style>
