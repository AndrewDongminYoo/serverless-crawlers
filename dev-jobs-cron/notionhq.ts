'use strict'
import { Client, NotionClientError } from "@notionhq/client";
import { PageObjectResponse, QueryDatabaseResponse, TextRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import { Prop, PageStats, Platform, RichText } from "./notion.types";
import { delay, isEmpty } from "./notion.utils";
import dotenv from "dotenv";

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
    const coverURL = 'external' in defaultImage ? defaultImage.external.url : defaultImage.file.url
    await notion.databases.query({
        database_id,
        filter: { or: [{ type: 'title', title: { equals }, property: '아이디' }] }
    }).then(async (res: QueryDatabaseResponse) => {
        const results = res.results as Pick<PageObjectResponse, "properties" | "id">[]
        if (isEmpty(results)) {
            await notion.pages.create({
                parent: { database_id },
                properties: properties as Record<Prop, any>,
                cover: { external: { url: coverURL } }
            })
                .then((res: Partial<PageObjectResponse>) => console.info(`CREATED: ${res.url}`)
                    , (error: NotionClientError) => {
                        console.error(`CREATE FAILED: "${error.message}"`)
                    })
        } else if (results && results.length) {
            const props = results[0].properties as Record<Prop, any>
            await notion.pages.update({
                page_id: results[0].id,
                properties: properties as Record<Prop, any>,
                cover: { external: { url: coverURL } },
                archived: false,
            })
                .then((res: Partial<PageObjectResponse>) => console.info(`UPDATED: ${res.url}`)
                    , (error: NotionClientError) => {
                        console.error(`UPDATE FAILED: "${error.message}"`)
                    })
        }
    }, async (error: NotionClientError) => {
        console.error(`NOTION FAILED: "${error.message}"`)
        if (error.code === 'rate_limited') {
            await delay(1000)
        }
    })
}

export async function removeOldJobs(platform: Platform) {
    const database_id = (
        platform === '원티드'
            ? process.env['WANTED_NOTION_DB']
            : process.env['ROCKET_NOTION_DB']
    ) ?? ""
    const yesterDay = new Date()
    yesterDay.setDate(yesterDay.getDate() - 1)
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
    }).then((value: QueryDatabaseResponse) => {
        const results = value.results as Pick<PageObjectResponse, "properties" | "id">[]
        if (isEmpty(results)) {
            console.log(`No Data is Expired`)
        } else if (results && results.length) {
            results.forEach((page) => {
                const TITLE: RichText = page.properties["회사명"] as RichText
                const { plain_text, href } = TITLE.rich_text[0]
                console.log(JSON.stringify(TITLE))
                console.log(`archived: ${plain_text} ("${href}")`)
                notion.pages.update({
                    page_id: page.id,
                    archived: true,
                })
            })
        }
        console.log(`All Expired Job Offer is Deleted.`)
    }, async (error: NotionClientError) => {
        console.error(`Notion Client Error: ${error.message}`)
        if (error.code === 'rate_limited') {
            await delay(1000)
        }
    })
}


export default writeNotion;