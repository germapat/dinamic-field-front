<template>
  <q-modal v-model="minimizedModal" :content-css="{minWidth: '50vw', maxWidth: '70vw'}" no-esc-dismiss no-backdrop-dismiss>
    <q-modal-layout class="modal-forms">
      <div class="q-table-title-br">
        <div>
          Editar campo
        </div>
      </div>
      <div class="div-block">
      <div v-if="f" class="row items-start">
          <div class="col-12 row">
            <div v-if="f.hasOwnProperty('label')" class="col-xs-12 col-md-6">
              <q-field
                icon="text_format"
                helper="Identificador del campo"
                :error="errors.has('label')"
                :error-label="errors.first('label')">
                <q-input v-model.trim="f.label" v-validate="{required: true, regex: /^([A-Za-z0-9\s]+)$/, max: 50}" name="label" float-label="Nombre (*)" />
              </q-field>
            </div>

            <div v-if="f.hasOwnProperty('helper')" class="col-xs-12 col-md-6">
              <q-field
                icon="help"
                helper="Información adicional sobre el campo"
                :error="errors.has('helper')"
                :error-label="errors.first('helper')">
                <q-input v-model="f.helper" v-validate="'max:100'" name="helper" float-label="Texto de ayuda" />
              </q-field>
            </div>

            <div v-if="f.hasOwnProperty('prefix')" class="col-xs-12 col-md-6">
              <q-field
                icon="skip_previous"
                helper="Texto justo antes del campo. Visible el foco está dentro del campo"
                :error="errors.has('prefix')"
                :error-label="errors.first('prefix')">
                <q-input v-model="f.prefix" v-validate="'max:20'" name="prefix" float-label="Prefijo" />
              </q-field>
            </div>

            <div v-if="f.hasOwnProperty('suffix')" class="col-xs-12 col-md-6">
              <q-field
                icon="skip_next"
                helper="Texto justo despues del campo. Visible el foco está dentro del campo"
                :error="errors.has('suffix')"
                :error-label="errors.first('suffix')">
                <q-input v-model="f.suffix" v-validate="'max:20'" name="suffix" float-label="Sufijo" />
              </q-field>
            </div>

            <div v-if="f.hasOwnProperty('visible')" class="col-xs-12 col-md-6">
              <q-field
                icon="visibility"
                helper="El campo se mostrará o no de acuerdo a la selección">
                <q-select
                  v-model="f.visible"
                  :options="[
                    { label: 'Visible', value: true },
                    { label: 'Invisible', value: false }
                  ]"
                  float-label="Visibilidad"
                />
              </q-field>
            </div>

            <div v-if="f.hasOwnProperty('plus_functions')" class="col-xs-12 col-md-6">
              <q-field
                icon="visibility"
                helper="Capturar de manera automática, una de estas opciones desde la plataforma Avaya">
                <q-select
                  v-model="f.plus_functions"
                  :options="[
                    { label: 'ID de llamada', value: 'ucid' },
                    { label: 'Usuario', value: 'login' },
                    { label: 'ANI', value: 'ani' }
                  ]"
                  float-label="Funciones adicionales"
                  clearable
                />
              </q-field>
            </div>
            <div v-if="f.hasOwnProperty('options')" class="col-xs-12 col-md-6">
              <m-options @optionsUpdated="updateOptions" :data="f" ref="options" />
            </div>
            <div v-if="f.hasOwnProperty('dependent') && !create" class="col-12">
              <dependent @updateDependent="updateDependent" :data="f" />
            </div>
            <div v-if="f.hasOwnProperty('validators')" class="col-xs-12 col-md-12">
              <validators @validatorAdded="updateValidators" :data="f" />
            </div>
          </div>
        </div>

        <div class="text-center"><br>
            <q-btn label="Cancelar" flat class="text-grey-7" @click="cancelEdit" />
            <q-btn color="tigoune" label="Guardar" @click="saveEdit" />
        </div>
      </div>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import draggable from 'vuedraggable'
