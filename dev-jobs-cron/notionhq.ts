import {
    Client,
    APIResponseError,
    RequestTimeoutError,
    UnknownHTTPResponseError
} from "@notionhq/client";
import dotenv from "dotenv";
import { PageStats } from "./notion_page.types";

dotenv.config();
const database_id = process.env.NOTION_DATABASE_ID ?? ''
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

export async function writeNotion(properties: PageStats) {
    notion.databases.query({
        database_id,
        filter: {
            or: [{
                type: 'title',
                title: {
                    equals: properties.아이디.title[0].text.content
                },
                property: '아이디',
            },]
        }
    }).then((res)=>{
        const { results } = res
        if (!results.length) {
            notion.pages.create({
                parent: { database_id },
                properties: properties as Record<keyof PageStats, any>,
            }).catch((err) => {
                if (err instanceof RequestTimeoutError) {
                    console.error("RequestTimeoutError")
                }
                if (err instanceof UnknownHTTPResponseError) {
                    console.error("UnknownHTTPResponseError")
                }
                if (err instanceof APIResponseError) {
                    console.error(properties)
                }
            })
        } else {
            console.log(results[0]['url'])
        }
    })
    .catch((err)=>console.error(err))

}
