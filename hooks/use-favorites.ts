import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites')
      if (!res.ok) throw new Error('Failed to fetch favorites')
      const json = await res.json()
      return json.data
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ equipmentId, isFavorited }: { equipmentId: string, isFavorited: boolean }) => {
      const method = isFavorited ? 'DELETE' : 'POST'
      const url = isFavorited ? `/api/favorites/${equipmentId}` : `/api/favorites`
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(method === 'POST' ? { body: JSON.stringify({ equipment_id: equipmentId }) } : {})
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || 'Failed to toggle favorite')
      }
      return res.json()
    },
    onMutate: async ({ equipmentId, isFavorited }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      await queryClient.cancelQueries({ queryKey: ['equipment', equipmentId, 'favorite'] }) // For single check
      
      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(['favorites'])

      // Optimistically update to the new value (not strictly implemented globally here, but can be managed per component)
      
      return { previousFavorites }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['favorites'], context?.previousFavorites)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      // queryClient.invalidateQueries({ queryKey: ['equipment'] }) // Only if equipment list includes favorited info
    },
  })
}
