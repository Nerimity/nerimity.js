import { Client } from "../classes/Client";
import { request } from "./MessageService";
import { ServiceEndpoints } from "./serviceEndpoints";

export async function banServerMember(
  client: Client,
  serverId: string,
  userId: string
) {
  return await request<any>({
    client: client,
    url: ServiceEndpoints.serverMemberBan(serverId, userId),
    method: "POST",
    useToken: true,
  }).catch((err) => {
    throw new Error(`Failed to ban server member. ${err.message}`);
  });
}
