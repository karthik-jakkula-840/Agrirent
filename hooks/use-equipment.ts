import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EquipmentFormValues } from '@/lib/validations/equipment'

export function useEquipment(filters: Record<string, string | number>) {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
      const res = await fetch(`/api/equipment?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch equipment')
      const json = await res.json()
      return json.data
    },
  })
}

export function useEquipmentDetails(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const res = await fetch(`/api/equipment/${id}`)
      if (!res.ok) throw new Error('Failed to fetch equipment details')
      const json = await res.json()
      return json.data
    },
    enabled: !!id,
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: EquipmentFormValues & { imageUrls: string[] }) => {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || 'Failed to create equipment')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    }
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<EquipmentFormValues & { imageUrls: string[] }> }) => {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || 'Failed to update equipment')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] })
    }
  })
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete equipment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    }
  })
}
