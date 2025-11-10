export const RolePermissions = {
  ADMIN: 1,
  SEND_MESSAGE: 2,
  MANAGE_ROLES: 4,
  MANAGE_CHANNELS: 8,
  KICK: 16,
  BAN: 32,
  MENTION_EVERYONE: 64,
  NICKNAME_MEMBER: 128,
  MENTION_ROLES: 256,
} as const;

export type AvailablePermissions =
  (typeof RolePermissions)[keyof typeof RolePermissions];

export const hasBit = (permissions: number, bit: number) => {
  return (permissions & bit) === bit;
};

export const addBit = (permissions: number, bit: number) => {
  return permissions | bit;
};
export const removeBit = (permissions: number, bit: number) => {
  return permissions & ~bit;
};
