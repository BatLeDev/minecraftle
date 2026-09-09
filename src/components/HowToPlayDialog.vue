<script setup lang="ts">
import McButton from './McButton.vue'
import McDialog from './McDialog.vue'
import { useI18n } from 'vue-i18n'

const model = defineModel<boolean>({ required: true })
const { t } = useI18n()

const legend = [
  { css: 'slot--correct', key: 'correct' },
  { css: 'slot--misplaced', key: 'misplaced' },
  { css: 'slot--absent', key: 'absent' }
] as const
</script>

<template>
  <McDialog
    v-model="model"
    :title="t('howTo.title')"
  >
    <p>{{ $t('howTo.intro') }}</p>
    <ol>
      <li>{{ $t('howTo.step1') }}</li>
      <li>{{ $t('howTo.step2') }}</li>
      <li>{{ $t('howTo.step3') }}</li>
    </ol>

    <dl class="legend">
      <template
        v-for="entry in legend"
        :key="entry.key"
      >
        <dt>
          <span
            class="swatch"
            :class="entry.css"
          />
        </dt>
        <dd>{{ $t(`howTo.${entry.key}`) }}</dd>
      </template>
    </dl>

    <p>{{ $t('howTo.shapeNote') }}</p>
    <p>{{ $t('howTo.keyboard') }}</p>

    <div class="actions">
      <McButton @click="model = false">
        {{ $t('result.close') }}
      </McButton>
    </div>
  </McDialog>
</template>

<style scoped>
ol {
  padding-left: 1.25rem;
  margin: 0 0 0.75rem;
}

.legend {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 0.6rem;
  align-items: center;
  margin: 0 0 0.75rem;
}

.legend dd {
  margin: 0;
}

.swatch {
  display: block;
  width: 1.4rem;
  height: 1.4rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
