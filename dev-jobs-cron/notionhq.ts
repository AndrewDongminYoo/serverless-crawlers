'use strict'
import { Client, NotionClientError } from "@notionhq/client";
import { PageObjectResponse, QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import { PageStats, Platform, 회사명 } from "./notion.types";
import { delay } from "./notion.utils";

dotenv.config()

const notion = new Client({
    auth: process.env['NOTION_TOKEN'],
})

async function writeNotion(properties: PageStats, platform: Platform) {
    await delay(400)
    const database_id = (
        platform === '원티드'
            ? process.env['WANTED_NOTION_DB']
            : process.env['ROCKET_NOTION_DB']
    ) ?? ""
    const equals = properties.아이디.title[0].text.content
    const defaultImage = properties.썸네일.files[0]
    const coverURL = defaultImage.type == 'external' ? defaultImage.external.url : defaultImage.file.url
    await notion.databases.query({
        database_id,
        filter: { or: [{ type: 'title', title: { equals }, property: '아이디' }] }
    }).then(async (res: QueryDatabaseResponse) => {
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

export async function removeOldJobs(platform: Platform) {
    const database_id = (
        platform === '원티드'
            ? process.env['WANTED_NOTION_DB']
            : process.env['ROCKET_NOTION_DB']
    ) ?? ""
    const yesterDay = new Date()
    yesterDay.setDate(yesterDay.getDate()-1)
    notion.databases.query({
        database_id,
        filter: {
            or: [{
                last_edited_time: {
                    before: yesterDay.toISOString(),
                },
                timestamp: "last_edited_time",
                type: "last_edited_time",
            }],
        }, archived: false
    }).then((value: QueryDatabaseResponse)=>{
        const { results } = value
        if (results && results.length === 0) {
            console.log(`No Data is Expired`)
        } else {
            results.forEach((page)=>{
                if ("properties" in page) {
                    const TITLE: 회사명 = page.properties["회사명"] as 회사명
                    console.log(`archived: ${TITLE.title[0].plain_text}`)
                }
                notion.pages.update({
                    page_id: page.id,
                    archived: true,
                })
            })
        }
    }, (reason: NotionClientError)=>{
        console.log(`Notion Client Error: ${reason.message}`)
    })
}


export default writeNotion