import Validators from 'components/Form/modalComponents/Validators'
import MOptions from 'components/Form/modalComponents/MOptions'
import Dependent from 'components/Form/modalComponents/Dependent'
export default {
  name: 'ModalFields',
  components: { draggable, Validators, MOptions, Dependent },
  data () {
    return {
      minimizedModal: false,
      f: null,
      dataForm: this.$props.data,
      iF: null,
      iL: null,
      originalName: null,
      create: null,
      label: null,
      options: []
    }
  },
  created () {
    this.$root.$on('openModalFields', this.openEdit)
  },
  methods: {
    openEdit (data) {
      this.$validator.reset()
      this.f = data.f
      this.iF = data.iF
      this.iL = data.iL
      this.originalName = this.f.name
      this.create = data.create
      this.minimizedModal = true
    },
    saveEdit () {
      this.$validator.validate().then(result => {
        if (result) {
          let dataForm = this.$q.localStorage.get.item('dataForm').fields[this.iL].fields
          dataForm.splice(this.iF, 1)
          if (!this.$duplicatedValueObject(this.f.name, 'name', dataForm)) {
            let dF = this.$q.localStorage.get.item('dataForm')
            for (var i in dF.fields) {
              for (var j in dF.fields[i].fields) {
                for (var k in dF.fields[i].fields[j].dependent) {
                  if (dF.fields[i].fields[j].dependent[k].field === this.originalName) {
                    this.$props.data.fields[i].fields[j].dependent[k].field = this.f.name
                    let typeValue = null
                    if (typeof dF.fields[i].fields[j].dependent[k].value === 'string') typeValue = String('"' + dF.fields[i].fields[j].dependent[k].value + '"')
                    else typeValue = dF.fields[i].fields[j].dependent[k].value
                    this.$props.data.fields[i].fields[j].dependent[k].condition = String('this.valuesJSON["' + this.f.name + '"] ' + dF.fields[i].fields[j].dependent[k].rule + ' ' + typeValue)
                  }
                }
              }
            }
            this.$emit('updateFields', {
              f: this.f,
              iF: this.iF,
              iL: this.iL
            })
            this.f = null
            this.iF = null
            this.iL = null
            this.minimizedModal = false
            this.resetValues()
            if (this.create) {
              this.$messages('info', 'El campo se agregó correctamente.')
            }
          } else {
            this.$errorVeeValidate('label', `Ya existe un campo con el nombre '${this.f.label}'`)
          }
        } else {
          if (!this.$refs.options.optionsCustom.length) {
            this.$refs.options.hasError = true
          }
        }
      })
    },
    cancelEdit () {
      if (this.create) {
        let configDialog = Object.assign(this.$configDialog, {
          title: '¿Estás seguro/a?',
          message: 'Al aceptar, eliminarás el campo que intentas crear'
        })
        this.$q.dialog(configDialog).then(() => {
          this.$emit('abortEdit', {
            iL: this.iL,
            iF: this.iF
          })
          this.minimizedModal = false
          this.resetValues()
          this.$validator.reset()
        }).catch(() => {})
      } else {
        this.minimizedModal = false
        this.resetValues()
        this.$validator.reset()
      }
    },
    resetValues () {
      this.$root.$emit('resetValues')
    },
    updateValidators (data) {
      this.f.validators = data
    },
    updateOptions (data) {
      this.f.options = data.options
    },
    updateDependent (data) {
      this.f.dependent = data
    }
  },
  watch: {
    'f.label': function (val, oldVal) { // Al dígitar algo, este Watch transforma el label en otro formato para ser guardado en la BD.
      if (val != null) {
        this.f.name = this.$formatName(val)
        this.f.id = this.$formatName(val)
      }
    }
  },
  props: { data: Object }
}
</script>

<style scoped>
</style>
