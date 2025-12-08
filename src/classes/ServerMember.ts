import {
  addBit,
  AvailablePermissions,
  hasBit,
  RolePermissions,
} from "../bitwise";
import { RawServerMember } from "../RawData";
import { banServerMember } from "../services/ServerService";
import { Client } from "./Client";
import { Collection } from "./Collection";
import { Server } from "./Server";
import { User } from "./User";

export class ServerMembers {
  client: Client;
  cache: Collection<string, ServerMember>;
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }
  setCache(rawMember: RawServerMember) {
    const member = new ServerMember(this.client, rawMember);
    this.cache.set(member.user.id, member);
    return member;
  }
}

export class ServerMember {
  client: Client;
  id: string;
  user: User;
  server: Server;
  roleIds: string[];
  nickname?: string | null;

  constructor(client: Client, member: RawServerMember) {
    this.client = client;
    this.id = member.user.id;
    this.roleIds = member.roleIds;
    this.nickname = member.nickname;

    this.user = this.client.users.cache.get(member.user.id)!;
    this.server = this.client.servers.cache.get(member.serverId)!;
  }
  toString() {
    return `[@:${this.id}]`;
  }
  async ban() {
    return banServerMember(this.client, this.server.id, this.user.id);
  }
  get roles() {
    return this.roleIds
      .map((id) => this.server.roles.cache.get(id)!)
      .filter(Boolean);
  }

  permissions(this: ServerMember) {
    const defaultRoleId = this.server?.defaultRoleId;
    const defaultRole = this.server.roles.cache.get(defaultRoleId!);

    let currentPermissions = defaultRole?.permissions || 0;

    const memberRoles = this.roles;
    for (let i = 0; i < memberRoles.length; i++) {
      const role = memberRoles[i];
      currentPermissions = addBit(currentPermissions, role?.permissions || 0);
    }

    return currentPermissions;
  }

  hasPermission(
    permission: AvailablePermissions,
    ignoreAdmin = false,
    ignoreCreator = false
  ) {
    if (!ignoreCreator) {
      if (this.server.createdById === this.user.id) return true;
    }
    if (!ignoreAdmin) {
      if (hasBit(this.permissions(), RolePermissions.ADMIN)) return true;
    }
    return hasBit(this.permissions(), permission);
  }
}
