// billing.types.ts
export type PlanId = 'free' | 'pro' | 'enterprise';

export interface Plan {
  name: string;
  price: number;
  limit: number;
  features: string[];
}

export function isPlanId(key: string): key is PlanId {
  return key === 'free' || key === 'pro' || key === 'enterprise';
}
