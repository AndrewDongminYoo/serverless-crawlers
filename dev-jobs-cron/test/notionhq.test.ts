import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

describe("Notion SDK Client", () => {
  it("Constructs without throwing", () => {
    new Client({ auth: process.env["NOTION_TOKEN"] });
  });
});

describe("Notion Old Job Offers Delete", () => {
  const notion = new Client({
    auth: process.env["NOTION_TOKEN"],
  });

  test("list old pages", async () => {
    const database_id = process.env["WANTED_NOTION_DB"] as string;
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const pages = await notion.databases.query({
      database_id,
      filter: {
        or: [
          {
            last_edited_time: {
              before: lastWeek.toISOString(),
            },
            timestamp: "last_edited_time",
            type: "last_edited_time",
          },
        ],
      },
      archived: false,
    });
    expect(pages).toHaveProperty("results");
    expect(pages.results).toHaveLength(0);
  });
});

// const seven = new Date()
// seven.setDate(seven.getDate() + 7)
// notion.pages.update({
//     page_id: '45370b223e784d60879fb88651d52039',
//     properties: { 썸네일: { files: [{ file: { url: 'dev-jobs-cron/메타브-앱소개-그래픽이미지-1080x790--220906_1662465595.png', expiry_time: seven.toISOString() }, name: '메타브-앱소개-그래픽이미지.png', }] } },
// })
