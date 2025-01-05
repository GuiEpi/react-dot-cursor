import { Check } from 'lucide-react';

export const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <p className="flex items-center">
    <Check size="12" className="mr-2" />
    {text}
  </p>
);
