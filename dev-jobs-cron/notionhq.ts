import { Client, NotionClientError } from "@notionhq/client";
import {
    LogLevel,
    Logger,
    makeConsoleLogger,
} from "@notionhq/client/build/src/logging";
import {
    PageObjectResponse,
    QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import {
    PageStats,
    Pages,
    Platform,
    Prop,
    RichText,
} from "./types/notion.types";
import { delay, isEmpty } from "./notion.utils";
import dotenv from "dotenv";

dotenv.config();

const getLogger = (platform: Platform) => {
    return platform === "원티드"
        ? makeConsoleLogger("WANTED_NOTION")
        : makeConsoleLogger("ROCKET_NOTION");
};
const getClient = (platform: Platform) => {
    return new Client({
        auth: process.env["NOTION_TOKEN"],
        logger: getLogger(platform),
    });
};

const onRejected = async (error: NotionClientError, logger: Logger) => {
    logger(LogLevel.ERROR, "NOTION FAILED", { message: error.message });
    if (error.code === "rate_limited") {
        await delay(1000);
    }
};

async function writeNotion(properties: PageStats, platform: Platform) {
    await delay(400);
    const database_id =
        (platform === "원티드"
            ? process.env["WANTED_NOTION_DB"]
            : process.env["ROCKET_NOTION_DB"]) ?? "";
    const notion = getClient(platform);
    const logger = getLogger(platform);
    const equals = properties.아이디.title[0].text.content;
    const defaultImage = properties.썸네일.files[0];
    const coverURL =
        "external" in defaultImage
            ? defaultImage.external.url
            : defaultImage.file.url;
    await notion.databases
        .query({
            database_id,
            filter: {
                or: [{ type: "title", title: { equals }, property: "아이디" }],
            },
        })
        .then(
            async (res: QueryDatabaseResponse) => {
                const results = res.results as Pages[];
        if (isEmpty(results)) {
            await notion.pages
                .create({
                    parent: { database_id },
                    properties: properties as Record<Prop, never>,
                    cover: { external: { url: coverURL } },
            })
                .then(
                    (res: Partial<PageObjectResponse>) =>
                        logger(LogLevel.INFO, "CREATED", { url: res.url }),
                    (error) => onRejected(error, logger)
                );
        } else if (results && results.length) {
            await notion.pages
                .update({
                    page_id: results[0].id,
                    properties: properties as Record<Prop, never>,
                    cover: { external: { url: coverURL } },
                    archived: false,
            })
                .then(
                    (res: Partial<PageObjectResponse>) =>
                        logger(LogLevel.INFO, "UPDATED", { url: res.url }),
                    (error) => onRejected(error, logger)
                );
        }
            },
            (error) => onRejected(error, logger)
        );
}

export async function removeOldJobs(platform: Platform) {
    const database_id =
        (platform === "원티드"
            ? process.env["WANTED_NOTION_DB"]
            : process.env["ROCKET_NOTION_DB"]) ?? "";
    const notion = getClient(platform);
    const logger = getLogger(platform);
    const yesterDay = new Date();
    yesterDay.setDate(yesterDay.getDate() - 1);
    notion.databases
        .query({
            database_id,
            filter: {
                or: [
                    {
                        last_edited_time: {
                            before: yesterDay.toISOString(),
                        },
                        timestamp: "last_edited_time",
                        type: "last_edited_time",
                    },
                ],
            },
            archived: false,
        })
        .then(
            (value: QueryDatabaseResponse) => {
                const results = value.results as Pages[];
        if (isEmpty(results)) {
            logger(LogLevel.DEBUG, `No Data is Expired`, { results });
            return;
        } else if (results && results.length) {
            results.forEach((page) => {
                const TITLE: RichText = page.properties["회사명"];
                logger(LogLevel.DEBUG, "archived:", TITLE);
                notion.pages
                    .update({
                        page_id: page.id,
                        archived: true,
                    })
                    .then(
                        (success) => success,
                        (error) => onRejected(error, logger)
                    );
            });
        }
                logger(LogLevel.DEBUG, `All Expired Job Offer is Deleted.`, {});
                return;
            },
            (error) => onRejected(error, logger)
        );
}

export default writeNotion;
