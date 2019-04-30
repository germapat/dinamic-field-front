<template>
  <div>
    <q-field
      :icon="config.icon || 'text_fields'"
      :helper="config.helper"
      :error="validators.length > 0"
      :error-label="validators[0]">
      <q-input
        type="text"
        color="secondary"
        :float-label="config.label || 'Nombre'"
        :prefix="config.prefix"
        :suffix="config.suffix"
        :readonly="config.readonly || false"
        v-model.trim="content"
        @input="setValue" />
      </q-field>
  </div>
</template>
<script>
export default {
  name: 'InputText',
  data () {
    return {
      content: this.value
    }
  },
  props: {
    value: String,
    config: Object,
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
