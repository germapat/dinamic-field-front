<template>
  <div class="row">
    <div class="col-12 q-mt-lg q-mb-sm q-title text-primary row items-center">
      <div class="q-title text-primary">Acciones de Mostrar/Ocultar</div>
      <q-btn icon="add_circle" color="grey" round size="md" dense flat class="q-ml-sm" @click="dialogDependent = true" />
    </div>
    <div class="col-12 q-mt-lg q-mb-sm row">
      <div v-if="$props.data.dependent.length > 0">
        <div v-for="(d, indexD) in $props.data.dependent" :key="indexD">
          <q-item>
            <q-item-tile><q-chip>{{indexD + 1}}</q-chip></q-item-tile>
            <q-item no-padding>{{d.action ? 'Mostrar': 'Ocultar'}} cuando {{d.field}} sea {{d.rule}} {{d.value}}</q-item>
            <q-item-tile>
              <q-btn
                dense
                icon="delete"
                round
                flat
                color="grey"
                size="sm"
                @click="delDependent(indexD)"
              />
            </q-item-tile>
          </q-item>
        </div>
      </div>
      <div v-else>
        No hay dependencias seleccionadas
      </div>
    </div>

    <q-dialog
      v-model="dialogDependent"
      prevent-close>
      <span slot="title">Nueva dependencia</span>

      <span slot="message">Selecciona e ingresa los campos necesarios para crear una dependencia</span>

      <div slot="body" class="row">
        <div class="col-xs-12 col-sm-6">
          <q-field
            icon="visibility"
            helper="Acción a ejecutar cuando cumpla la condición">
            <q-select
              color="secondary"
              :options="[
                { value: true, label: 'Mostrar'},
                { value: false, label: 'Ocultar'}
              ]"
              float-label="Visibilidad"
              v-model="dependent.action" />
          </q-field>
        </div>
        <div class="col-xs-12 col-sm-6">
          <q-field
            icon="dns"
            helper="Campo a aplicar la condición"
            :error="errors.has('dependentOptions')"
            :error-label="errors.first('dependentOptions')">
            <q-select
              clearable
              color="secondary"
              :options="dependentOptions"
              name="dependentOptions"
              v-validate="'required'"
              float-label="Seleccione un campo"
              v-model="dOptionField" />
          </q-field>
        </div>
        <div class="col-xs-12 col-sm-6" v-if="dOptionField">
          <q-field
            icon="code"
            helper="Regla de la condición"
            :error="errors.has('rule')"
            :error-label="errors.first('rule')">
            <q-select
              clearable
              color="secondary"
              name="rule"
              v-validate="'required'"
              :options="[
                { value: '<', label: 'Menor que'},
                { value: '<=', label: 'Menor o igual que'},
                { value: '===', label: 'Igual que'},
                { value: '=>', label: 'Mayor o igual que'},
                { value: '>', label: 'Mayor que'},
                { value: '<>', label: 'Diferente que'}
              ]"
              float-label="Condición"
              v-model="dependent.rule" />
          </q-field>
        </div>
        <div class="col-xs-12 col-sm-6" v-if="dependent.rule">
          <q-field
            v-if="!dependentHandler.hasOwnProperty('options')"
            icon="spellcheck"
            helper="Valor que se aplicará a la condición"
            :error="errors.has('value')"
            :error-label="errors.first('value')">
            <q-input
              name="value"
              v-validate="'required'"
              v-model="dependent.value"
              float-label="Valor de condición" />
          </q-field>
          <q-field
            v-else
            icon="list"
            helper="Opción que se aplicará a la condición">
            <q-select
              color="secondary"
              :options="dependentHandler.options"
              float-label="Valor de condición"
              v-model="dependent.value" />
            </q-field>
        </div>
      </div>

      <template slot="buttons" slot-scope="props">
        <q-btn flat label="Cancelar" @click="cancel()" />
        <q-btn color="primary" label="Aceptar" @click="saveDependent(dependent)" />
      </template>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'Dependent',
  data () {
    return {
      dialogDependent: false,
      dependentOptions: [],
      dOptionField: null,
      dependentHandler: {},
      dependents: [],
      f: {},
      dependent: {
        action: false,
        field: null,
        rule: null,
        value: null,
        condition: null
      },
      dataForm: {}
    }
  },
  created () {
    this.refreshFields()
    this.$root.$on('resetValues', this.resetValues)
  },
  methods: {
    resetValues () {
      this.dependents = []
    },
    cancel () {
      this.dependent = {}
      this.dOptionField = null
      this.dialogDependent = false
      this.$validator.reset()
      this.dependents = []
      this.refreshFields()
    },
    saveDependent (dependent) {
      this.$validator.validate().then(result => {
        if (result) {
          let typeValue = null
          if (typeof dependent.value === 'string') typeValue = String('"' + dependent.value + '"')
          else typeValue = dependent.value
          this.dependent.condition = String('this.valuesJSON["' + dependent.field + '"] ' + dependent.rule + ' ' + typeValue)
          this.dependents.push(this.dependent)
          this.$emit('updateDependent', this.dependents)
        }
        this.dependent = {}
        this.dOptionField = null
        this.dialogDependent = false
        this.$validator.reset()
      })
    },
    delDependent (indexD) {
      this.dependents.splice(indexD, 1)
      for (var i in this.dependents) {
        this.$set(this.dependents, i, this.dependents[i])
      }
      this.$emit('updateDependent', this.dependents)
    },
    refreshFields () {
      this.dataForm = Object.assign({}, this.$q.localStorage.get.item('dataForm'))
      this.f = Object.assign({}, this.$props.data)
      this.dependents = this.f.dependent.slice()
      let options = []
      for (var i in this.dataForm.fields) {
        for (var j in this.dataForm.fields[i].fields) {
          if (this.dataForm.fields[i].fields[j].name !== this.f.name) {
            options.push({
              value: i + '|' + j,
              label: this.dataForm.fields[i].fields[j].label
            })
          }
        }
      }
      this.dependentOptions = options.slice()
    }
  },
  watch: {
    dOptionField: function (val, oldVal) {
      if (val !== null) {
        let indexes = val.split('|')
        this.dependentHandler = Object.assign({}, this.dataForm.fields[indexes[0]].fields[indexes[1]])
        this.dependent.field = this.dependentHandler.name
      }
    },
    dialogDependent: function (val, oldVal) {
      this.refreshFields()
    }
  },
  props: { data: Object }
}
</script>

<style scoped>
</style>
