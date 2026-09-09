<script setup lang="ts">
import { useStats } from '@/composables/useStats.ts'

const model = defineModel<boolean>({ required: true })

const { stats, winRate, bestCount } = useStats()
</script>

<template>
  <v-dialog
    v-model="model"
    max-width="30rem"
    scrollable
  >
    <v-card :title="$t('stats.title')">
      <v-card-text>
        <div
          v-if="stats.played === 0"
          class="text-medium-emphasis"
        >
          {{ $t('stats.empty') }}
        </div>

        <template v-else>
          <div class="figures mb-6">
            <div>
              <div class="text-h5">
                {{ stats.played }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ $t('stats.played') }}
              </div>
            </div>
            <div>
              <div class="text-h5">
                {{ winRate }}%
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ $t('stats.winRate') }}
              </div>
            </div>
            <div>
              <div class="text-h5">
                {{ stats.currentStreak }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ $t('stats.currentStreak') }}
              </div>
            </div>
            <div>
              <div class="text-h5">
                {{ stats.maxStreak }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ $t('stats.maxStreak') }}
              </div>
            </div>
          </div>

          <h3 class="text-subtitle-2 mb-2">
            {{ $t('stats.distribution') }}
          </h3>
          <!-- A plain bar per row: the value is written on the bar, so the shape
               is a convenience and never the only way to read the number. -->
          <div class="distribution">
            <template
              v-for="(count, i) in stats.distribution"
              :key="i"
            >
              <span class="text-caption">{{ i + 1 }}</span>
              <div class="distribution-track">
                <div
                  class="distribution-bar bg-primary"
                  :style="{ width: `${Math.max(count / bestCount * 100, count ? 8 : 0)}%` }"
                >
                  <span
                    v-if="count"
                    class="text-caption px-2"
                  >{{ count }}</span>
                </div>
                <span
                  v-if="!count"
                  class="text-caption text-medium-emphasis px-1"
                >0</span>
              </div>
            </template>
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="model = false">
          {{ $t('result.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.figures {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  text-align: center;
}

.distribution {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 8px;
  align-items: center;
}

.distribution-track {
  display: flex;
  align-items: center;
}

.distribution-bar {
  border-radius: 3px;
  min-height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
