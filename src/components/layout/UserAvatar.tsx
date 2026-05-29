import type { ResponsavelUser } from "@/types";

interface UserAvatarProps {
  user: ResponsavelUser;
  size?: number;
  showTooltip?: boolean;
  className?: string;
}

export function UserAvatar({ user, size = 32, showTooltip = true, className = "" }: UserAvatarProps) {
  return (
    <div
      className={`UA-avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${user.color}cc, ${user.color}88)`,
        borderColor: `${user.color}55`,
      }}
      title={showTooltip ? `${user.name} · ${user.role}` : undefined}
    >
      {user.initials}
    </div>
  );
}

interface UserChipProps {
  user: ResponsavelUser;
}

export function UserChip({ user }: UserChipProps) {
  return (
    <div className="UA-chip">
      <UserAvatar user={user} size={24} showTooltip={false} />
      <div className="UA-chip-info">
        <span className="UA-chip-name">{user.name}</span>
        <span className="UA-chip-role">{user.role}</span>
      </div>
    </div>
  );
}
