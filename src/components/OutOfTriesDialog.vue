<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import McButton from './McButton.vue'
import McDialog from './McDialog.vue'

const model = defineModel<boolean>({ required: true })
const emit = defineEmits<{ keepPlaying: []; giveUp: [] }>()

const { t } = useI18n()
</script>

<template>
  <!-- Offered before the answer is revealed: running out of attempts should not
       force a player who wants to keep looking to be told the recipe. -->
  <McDialog
    v-model="model"
    :title="t('outOfTries.title')"
  >
    <p>{{ $t('outOfTries.body') }}</p>
    <p class="note">
      {{ $t('outOfTries.note') }}
    </p>
    <div class="actions">
      <McButton
        data-testid="keep-playing"
        @click="emit('keepPlaying')"
      >
        {{ $t('outOfTries.keepPlaying') }}
      </McButton>
      <McButton
        data-testid="give-up"
        @click="emit('giveUp')"
      >
        {{ $t('outOfTries.giveUp') }}
      </McButton>
    </div>
  </McDialog>
</template>

<style scoped>
.note {
  opacity: 0.75;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions > * {
  flex: 1;
}
</style>
