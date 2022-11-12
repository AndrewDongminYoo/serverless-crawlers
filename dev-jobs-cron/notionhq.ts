'use strict'
import { Client, NotionClientError } from "@notionhq/client";
import { PageObjectResponse, QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import { PageStats, Platform } from "./notion.types";
import { delay } from "./notion.utils";

dotenv.config()

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

export async function writeNotion(properties: PageStats, platform: Platform) {
    await delay(400)
    const database_id = (
        platform === '원티드'
            ? process.env.WANTED_NOTION_DB
            : process.env.ROCKET_NOTION_DB
    ) ?? ""
    const equals = properties.아이디.title[0].text.content
    const coverURL = properties.썸네일.files[0].external.url
    await notion.databases.query({
        database_id,
        filter: { or: [{ type: 'title', title: { equals }, property: '아이디' }] }
    }).then(async (res: Partial<QueryDatabaseResponse>) => {
        const { results } = res
        if (results && !results.length) {
            await notion.pages.create({
                parent: { database_id },
                properties: properties as Record<keyof PageStats, any>,
                cover: { external: { url: coverURL } }
            })
                .then((res: Partial<PageObjectResponse>) => console.info(`CREATED: ${res.url}`)
                    , (error: NotionClientError) => {
                        console.error(`CREATE FAILED: "${error.message}"`)
                    })
        } else if (results && results.length) {
            // console.log(JSON.stringify(results[0]["properties"]["URL"], null, 2))
            await notion.pages.update({
                page_id: results[0].id,
                properties: properties as Record<keyof PageStats, any>,
                cover: { external: { url: coverURL } }
            })
                .then((res: Partial<PageObjectResponse>) => console.info(`UPDATED: ${res.url}`)
                    , (error: NotionClientError) => {
                        console.error(`UPDATE FAILED: "${error.message}"`)
                    })
        }
    }, (error: NotionClientError) => {
        console.error(`NOTION FAILED: "${error.message}"`)
    })
}