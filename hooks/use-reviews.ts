import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useReviews(equipmentId: string) {
  return useQuery({
    queryKey: ['reviews', equipmentId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${equipmentId}`)
      if (!res.ok) throw new Error('Failed to fetch reviews')
      const json = await res.json()
      return json.data
    },
    enabled: !!equipmentId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { equipment_id: string, rating: number, comment: string }) => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || 'Failed to create review')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.equipment_id] })
    }
  })
}
