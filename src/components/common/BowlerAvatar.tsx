import { cn } from '@/lib/utils';
import type { Bowler } from '@/types';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const sizeConfig: Record<AvatarSize, { container: string; text: string; border: string }> = {
  xs: { container: 'h-3 w-3', text: 'text-[0px]', border: 'border' },
  sm: { container: 'h-8 w-8', text: 'text-sm', border: 'border-2' },
  md: { container: 'h-10 w-10', text: 'text-base', border: 'border-2' },
  lg: { container: 'h-12 w-12', text: 'text-xl', border: 'border-[3px]' },
};

interface BowlerAvatarProps {
  bowler: Pick<Bowler, 'name' | 'avatarColor' | 'profilePictureUrl'>;
  size?: AvatarSize;
  className?: string;
}

export function BowlerAvatar({ bowler, size = 'md', className }: BowlerAvatarProps) {
  const config = sizeConfig[size];
  const hasImage = !!bowler.profilePictureUrl;

  if (size === 'xs') {
    return (
      <div
        className={cn('rounded-full flex-shrink-0', config.container, className)}
        style={{ backgroundColor: bowler.avatarColor }}
      />
    );
  }

  if (hasImage) {
    return (
      <div
        className={cn(
          'rounded-full flex-shrink-0 overflow-hidden',
          config.container,
          config.border,
          className,
        )}
        style={{ borderColor: bowler.avatarColor }}
      >
        <img
          src={bowler.profilePictureUrl}
          alt={bowler.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold',
        config.container,
        config.text,
        className,
      )}
      style={{ backgroundColor: bowler.avatarColor }}
    >
      {bowler.name.charAt(0)}
    </div>
  );
}
