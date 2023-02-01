import { Client, NotionClientError, isFullPage } from '@notionhq/client'
import { PageStats, Platform, Prop } from './types/notion.types'
import { delay, isEmpty } from './notion.utils'
import dotenv from 'dotenv'

dotenv.config()
console.log()

const notion = new Client({
    auth: process.env['NOTION_TOKEN'],
})

const onRejected = async (error: NotionClientError) => {
    console.error(error)
    if (error.code === 'rate_limited') {
        await delay(1000)
    }
}

async function writeNotion(properties: PageStats, platform: Platform) {
    await delay(400)
    const database_id = (platform === '원티드' ? process.env['WANTED_NOTION_DB'] : process.env['ROCKET_NOTION_DB']) ?? ''
    const equals = properties.아이디.title[0].text.content
    const defaultImage = properties.썸네일.files[0]
    const coverURL = 'external' in defaultImage ? defaultImage.external.url : defaultImage.file.url
    await notion.databases
        .query({
            database_id,
            filter: {
                or: [{ type: 'title', title: { equals }, property: '아이디' }],
            },
        })
        .then(
            async ({ results }) => {
                if (isEmpty(results)) {
                    await notion.pages
                        .create({
                            parent: { database_id },
                            properties: properties as Record<Prop, never>,
                            cover: { external: { url: coverURL } },
                        })
                        .then(
                            (res) => console.info(`${res.id} CREATED`),
                            (error) => onRejected(error)
                        )
                } else {
                    await notion.pages
                        .update({
                            page_id: results[0].id,
                            properties: properties as Record<Prop, never>,
                            cover: { external: { url: coverURL } },
                            archived: false,
                        })
                        .then(
                            (res) => console.info(`${res.id} UPDATED`),
                            (error) => onRejected(error)
                        )
                }
            },
            (error) => onRejected(error)
        )
}

export async function removeOldJobs(platform: Platform) {
    const database_id = (platform === '원티드' ? process.env['WANTED_NOTION_DB'] : process.env['ROCKET_NOTION_DB']) ?? ''
    const yesterDay = new Date()
    yesterDay.setDate(yesterDay.getDate() - 1)
    notion.databases
        .query({
            database_id,
            filter: {
                or: [
                    {
                        last_edited_time: {
                            before: yesterDay.toISOString(),
                        },
                        timestamp: 'last_edited_time',
                        type: 'last_edited_time',
                    },
                ],
            },
            archived: false,
        })
        .then(
            ({ results }) => {
                if (isEmpty(results)) {
                    console.debug(`"No Data is Expired"`)
                    return
                } else {
                    results.forEach((page) => {
                        if (isFullPage(page)) {
                            const TITLE = page.properties['회사명']
                            console.debug('archived:', TITLE)
                            notion.pages
                                .update({
                                    page_id: page.id,
                                    archived: true,
                                })
                                .then(
                                    (success) => success,
                                    (error) => onRejected(error)
                                )
                        }
                    })
                }
                console.debug(`All Expired Job Offer is Deleted.`, {})
                return
            },
            (error) => onRejected(error)
        )
}

export default writeNotion
