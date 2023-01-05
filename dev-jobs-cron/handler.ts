import { APIGatewayEvent, Context } from "aws-lambda";
import dns from "node:dns";
import exploreRocketPunch from "./rocket.main";
import exploreWantedAPI from "./wanted.main";

export async function run(event?: APIGatewayEvent, context?: Context) {
    const time = new Date();
    event && console.debug("EVENT\n" + JSON.stringify(event, null, 2));
    context && console.debug("CONTEXT\n" + JSON.stringify(context, null, 2));
    context &&
        console.debug(
            `Your cron function '${context.functionName}' ran at ${time}`
        );
    dns.lookupService("8.8.8.8", 53, async (e, hostname, _) => {
        if (e instanceof Error) {
            console.error("NETWORK IS NOT CONNECTED");
    } else if (hostname.includes("google")) {
        await exploreWantedAPI();
        await new Promise((_) => setTimeout(_, 10000));
        await exploreRocketPunch();
    }
  });
}
