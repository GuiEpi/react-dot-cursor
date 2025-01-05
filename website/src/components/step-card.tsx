export const StepCard: React.FC<{ step: number; description: string; code?: string }> = ({
  step,
  description,
  code,
}) => (
  <div className="flex flex-col items-center p-4 border rounded-lg min-h-[140px] min-w-[300px] justify-between">
    <div className="relative flex items-center justify-center w-10 h-10 text-xl font-semibold tracking-tight mb-2 bg-rose-500 rounded-full">
      <span className="relative text-white">{step}</span>
    </div>
    <p className={`text-sm text-muted-foreground mb-2 ${code ? 'flex-grow' : ''}`}>{description}</p>
    {code && (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold flex-grow">
        {code}
      </code>
    )}
  </div>
);
