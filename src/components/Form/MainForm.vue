<template>
  <div>
    <div class="row">
      <div class="col-xs-12 col-md-6">
        <q-field
          :error="errors.has('label')"
          :error-label="errors.first('label')"
          icon="title"
          helper="Se mostrará en cada formulario para identificarlo">
          <q-input
            type="text"
            name="label"
            color="secondary"
            float-label="Nombre (*)"
            v-validate="{required : true, regex: /^([A-Za-z0-9\s]+)$/, max: 150}"
            v-model.trim="dataForm.label" />
        </q-field>
      </div>
      <div class="col-xs-12 col-md-6">
        <q-field
          icon="toc"
          :error="errors.has('icon')"
          :error-label="errors.first('icon')"
          helper="Icono del formulario">
          <q-select
            color="secondary"
            name="icon"
            filter
            :options="listIcons"
            float-label="Icono"
            v-model="dataForm.icon" />
        </q-field>
      </div>
      <div class="col-xs-12 col-md-6">
        <q-field
          icon="description"
          :error="errors.has('description')" :error-label="errors.first('description')"
          helper="Información útil sobre este formulario">
          <q-input
            type="textarea"
            name="description"
            color="secondary"
            float-label="Descripción (*)"
            v-validate="'required|max:300'"
            v-model.trim="dataForm.description" />
        </q-field>
      </div>
      <div class="col-xs-12 col-md-6">
        <q-field
          icon="security"
          :error="errors.has('access')" :error-label="errors.first('access')"
          helper="Restricción para el ingreso de registros al formulario">
          <q-select
            :disable="$q.localStorage.get.item('permissions').indexOf('pyctivex.executive') === -1"
            color="secondary"
            name="access"
            :options="[
              { label: 'Público', value: 'public' },
              { label: 'Privado ', value: 'private' }
            ]"
            v-validate="'required'"
            float-label="Acceso (*)"
            v-model="dataForm.access" />
        </q-field>
      </div>
      <div class="col-xs-12 col-md-6">
        <q-field
          icon="format_color_fill"
          helper="Color de fondo">
          <q-color
            color="secondary"
            modal
            float-label="Color"
            v-model="dataForm.color"
            ok-label="Aceptar"
            cancel-label="Cancelar"
            format-model="hex" />
        </q-field>
      </div>
      <div class="col-xs-12 col-md-6">
        <levels ref="levels" @updateScaling="updateScaling" @updateLevels="updateLevels" />
      </div>
    </div>
    <div class="row q-mt-lg">
      <div class="col-12" v-for="(level, indexLevel) in dataForm.fields" :key="indexLevel">
        <div v-if="dataForm.scaling" class="col-12 row items-center q-mb-md">
          <div class="q-title text-secondary">{{level.label}}</div>
          <q-btn icon="edit" color="grey" round size="sm" flat class="q-ml-sm" @click="$refs.levels.updateLevel(indexLevel)" />
          <q-btn v-if="dataForm.fields.length > 1" icon="delete" color="grey" round size="sm" flat @click="$refs.levels.delLevel(indexLevel)" />
        </div>
        <div v-else class="col-12 row items-center q-mb-md">
          <div class="q-title text-secondary">Campos del formulario</div>
        </div>
        <draggable :list="level.fields"
          @add="onAdd"
          :options="{
            group: 'elementsList',
            animation: 300,
            chosenClass: 'dragClass',
            ghostClass: 'dragClass'
          }" v-bind:class="classObject(indexLevel)" :id="indexLevel">
          <div v-for="(field, indexField) in level.fields" :key="indexField" class="col-xs-12 col-md-6 move">
            <q-context-menu>
              <q-list link>
                <q-item @click.native="openEdit(field, indexLevel, indexField, false)" v-close-overlay>
                  <q-item-side icon="border_color" color="info" />
                  <q-item-main label="Editar" />
                </q-item>
                <q-item @click.native="delField(indexLevel, indexField)" v-close-overlay>
                  <q-item-side icon="delete_forever" color="negative" />
                  <q-item-main label="Borrar" />
                </q-item>
              </q-list>
            </q-context-menu>
            <component :is="field.type" :config="level.fields[indexField]"  />
          </div>
        </draggable>
      </div>
    </div>
    <modal-fields @updateFields="closeEdit" @abortEdit="abortEdit" :data="dataForm" />
    <floating-button />
  </div>
</template>

<script>
import InputCheckbox from 'components/Form/formComponents/InputCheckbox'
import InputColor from 'components/Form/formComponents/InputColor'
import InputDate from 'components/Form/formComponents/InputDate'
import InputDateTime from 'components/Form/formComponents/InputDateTime'
import InputRadio from 'components/Form/formComponents/InputRadio'
import InputSelect from 'components/Form/formComponents/InputSelect'
import InputText from 'components/Form/formComponents/InputText'
import InputTextarea from 'components/Form/formComponents/InputTextarea'
import InputNumber from 'components/Form/formComponents/InputNumber'
import InputTime from 'components/Form/formComponents/InputTime'
import ModalFields from 'components/Form/ModalFields'
import Levels from 'components/Form/modalComponents/Levels'
import FloatingButton from 'components/Form/FloatingButton'
import draggable from 'vuedraggable'
import icons from '../../assets/icons.json'

