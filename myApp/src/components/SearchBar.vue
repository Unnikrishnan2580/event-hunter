<template>

  <ion-searchbar
    v-model="query"
    :placeholder= "t('common.searchPlaceholder')"
    @ionInput="onInput"
    @ionClear="onClear"
    :debounce="300"
    class="searchbar-class"
  />

</template>

<script setup lang="ts">

  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { IonSearchbar } from '@ionic/vue'

  const { t } = useI18n() // <-- i18n

  const emit = defineEmits<{
    (e: 'search', keyword: string): void
  }>()

  const query = ref('')
  let timer: number | undefined

  /**
   * onInput
   * Function to trigger search once the search bar input is entered
   */
  function onInput() {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      emit('search', query.value.trim())
    }, 300) // 300 ms debounce
  }

  /**
   * onClear
   * Function to reset search once the search bar input is cleared
   */
  function onClear() {
    query.value = ''       // reset input
  }

</script>
<style scoped>

  /* Pill shape styling */
  .searchbar-class {
    --background: var(--ion-color-light, #fff);
    --border-radius: 9999px;          /* makes it fully rounded */
    --box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    --padding: 12px;
    margin: 8px 0px;
  }

</style>