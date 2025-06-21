import React from 'react';
import type { Material } from "@shared/schema";

interface ComparisonDebugProps {
  materials: Material[];
}

export function ComparisonDebug({ materials }: ComparisonDebugProps) {
  return (
    <div className="bg-gray-100 p-4 rounded mt-4">
      <h3 className="font-bold mb-2">Debug: Material Specifications</h3>
      {materials.map((material, index) => (
        <div key={material.id} className="mb-4 p-2 bg-white rounded">
          <h4 className="font-semibold">{material.name}</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(material.specifications, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}