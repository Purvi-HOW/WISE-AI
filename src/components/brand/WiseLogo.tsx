import React from 'react';
import markUrl from '../../assets/how-mark.webp';
import wordmarkUrl from '../../assets/how-wordmark.webp';

interface WiseMarkProps {
  /** Sets the height; width follows the artwork's aspect ratio. */
  className?: string;
  title?: string;
}

/** The House of Wise cube, straight from the brand artwork. */
export const WiseMark: React.FC<WiseMarkProps> = ({ className = 'h-8', title }) => (
  <img
    src={markUrl}
    alt={title || ''}
    aria-hidden={title ? undefined : true}
    draggable={false}
    className={`${className} w-auto select-none`}
  />
);

interface WiseWordmarkProps {
  className?: string;
  title?: string;
}

/** The "HOUSE OF WISE" lettering. Ships white, so opacity sets its weight. */
export const WiseWordmark: React.FC<WiseWordmarkProps> = ({ className = 'h-3', title }) => (
  <img
    src={wordmarkUrl}
    alt={title || ''}
    aria-hidden={title ? undefined : true}
    draggable={false}
    className={`${className} w-auto select-none`}
  />
);

interface WiseLockupProps {
  /** 'sm' for chrome, 'lg' for the empty state. */
  size?: 'sm' | 'lg';
  /** Show the House of Wise endorsement beneath the product name. */
  endorsed?: boolean;
  className?: string;
}

/** Mark plus the Wise AI name, with the House of Wise endorsement beneath it. */
export const WiseLockup: React.FC<WiseLockupProps> = ({ size = 'sm', endorsed = true, className = '' }) => {
  const large = size === 'lg';

  return (
    <div className={`flex items-center shrink-0 ${large ? 'gap-4' : 'gap-3'} ${className}`}>
      <span className={large ? 'wise-mark-glow-lg' : 'wise-mark-glow'}>
        <WiseMark className={large ? 'h-14' : 'h-9'} title="House of Wise" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-semibold tracking-tight text-ink ${
            large ? 'text-3xl' : 'text-[15px]'
          }`}
        >
          Wise AI
        </span>
        {endorsed && (
          <WiseWordmark className={large ? 'h-3 mt-2.5 opacity-55' : 'h-[7px] mt-2 opacity-45'} />
        )}
      </span>
    </div>
  );
};
