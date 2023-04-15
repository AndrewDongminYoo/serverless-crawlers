import Axios from "axios";
import { downloadImage } from "../notion.utils";
import fs from "fs";
import path from "path";

describe("download image function test", () => {
  const axios = Axios.create({
    baseURL: "https://www.rocketpunch.com",
    headers: Axios.defaults.headers,
    timeout: 10000,
    withCredentials: true,
  });

  afterEach(() => {
    const clearDirectory = function (directoryPath: string) {
      if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file) => {
          const curPath = path.join(directoryPath, file);
          fs.lstatSync(curPath).isDirectory()
            ? clearDirectory(curPath)
            : fs.unlinkSync(curPath);
        });
      }
    };
    clearDirectory("images");
  });

  test("External Hosted Image: Directly Upload to Notion", async () => {
    const external =
      "https://image.rocketpunch.com/company/177305/tnmeta_logo_1662363701.jpg";
    const href = await downloadImage(axios, external);
    expect(href).toEqual(external);
  });

  test("non-Notion-hosted Image: Download image", async () => {
    process.env["NODE_ENV"] = "dev";
    const internal =
      "https://image.rocketpunch.com/images/2022/9/5/캡처_1662365516.JPG";
    const filename = (await downloadImage(axios, internal)) as string;
    console.debug("🚀file:test/notion.utils.test.ts:40 > filename", filename);
    expect(filename).toContain("캡처_1662365516.JPG");
  });

  test("non-Notion-hosted Image: Pipe Base64 to S3", async () => {
    process.env["NODE_ENV"] = "prod";
    process.env["S3_IMAGE_BUCKET"] = "my-secret-bucket-1857";
    const internal =
      "https://image.rocketpunch.com/images/2022/9/5/캡처_1662365516.JPG";
    const filename = await downloadImage(axios, internal);
    console.debug("🚀file:test/notion.utils.test.ts:50 > filename", filename);
    expect(filename).toContain("캡처_1662365516.JPG");
  });

  test("non-Notion-hosted Image: Convert to Base64 String", async () => {
    process.env["NODE_ENV"] = "test";
    const internal =
      "https://image.rocketpunch.com/images/2022/9/5/캡처_1662365516.JPG";
    const filename = await downloadImage(axios, internal);
    console.debug("🚀file:test/notion.utils.test.ts:59 > filename", filename);
    expect(filename).toContain("data:image/jpg;base64,");
  });

  test("non-Notion-hosted Image: ignore image", async () => {
    process.env["NODE_ENV"] = "none";
    const internal =
      "https://image.rocketpunch.com/images/2022/9/5/캡처_1662365516.JPG";
    const filename = await downloadImage(axios, internal);
    console.debug("🚀file:test/notion.utils.test.ts:68 > filename", filename);
    expect(filename).toBeUndefined();
  });
});

// test('thumbnails', () => {
//     expect(thumbnails(images))
// })
// test('toImage', () => {
//     expect(toImage(src, index, company_name))
// })
// test('toText', () => {
//     expect(toText(content, href))
// })
// test('toAnnotations', () => {
//     expect(toAnnotations(color))
// })
// test('richText', () => {
//     expect(richText(contents))
// })
// test('multiSelect', () => {
//     expect(multiSelect(contents))
// })
// test('toTitle', () => {
//     expect(toTitle(content, href))
// })
// test('toSelect', () => {
//     expect(toSelect(name))
// })
// test('toRichText', () => {
//     expect(toRichText(content, href, color))
// })
// test('list', () => {
//     expect(list(txt, separate))
// })
// test('delay', () => {
//     expect(delay(1000))
// })
// test('removeQuery', () => {
//     expect(removeQuery(urlString))
// })
// test('removeComma', () => {
//     expect(removeComma(str))
// })
// test('removeCom', () => {
//     expect(removeCom(str))
// })
