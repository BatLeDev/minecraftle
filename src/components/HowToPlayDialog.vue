<script setup lang="ts">
import { Hint } from '@/utils/types.ts'

const model = defineModel<boolean>({ required: true })

const legend = [
  { hint: Hint.Correct, colour: 'bg-correct', mark: 'slot-mark-correct', key: 'correct', mark_key: 'markCorrect' },
  { hint: Hint.Misplaced, colour: 'bg-misplaced', mark: 'slot-mark-misplaced', key: 'misplaced', mark_key: 'markMisplaced' },
  { hint: Hint.Absent, colour: 'bg-absent', mark: null, key: 'absent', mark_key: null }
] as const
</script>

<template>
  <v-dialog
    v-model="model"
    max-width="34rem"
    scrollable
  >
    <v-card :title="$t('howTo.title')">
      <v-card-text>
        <p class="mb-4">
          {{ $t('howTo.intro') }}
        </p>
        <ol class="mb-4 ps-4">
          <li class="mb-1">
            {{ $t('howTo.step1') }}
          </li>
          <li>{{ $t('howTo.step2') }}</li>
        </ol>

        <dl class="legend mb-4">
          <template
            v-for="entry in legend"
            :key="entry.key"
          >
            <dt>
              <v-sheet
                :class="[entry.colour, entry.mark]"
                width="24"
                height="24"
                rounded="sm"
              />
            </dt>
            <dd>
              {{ $t(`howTo.${entry.key}`) }}
              <span
                v-if="entry.mark_key"
                class="text-medium-emphasis"
              >({{ $t(`a11y.${entry.mark_key}`) }})</span>
            </dd>
          </template>
        </dl>

        <p class="text-medium-emphasis mb-2">
          {{ $t('howTo.shapeNote') }}
        </p>
        <p class="text-medium-emphasis">
          {{ $t('howTo.keyboard') }}
        </p>
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
.legend {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 0.75rem;
  align-items: center;
}

.legend dd {
  margin: 0;
}

.slot-mark-correct,
.slot-mark-misplaced {
  position: relative;
}

.slot-mark-correct::after,
.slot-mark-misplaced::after {
  content: '';
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 7px;
  height: 7px;
  background-color: rgba(0, 0, 0, 0.72);
}

.slot-mark-correct::after {
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

.slot-mark-misplaced::after {
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid rgba(0, 0, 0, 0.72);
}
</style>
