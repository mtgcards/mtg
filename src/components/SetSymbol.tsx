import { scryfallSetSvgUrl } from '@/lib/constants';

interface SetSymbolProps {
  setCode: string;
  className?: string;
}

export default function SetSymbol({ setCode, className = 'set-symbol' }: SetSymbolProps) {
  if (!setCode) return null;
  return (
    <img
      src={scryfallSetSvgUrl(setCode)}
      alt=""
      className={className}
    />
  );
}
