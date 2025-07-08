import { Icons } from '@/components/icons';

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center cyber-grid">
      <Icons.logo 
        className="h-24 w-24 text-primary animate-pulse" 
        style={{filter: `drop-shadow(0 0 15px hsl(var(--primary)))`}} 
      />
    </div>
  );
}
