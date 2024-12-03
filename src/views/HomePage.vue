<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      
      <ion-content :fullscreen="true">
       
        <ion-refresher
          slot="fixed"
          :pull-factor="0.5"
          :pull-min="100"
          :pull-max="200"
          @ionRefresh="handleRefresh($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        
        <!-- bagian refresher -->

        <!-- list balapan -->
        <div class="scrollable-container">
          <ion-list>
            <ion-item-sliding
              v-for="balap in listbalap"
              :key="balap.id"
              :ref="(el) => setItemRef(el, balap.id!)">
              <ion-item-options side="start" @ionSwipe="handleDelete(balap)">
                <ion-item-option
                  color="danger"
                  expandable
                  @click="handleDelete(balap)">
                  <ion-icon
                    slot="icon-only"
                    :icon="trash"
                    size="large"></ion-icon>
                </ion-item-option>
              </ion-item-options>

              <ion-item>
                <ion-card>
                  <ion-card-header>
                    <ion-card-title class="ion-text-wrap limited-text">{{
                      balap.nama
                    }}</ion-card-title>
                    <ion-card-content class="limited-text">{{
                      balap.deskripsi
                    }}</ion-card-content>
                    <ion-card-content  class="limited-text">
                      {{balap.jadwal}}
                    </ion-card-content>
                    <ion-card-content  class="limited-text">
                      {{balap.lintasan}}
                    </ion-card-content>
                  </ion-card-header>

                  <ion-card-content>
                    <ion-badge>{{ getRelativeTime(balap.updatedAt) }}</ion-badge>
                  </ion-card-content>
                </ion-card>
              </ion-item>
            </ion-item-sliding>
            <ion-item v-if="listbalap.length === 0" class="ion-text-center">
              <ion-label>Tidak ada jadwal balapan</ion-label>
            </ion-item>
          </ion-list>
        </div>

       
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button @click="isOpen = true">
            <ion-icon :icon="add" size="large"></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <InputModal
          v-model:isOpen="isOpen"
          v-model:editingId="editingId"
          :balap="balap"
          @submit="handleSubmit" />
      </ion-content>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
//import TabsMenu from "@/components/TabsMenu.vue";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAccordion,
  IonAccordionGroup,
  IonLabel,
  IonList,
  loadingController,
  IonRefresher,
  IonRefresherContent,
  toastController,
} from "@ionic/vue";
import {
  add,
  checkmarkCircle,
  close,
  create,
  trash,
  closeCircle,
  warningOutline,
} from "ionicons/icons";
//import InputModal from "@/components/InputModal.vue";
import { onMounted, ref, computed, onUnmounted } from "vue";
import { firestoreService, type Balapan } from "@/utils/firestore";
// import { formatDistanceToNow } from "date-fns";


const isOpen = ref(false);
const editingId = ref<string | null>(null);
const listbalap = ref<Balapan[]>([]);
const balap = ref<Omit<Balapan, "id" | "createdAt" | "updatedAt">>({
  nama: "",
  deskripsi: "",
  jadwal: " ",
  lintasan: " ",
});

const balapans = computed(() =>
  listbalap.value)
);
const itemRefs = ref<Map<string, HTMLIonItemSlidingElement>>(new Map());
let intervalId: any;
const timeUpdateTrigger = ref(0);

// value item
const setItemRef = (el: any, id: string) => {
  if (el) {
    itemRefs.value.set(id, el.$el);
  }
};

// toast notifikasi
const showToast = async (
  message: string,
  color: string = "success",
  icon: string = checkmarkCircle
) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: "top",
    icon,
  });
  await toast.present();
};


// handle swipe refresher
const handleRefresh = async (event: any) => {
  try {
    await loadBalap(false);
  } catch (error) {
    console.error("Error refreshing:", error);
  } finally {
    event.target.complete();
  }
};

// handle submit add/edit pada modal
const handleSubmit = async (
  balap: Omit<Balapan, "id" | "createdAt" | "updatedAt">
) => {
  if (!balap.nama) {
    await showToast("Masukkan nama balapan", "warning", warningOutline);
    return;
  }
  try {
    if (editingId.value) {
      await firestoreService.updateBalap(editingId.value, balap as Balapan);
      await showToast("Edit Balapan berhasil", "success", checkmarkCircle);
    } else {
      await firestoreService.addBalapan(balap as Balapan);
      await showToast("Balapan berhasil ditambahkan", "success", checkmarkCircle);
    }
    loadBalap();
  } catch (error) {
    await showToast("Error!!!", "danger", closeCircle);
    console.error(error);
  } finally {
    editingId.value = null;
  }
};

// load data
const loadBalap = async (isLoading = true) => {
  let loading;
  if (isLoading) {
    loading = await loadingController.create({
      message: "Loading...",
    });
    await loading.present();
  }

  try {
    listbalap.value = await firestoreService.getBalap();
  } catch (error) {
    console.error(error);
  } finally {
    if (loading) {
      await loading.dismiss();
    }
  }
};

// handle edit click
const handleEdit = async (editBalap: Balapan) => {
  const slidingItem = itemRefs.value.get(editBalap.id!);
  await slidingItem?.close();

  editingId.value = editBalap.id!;
  balap.value = {
    nama: editBalap.nama,
    deskripsi: editBalap.deskripsi,
    jadwal: editBalap.jadwal,
    lintasan: editBalap.lintasan,
  };
  isOpen.value = true;
};

// handle delete click/swipe
const handleDelete = async (deleteBalapan: Balapan) => {
  try {
    await firestoreService.deleteBalap(deleteBalapan.id!);
    await showToast("Balapan berhasil dihapus", "success", checkmarkCircle);
    loadBalap();
  } catch (error) {
    await showToast("Balapan gagal dihapus", "danger", closeCircle);
    console.error(error);
  }
};

// dijalankan setiap halaman diload, load data dan set interval update 1 menit
onMounted(() => {
  loadBalap();
  intervalId = setInterval(() => {
    timeUpdateTrigger.value++;
  }, 60000);
});

// reset interval update
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<!-- modifikasi src/views/HomePage.vue tambahkan keseluruhan style -->
<style scoped>
ion-card,
ion-accordion-group {
  width: 100%;
}

ion-fab {
  margin: 25px;
}

.limited-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

ion-card-title.limited-text {
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

ion-card-subtitle.limited-text {
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.scrollable-container {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.accordion-container {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.scrollable-container::-webkit-scrollbar {
  width: 8px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>