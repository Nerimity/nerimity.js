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
  });
}
