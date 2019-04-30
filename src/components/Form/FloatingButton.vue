<template>
  <q-page-sticky position="bottom-right" :offset="[18, 30]" style="z-index: 999;">
    <q-tooltip anchor="center left" self="center right">Agregar campos al formulario</q-tooltip>
    <q-btn round icon="apps" color="tigouner" size="lg">
      <q-popover class="row"  style="width: 300px">
        <q-list class="col-12">
          <draggable :list="propsElementsMethod()" :options="{
              group: {
                name: 'elementsList',
                pull: 'clone',
                put: false
              },
              sort: false
            }">
            <q-item class="move" link v-for="(element, indexKey) in propsElementsMethod()" :key="indexKey" style="min-width: 200px">
              <q-item v-if="element.type === 'InputText'" class="move">
                <q-item-side icon="title" />
                <q-item-main label="Texto" />
              </q-item>
              <q-item v-if="element.type === 'InputTextarea'" class="move">
                <q-item-side icon="description" />
                <q-item-main label="Parrafo" />
              </q-item>
              <q-item v-if="element.type === 'InputNumber'" class="move">
                <q-item-side icon="exposure" />
                <q-item-main label="Número" />
              </q-item>
              <q-item v-else-if="element.type === 'InputSelect'" class="move">
                <q-item-side icon="toc" />
                <q-item-main label="Desplegable" />
              </q-item>
              <q-item v-else-if="element.type === 'InputCheckbox'" class="move">
                <q-item-side icon="check_box" />
                <q-item-main label="Casilla de selección" />
              </q-item>
              <q-item v-else-if="element.type === 'InputRadio'" class="move">
                <q-item-side icon="radio_button_checked" />
                <q-item-main label="Selección unica" />
              </q-item>
              <q-item v-else-if="element.type === 'InputDate'" class="move">
                <q-item-side icon="calendar_today" />
                <q-item-main label="Fecha" />
              </q-item>
              <q-item v-else-if="element.type === 'InputDateTime'" class="move">
                <q-item-side icon="event_note" />
                <q-item-main label="Fecha y Hora" />
              </q-item>
              <q-item v-else-if="element.type === 'InputTime'" class="move">
                <q-item-side icon="query_builder" />
                <q-item-main label="Hora" />
              </q-item>
              <q-item v-else-if="element.type === 'InputColor'" class="move">
                <q-item-side icon="color_lens" />
                <q-item-main label="Color" />
              </q-item>
            </q-item>
          </draggable>
        </q-list>
      </q-popover>
    </q-btn>
  </q-page-sticky>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  name: 'FloatingButton',
  components: { draggable },
  data () {
    return {
      propsElements: [
        {
          icon: null,
          helper: null,
          label: null,
          name: null,
          id: null,
          validators: {},
          defaultValue: null,
          dependent: [],
          visible: true,
          plus_functions: null,
          disable: null
        },
        {
          fields: [
            {
              type: 'InputText',
              prefix: null,
              suffix: null
            },
            {
              type: 'InputTextarea',
              prefix: null,
              suffix: null
            },
            {
              type: 'InputNumber',
              prefix: null,
              suffix: null
            },
            {
              type: 'InputSelect',
              options: []
            },
            {
              type: 'InputCheckbox',
              options: []
            },
            {
              type: 'InputRadio',
              options: []
            },
            {
              type: 'InputDate'
            },
            {
              type: 'InputDateTime'
            },
            {
              type: 'InputTime'
            },
            {
              type: 'InputColor'
            }
          ]
        }
      ]
    }
  },
  methods: {
    propsElementsMethod () {
      let array = []
      for (var i in this.propsElements[1].fields) {
        array.push(Object.assign({}, this.propsElements[0], this.propsElements[1].fields[i]))
      }
      return array
    }
  }
}
</script>

<style scoped>
  .move {
    cursor: move;
  }
  .move:active {
    opacity: .6;
  }
</style>
