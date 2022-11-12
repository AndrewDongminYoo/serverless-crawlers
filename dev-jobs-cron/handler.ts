'use strict'
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';
import { exploreRocketPunch, iterateJobJSON } from './rocket.main';
import { exploreWantedAPI } from './wanted.main';

export async function run(
    event?: APIGatewayEvent, context?: Context, callback?: APIGatewayProxyCallback
) {
    const time = new Date()
    event && console.info("EVENT\n" + JSON.stringify(event, null, 2))
    context && console.info("CONTEXT\n" + JSON.stringify(context, null, 2))
    context && console.info(`Your cron function "${context.functionName}" ran at ${time}`)
    await exploreWantedAPI()
    await exploreRocketPunch()
        .catch(()=>{
            iterateJobJSON()
        })
}
