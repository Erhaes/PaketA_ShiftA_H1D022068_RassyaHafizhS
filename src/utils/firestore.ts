// src/utils/firestore.ts
import { db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';

// interface data
export interface Balapan {
    id?: string;
    nama: string;
    deskripsi: string;
    jadwal: string;
    lintasan: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// operasi CRUD
export const firestoreService = {
    // get collection ref
    getBalapRef() {
        return collection(db, 'balapan');
    },

		// create
    async addBalapan(balap: Omit<Balapan, 'id'>) {
        try {
            const balapRef = this.getBalapRef();
            const docRef = await addDoc(balapRef, {
                ...balap,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Tambah balapan gagal:', error);
            throw error;
        }
    },

		// read
    async getBalap(): Promise<Balapan[]> {
        try {
            const balapRef = this.getBalapRef();
            const q = query(balapRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as Balapan));
        } catch (error) {
            console.error('Tidak dapat menampilkan balapan:', error);
            throw error;
        }
    },

		// update
    async updateBalap(id: string, todo: Partial<Balapan>) {
        try {
            const balapRef = this.getBalapRef();
            const docRef = doc(balapRef, id);
            await updateDoc(docRef, {
                ...todo,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Update Balapan gagal:', error);
            throw error;
        }
    },

		// delete
    async deleteBalap(id: string) {
        try {
            const balapRef = this.getBalapRef();
            const docRef = doc(balapRef, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Hapus Balapan gagal:', error);
            throw error;
        }
    },

}