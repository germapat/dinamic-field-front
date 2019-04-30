<template>
  <div id="listform">
    <div class="bg-form"></div>
    <div class="row">
      <div class="q-table-title-br col-md-6">
        <div>
          <q-breadcrumbs-el :label="'Estadísticas ' + form" />
        </div>
        <div class="btn-actions btn-new-ac">
          <q-btn color="tigouner" icon="reply" to="/home/forms/">
            <q-tooltip anchor="bottom middle" self="top middle">
              Volver
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <div class="row justify-around" v-if="charts.length > 0" >
      <div v-for="(chart, indexChart) in charts" :key="indexChart" id="chart" class="col-md-4">
        <apexchart type="donut" width="350" :options="chart.chartOptions" :series="chart.data" />
      </div>
    </div>
    <p v-else class="q-title text-center text-secondary q-mt-md">No hay campos de opción para realizar el análisis</p>
  </div>
</template>
<script>
import VueApexCharts from 'vue-apexcharts'
export default {
  name: 'ChartsForm',
  data () {
    return {
      charts: [],
      form: null
    }
  },
  created () {
    this.$axios.get(`forms/data/charts/${this.$route['params'].id}`).then(response => {
      this.form = response.data.form
      this.charts = response.data.charts.slice()
      for (var i in this.charts) {
        if (this.charts[i].chartOptions.labels.length === 0) {
          this.charts[i].chartOptions.labels.push('No hay datos')
          this.charts[i].data.push(100)
        }
      }
    }).catch({})
  },
  components: {
    apexchart: VueApexCharts
  }
}
</script>
<style scoped>
</style>
