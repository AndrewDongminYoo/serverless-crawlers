import { APIGatewayEvent, Context } from "aws-lambda";
import exploreRocketPunch from "./rocket.main";
import exploreWantedAPI from "./wanted.main";

export async function run(event?: APIGatewayEvent, context?: Context) {
  const time = new Date();
  event &&
    console.debug("🚀file:handler.ts:7\n" + JSON.stringify(event, null, 2));
  context &&
    console.debug("🚀file:handler.ts:8\n" + JSON.stringify(context, null, 2));
  context && console.debug(`🚀 '${context.functionName}' ran at ${time}`);
  await exploreWantedAPI();
  await new Promise((_) => setTimeout(_, 10000));
  await exploreRocketPunch();
}
