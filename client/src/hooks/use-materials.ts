import { useQuery } from "@tanstack/react-query";
import type { Material } from "@shared/schema";
import type { MaterialFilters } from "@/lib/types";

export function useMaterials(filters?: MaterialFilters) {
  return useQuery<Material[]>({
    queryKey: ["/api/materials", filters],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMaterial(id: number) {
  return useQuery<Material>({
    queryKey: [`/api/materials/${id}`],
    enabled: !!id,
  });
}
