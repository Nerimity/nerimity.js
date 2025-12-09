import { Client } from "../classes/Client";
import { request } from "./MessageService";
import { ServiceEndpoints } from "./serviceEndpoints";

export async function banServerMember(
  client: Client,
  serverId: string,
  userId: string,
  reason?: string
) {
  return await request<any>({
    client: client,
    url: ServiceEndpoints.serverMemberBan(serverId, userId),
    method: "POST",
    useToken: true,
    body: { reason },
  }).catch((err) => {
    throw new Error(`Failed to ban server member. ${err.message}`);
  });
}

export async function unbanServerMember(
  client: Client,
  serverId: string,
  userId: string
) {
  return await request<any>({
    client: client,
    url: ServiceEndpoints.serverMemberBan(serverId, userId),
    method: "DELETE",
    useToken: true,
  }).catch((err) => {
    throw new Error(`Failed to unban server member. ${err.message}`);
  });
}
export async function kickServerMember(
  client: Client,
  serverId: string,
  userId: string
) {
  return await request<any>({
    client: client,
    url: ServiceEndpoints.serverMemberKick(serverId, userId),
    method: "DELETE",
    useToken: true,
  }).catch((err) => {
    throw new Error(`Failed to kick server member. ${err.message}`);
  });
}
