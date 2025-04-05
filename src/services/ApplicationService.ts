import { RawBotCommand } from "../RawData";
import { ServiceEndpoints } from "./serviceEndpoints";

export async function updateCommands(
  token: string,
  commands: Omit<RawBotCommand, "botUserId">[]
) {
  return await fetch(ServiceEndpoints.BotCommands(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ commands }),
  }).then((res) => res.json());
}
