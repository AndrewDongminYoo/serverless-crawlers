import { Client } from "@notionhq/client"

describe("Notion SDK Client", () => {
    it("Constructs without throwing", () => {
        new Client({ auth: process.env['NOTION_TOKEN'] })
    })
})


// const seven = new Date()
// seven.setDate(seven.getDate() + 7)
// notion.pages.update({
//     page_id: "45370b223e784d60879fb88651d52039",
//     properties: { 썸네일: { files: [{ file: { url: "dev-jobs-cron/메타브-앱소개-그래픽이미지-1080x790--220906_1662465595.png", expiry_time: seven.toISOString() }, name: "메타브-앱소개-그래픽이미지.png", }] } },
// })