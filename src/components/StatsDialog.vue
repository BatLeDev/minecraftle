<script setup lang="ts">
import McButton from './McButton.vue'
import McDialog from './McDialog.vue'
import { useI18n } from 'vue-i18n'
import { useStats } from '@/composables/useStats.ts'

const model = defineModel<boolean>({ required: true })
const { t } = useI18n()
const { stats, winRate, bestCount } = useStats()
</script>

<template>
  <McDialog
    v-model="model"
    :title="t('stats.title')"
  >
    <p v-if="stats.played === 0">
      {{ $t('stats.empty') }}
    </p>

    <template v-else>
      <dl class="figures">
        <div>
          <dd>{{ stats.played }}</dd>
          <dt>{{ $t('stats.played') }}</dt>
        </div>
        <div>
          <dd>{{ winRate }}%</dd>
          <dt>{{ $t('stats.winRate') }}</dt>
        </div>
        <div>
          <dd>{{ stats.currentStreak }}</dd>
          <dt>{{ $t('stats.currentStreak') }}</dt>
        </div>
        <div>
          <dd>{{ stats.maxStreak }}</dd>
          <dt>{{ $t('stats.maxStreak') }}</dt>
        </div>
      </dl>

      <h3>{{ $t('stats.distribution') }}</h3>
      <!-- The count is written on every row, so the bar is a convenience and
           never the only way to read the number. -->
      <div class="distribution">
        <template
          v-for="(count, i) in stats.distribution"
          :key="i"
        >
          <span>{{ i + 1 }}</span>
          <div class="track">
            <div
              class="bar"
              :style="{ width: `${(count / bestCount) * 100}%` }"
            />
            <span class="count">{{ count }}</span>
          </div>
        </template>
      </div>
    </template>

    <div class="actions">
      <McButton @click="model = false">
        {{ $t('result.close') }}
      </McButton>
    </div>
  </McDialog>
</template>

<style scoped>
.figures {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin: 0 0 1rem;
  text-align: center;
}

.figures dd {
  margin: 0;
  font-size: 1.4rem;
}

.figures dt {
  font-size: 0.7rem;
  opacity: 0.75;
}

h3 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  font-weight: normal;
}

.distribution {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 0.5rem;
  align-items: center;
}

.track {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.bar {
  min-width: 2px;
  height: 1.1rem;
  background: var(--hint-correct);
}

.count {
  font-size: 0.8rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
