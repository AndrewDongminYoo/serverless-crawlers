import { APIGatewayEvent, Context } from 'aws-lambda';
import exploreRocketPunch from './rocket.main';
import exploreWantedAPI from './wanted.main';

export async function run(event?: APIGatewayEvent, context?: Context) {
    const time = new Date()
    event && console.info("EVENT\n" + JSON.stringify(event, null, 2))
    context && console.info("CONTEXT\n" + JSON.stringify(context, null, 2))
    context && console.info(`Your cron function "${context.functionName}" ran at ${time}`)
    await exploreWantedAPI()
    await new Promise(resolve => setTimeout(resolve, 10000))
    await exploreRocketPunch()
}