import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { PageStats } from "./notion_page.types";

dotenv.config();

export async function writeNotion(properties: any) {
    const database_id = process.env.NOTION_DATABASE_ID ?? ''
    const notion = new Client({
        auth: process.env.NOTION_TOKEN,
    })
    const { results } = await notion.databases.query({ database_id })
    results.forEach((res) => console.log(JSON.stringify(res,null,2)))
    notion.pages.create({
        parent: { database_id },
        properties: properties,
    })
}
