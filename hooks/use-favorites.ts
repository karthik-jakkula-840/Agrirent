import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const STORAGE_KEY = 'agrirent_local_favorites'

export function getLocalFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addLocalFavorite(id: string) {
  if (typeof window === 'undefined') return
  try {
    const current = getLocalFavorites()
    if (!current.includes(id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]))
    }
  } catch {}
}

export function removeLocalFavorite(id: string) {
  if (typeof window === 'undefined') return
  try {
    const current = getLocalFavorites()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((item) => item !== id)))
  } catch {}
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const localIds = getLocalFavorites()
      let serverData: any[] = []

      try {
        const res = await fetch('/api/favorites')
        if (res.ok) {
          const json = await res.json()
          serverData = json.data || []
        }
      } catch (err) {
        // Network or fetch error, graceful fallback to local
      }

      // Merge local favorites into serverData if not already present
      const combined = [...serverData]
      localIds.forEach((id) => {
        if (!combined.some((item) => item.equipment_id === id)) {
          combined.push({
            id: `local-${id}`,
            equipment_id: id,
            is_local: true,
          })
        }
      })

      return combined
    },
    staleTime: 1000 * 30, // 30s fresh
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      equipmentId,
      isFavorited,
    }: {
      equipmentId: string
      isFavorited: boolean // true = currently favorited (action: remove), false = not favorited (action: add)
    }) => {
      const method = isFavorited ? 'DELETE' : 'POST'
      const url = isFavorited ? `/api/favorites/${equipmentId}` : `/api/favorites`

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          ...(method === 'POST' ? { body: JSON.stringify({ equipment_id: equipmentId }) } : {}),
        })

        if (!res.ok) {
          // If unauthorized, gracefully persist in localStorage
          if (res.status === 401) {
            if (isFavorited) {
              removeLocalFavorite(equipmentId)
            } else {
              addLocalFavorite(equipmentId)
            }
            return { guest: true, favorited: !isFavorited }
          }
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error?.message || 'Failed to update favorites')
        }

        if (isFavorited) {
          removeLocalFavorite(equipmentId)
        } else {
          addLocalFavorite(equipmentId)
        }

        return res.json()
      } catch (err: any) {
        // If network issue or mock ID, ensure local storage reflects user's action
        if (isFavorited) {
          removeLocalFavorite(equipmentId)
        } else {
          addLocalFavorite(equipmentId)
        }
        return { offline: true, favorited: !isFavorited }
      }
    },
    onMutate: async ({ equipmentId, isFavorited }) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const previousFavorites = queryClient.getQueryData<any[]>(['favorites']) || []

      // Optimistic update
      if (isFavorited) {
        removeLocalFavorite(equipmentId)
        queryClient.setQueryData<any[]>(['favorites'], (old = []) =>
          old.filter((fav) => fav.equipment_id !== equipmentId)
        )
      } else {
        addLocalFavorite(equipmentId)
        queryClient.setQueryData<any[]>(['favorites'], (old = []) => [
          ...old,
          { id: `temp-${equipmentId}`, equipment_id: equipmentId },
        ])
      }

      return { previousFavorites }
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites)
      }
      toast.error('Failed to update favorites')
    },
    onSuccess: (data, variables) => {
      if (variables.isFavorited) {
        toast.success('Removed from favorites')
      } else {
        if (data?.guest) {
          toast.success('Saved to your favorites!', {
            description: 'Log in anytime to sync your favorites across devices.',
          })
        } else {
          toast.success('Added to favorites!')
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}
