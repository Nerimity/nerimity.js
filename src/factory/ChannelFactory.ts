// Import the base class and the subclass for runtime construction

import { Channel } from "../classes/Channel";
import { Client } from "../classes/Client";
import { ServerChannel } from "../classes/ServerChannel";
import { RawChannel } from "../RawData";
import { AllChannel } from "../types";

// Define the function that decides which class to instantiate
export function createChannel(
  client: Client,
  rawChannel: { id: string } & Partial<RawChannel>
): AllChannel {
  const channelData = rawChannel as RawChannel; // Cast once for convenience

  if (channelData.serverId) {
    // Here, ServerChannel is imported as a runtime value and is available
    return new ServerChannel(client, channelData);
  } else {
    return new Channel(client, channelData);
  }
}
