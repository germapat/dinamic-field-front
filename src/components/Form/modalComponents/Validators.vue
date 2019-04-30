<template>
  <div><br>
    <q-field
      icon="touch_app"
      helper="Validaciones para las entradas de información">
      <p class="q-caption text-grey">Validaciones</p>
      <div class="row">
        <div class="col-md-6">
          <q-btn color="tigoune" label="Añadir validaciones" @click="openValidators" class="full-width" />
        </div>
        <div class="col-md-6 padding">
          <q-chip color="primary" v-for="(validator, index) in validators.defaultLabels" :key="index" @hide="delValidator(index)" closable>
            {{validator}}
          </q-chip>
        </div>
      </div>
    </q-field>

    <!-- Dialog para añadir una nueva regla -->
    <q-dialog
      v-model="dialogValidators"
      prevent-close>
      <span slot="title">Nueva regla</span>

      <span slot="message">Selecciona una regla</span>

      <div slot="body">
        <q-field
          helper="Dependiendo de la regla se debe especificar un valor">
          <q-option-group
            type="radio"
            v-model="validators.selected"
            :options="validators.baseOptions"
          />
        </q-field>
        <br>
        <q-field
          v-if="validators.valueHandler"
          icon="account_circle"
          helper="Este valor se aplicará a la regla seleccionada"
          :error="errors.has('value')"
          :error-label="errors.first('value')">
          <q-input
            :type="validators.valueType"
            ref="validatorsvalue"
            autofocus
            v-model="validators.value"
            v-validate="'required'" name="value"
            float-label="Valor de la regla" />
        </q-field>
      </div>

      <template slot="buttons" slot-scope="props">
        <q-btn flat label="Cancelar" @click="onCancel" />
        <q-btn color="primary" label="Aceptar" @click="onOk(props.ok, validators.selected)" />
      </template>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'Validators',
  data () {
    return {
      dialogValidators: false,
      validators: {
        default: [],
        defaultLabels: [],
        json: {},
        selected: null,
        value: null,
        valueHandler: false,
        valueType: 'text',
        selectValidators: [
          { label: 'Requerido', value: 'required' },
          { label: 'Expresión regular', value: 'regex' }
        ],
        textValidators: [
          { label: 'Correo electrónico', value: 'email' },
          { label: 'Letras', value: 'alpha' },
          { label: 'Letras y espacios', value: 'alpha_spaces' },
          { label: 'Alfanumérico', value: 'alpha_num' },
          { label: 'Alfanumérico y guiones bajos o medios', value: 'alpha_dash' },
          { label: 'Tarjeta de crédito', value: 'credit_card' },
          { label: 'Dirección IP', value: 'ip' },
          { label: 'Dirección URL', value: 'url' },
          { label: 'Números', value: 'numeric' },
          { label: 'Máximo de caracteres', value: 'max' },
          { label: 'Valor máximo', value: 'max_value' },
          { label: 'Superior a', value: 'after', sublabel: 'Aplica para campos tipo fecha' }
        ],
        baseOptions: []
      }
    }
  },
  created () {
    if (this.data.hasOwnProperty('options') || this.data.type === 'InputDateTime' || this.data.type === 'InputColor' || this.data.type === 'InputDate') {
      this.validators.baseOptions = this.validators.selectValidators.slice()
    } else {
      this.validators.baseOptions = this.validators.selectValidators.concat(this.validators.textValidators)
    }
    let self = this
    this.validators.json = Object.assign({}, this.data.validators)
    this.$root.$on('resetValues', function () {
      self.validators.json = {}
      self.validators.value = null
    })
  },
  methods: {
    openValidators () {
      this.dialogValidators = true
    },
    onOk (okFn, selected) {
      this.$validator.validate().then(result => {
        if (result) {
          this.$set(this.validators.json, selected, this.validators.value || true)
          this.validators.selected = null
          this.dialogValidators = false
          this.$emit('validatorAdded', this.validators.json)
        }
      })
    },
    onCancel () {
      this.validators.selected = null
      this.validators.value = null
      // this.validators.default = []
      // this.validators.defaultLabels = []
      this.dialogValidators = false
    },
    delValidator (index) {
      let item = this.validators.default[index]
      let json = Object.assign({}, this.validators.json)
      delete json[item]
      this.validators.json = Object.assign({}, json)
      this.$emit('validatorAdded', json)
    }
  },
  watch: {
    'validators.json': {
      handler: function (val) {
        for (var i in val) {
          this.$set(this.validators.json, i, val[i])
        }
        this.validators.default = []
        this.validators.defaultLabels = []
        for (var j in val) {
          for (var k in this.validators.baseOptions) {
            if (j === this.validators.baseOptions[k].value) {
              this.validators.default.push(this.validators.baseOptions[k].value)
              this.validators.defaultLabels.push(this.validators.baseOptions[k].label)
            }
          }
        }
      },
      deep: true
    },
    'validators.selected': function (val, oldVal) {
      let array = ['digits', 'max', 'max_value', 'regex']
      if (val === 'min' || val === 'max_value' || val === 'digits') this.validators.valueType = 'number'
      else this.validators.valueType = 'text'

      if (val !== null) {
        if (array.indexOf(val) > -1) {
          this.validators.valueHandler = true
        } else {
          this.validators.valueHandler = false
          this.validators.value = null
        }
      }
    },
    data: function () {
      this.validators.json = Object.assign({}, this.data.validators)
      if (this.data.hasOwnProperty('options') || this.data.type === 'InputDateTime' || this.data.type === 'InputColor' || this.data.type === 'InputDate') {
        this.validators.baseOptions = this.validators.selectValidators.slice()
      } else {
        this.validators.baseOptions = this.validators.selectValidators.concat(this.validators.textValidators)
      }
    }
  },
  props: { data: Object }
}
</script>

<style scoped>
</style>
