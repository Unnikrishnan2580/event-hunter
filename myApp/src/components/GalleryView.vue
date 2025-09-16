<template>

  <div class="collage">
    <div class="big" @click="openGallery(0)">
      <img
        :src="mainImage"
        :alt="title"
        @error="onImgError"
      />
    </div>
    <div class="small">
      <img
        v-for="(img, i) in sideImages"
        :key="i"
        :src="img?.url || defaultImg"
        :alt="`${title}-thumb-${i}`"
        @click="openGallery(i + 1)"
        @error="onImgError"
      />
    </div>

    <!-- Fullscreen Modal -->
    <ion-modal :is-open="showModal" @didDismiss="closeGallery">
      <ion-content>
        <swiper
          :initial-slide="startIndex"        
          :pagination="{ clickable: true }"
          class="gallery-swiper"
        >
          <swiper-slide v-for="(img, i) in allImages" :key="i">
            <img :src="img.url || defaultImg" class="gallery-img" />
          </swiper-slide>
        </swiper>
      </ion-content>
    </ion-modal>
  </div>

</template>

<script setup lang="ts">
  import 'swiper/css'
  import 'swiper/css/navigation'
  import 'swiper/css/pagination'
  import { ref, computed, PropType } from 'vue'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import { IonModal, IonContent } from '@ionic/vue'

  interface Img { url: string }

  const props = defineProps({
    images: { type: Array as PropType<Img[]>, required: true },
    title: { type: String, default: '' },
    defaultImg: { type: String, default: '/assets/imgs/card-media.png' }
  })

  const mainImage = computed(() => props.images?.[0]?.url || props.defaultImg)
  const sideImages = computed(() => props.images?.slice(1, 4) || [])
  const allImages = computed(() => props.images.length ? props.images : [{ url: props.defaultImg }])
  const showModal = ref(false)
  const startIndex = ref(0)

  /**
   * openGallery
   * * Loads fullscreen Gallery view for images
   * @param index 
   */
  function openGallery(index: number) {
    startIndex.value = index
    showModal.value = true
  }

  /**
   * closeGallery
   * * Method to close the gallery view of images
   */
  function closeGallery() {
    showModal.value = false
  }

  /**
   * onImgError 
   * * Handles Image load error
   * @param e onImgError
   */
  function onImgError(e: Event) {
    (e.target as HTMLImageElement).src = props.defaultImg
  }

</script>

<style scoped>

  .collage {
    display: flex;
    width: 100%;
    gap: 2px;
  }
  
  .collage .big { flex: 2; cursor: pointer; }
  
  .collage .small {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .collage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  .collage .small img { flex: 1; cursor: pointer; }

  .gallery-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }

  .gallery-swiper {
    height: 100%;
  }

</style>