export default {
  name: 'MainForm',
  components: {
    draggable,
    ModalFields,
    Levels,
    FloatingButton,
    InputCheckbox,
    InputColor,
    InputDate,
    InputDateTime,
    InputRadio,
    InputSelect,
    InputText,
    InputTextarea,
    InputNumber,
    InputTime
  },
  data () {
    return {
      listIcons: icons,
      formId: this.$route.params.id ? this.$route.params.id : null,
      dataForm: {
        label: null,
        icon: 'description',
        description: null,
        access: 'private',
        color: null,
        scaling: false,
        fields: []
      }
    }
  },
  created () {
    if (this.formId !== null) this.getForm()
    else if (this.$q.localStorage.has('dataForm')) {
      this.dataForm = Object.assign({}, this.$q.localStorage.get.item('dataForm'))
      this.$root.$emit('refreshFields', this.dataForm)
    }
  },
  methods: {
    getForm () {
      this.$axios.get(`forms/manage/${this.formId}/`).then(response => {
        this.dataForm = Object.assign({}, response.data)
        this.$root.$emit('initLevels', this.dataForm)
        this.$root.$emit('refreshFields', this.dataForm)
        this.$emit('labelTitle', this.dataForm.label)
      }).catch({})
    },
    onAdd (evt) {
      let indexLevel = parseInt(evt.target.id)
      this.openEdit(this.dataForm.fields[indexLevel].fields[evt.newIndex], indexLevel, evt.newIndex, true)
    },
    delField (indexLevel, indexField) {
      this.dataForm.fields[indexLevel].fields.splice(indexField, 1)
      this.$root.$emit('refreshFields', this.dataForm)
    },
    updateScaling (data) {
      this.dataForm.scaling = data
    },
    updateLevels (data) {
      this.dataForm.fields = data.slice()
    },
    openEdit (field, indexLevel, indexField, create) {
      this.$root.$emit('openModalFields', {
        f: Object.assign({}, field),
        iF: indexField,
        iL: indexLevel,
        create: create
      })
    },
    abortEdit (data) {
      this.dataForm.fields[data.iL].fields.splice(data.iF, 1)
    },
    closeEdit (data) {
      this.$set(this.dataForm.fields[data.iL].fields, data.iF, data.f)
      this.$root.$emit('refreshFields', this.dataForm)
    },
    manage (type) { // Función para guardar y editar
      this.$validator.validate().then(result => {
        if (result) {
          for (var i in this.dataForm.fields) {
            if (this.dataForm.scaling === true && this.dataForm.fields[i].fields.length === 0) {
              this.$messages('negative', 'No se permiten niveles vacíos')
              return false
            } else if (this.dataForm.scaling === false && this.dataForm.fields[i].fields.length === 0) {
              this.$messages('negative', 'Se debe ingresar por lo menos un campo al formulario')
              return false
            }
          }
          let axios = null
          if (type === 'save') axios = this.$axios.post('forms/manage/', this.dataForm)
          else axios = this.$axios.put(`forms/manage/${this.formId}/`, this.dataForm)
          axios.then(response => {
            let message = type === 'save' ? 'Formulario creado exitosamente' : 'Formulario actualizado exitosamente'
            this.$messages('info', message)
            this.$q.localStorage.remove('dataForm')
            this.$router.push('/home/forms/')
          }).catch(error => {
            if (error.response.status === 400) {
              if (error.response.data.hasOwnProperty('label')) this.$errorVeeValidate('label', error.response.data.label)
              else if (error.response.data.hasOwnProperty('access')) this.$errorVeeValidate('access', error.response.data.access)
            }
          })
        }
      })
    },
    classObject (index) {
      let classes = {
        emptyFields: true,
        'col-12 flex-center text-grey': true,
        'row q-mb-xl': true
      }
      if (this.dataForm.fields[index].fields.length > 0) {
        classes.emptyFields = false
        classes['col-12 flex-center text-grey'] = false
      }
      return classes
    }
  },
  watch: {
    dataForm: {
      handler: function () {
        this.$q.localStorage.set('dataForm', this.dataForm)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
  .move {
    cursor: move;
  }
  .move:active .ghostClass {
    color: red;
    opacity: .6;
  }
  .dragClass {
    filter: blur(1px);
  }
  .emptyFields {
    border: 2px dashed grey;
    min-height: 150px;
  }
  .emptyFields:before{
    position: absolute;
    content: 'Arrastra aquí algún elemento'
  }
</style>
