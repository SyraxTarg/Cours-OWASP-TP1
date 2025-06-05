// src/store/user.ts
import { ref, Ref } from 'vue'
import api from '../services/api'

export interface User {
  id: number
  username: string
  role: string
}

export const user: Ref<User | null> = ref(null)

export async function fetchUser(): Promise<void> {
  try {
    const res = await api.get<User>('/auth/me')
    user.value = res.data
  } catch {
    user.value = null
  }
}

export function setUser(u: User): void {
  user.value = u
}

export function clearUser(): void {
  user.value = null
}
