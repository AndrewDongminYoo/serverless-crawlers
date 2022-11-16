import {
    downloadImage,
    thumbnails,
    toImage,
    toText,
    toAnnotations,
    richText,
    multiSelect,
    toTitle,
    toSelect,
    toRichText,
    list,
    delay,
    removeQuery,
    removeComma,
    removeCom
} from '../notion.utils';
import fs from 'fs/promises';
import Axios from 'axios';

const axios = Axios.create({
    baseURL: 'https://www.rocketpunch.com',
    headers: Axios.defaults.headers,
    timeout: 10000,
    withCredentials: true,
})

test('External Hosted Image: Directly Upload to Notion', async () => {
    const external = 'https://image.rocketpunch.com/company/177305/tnmeta_logo_1662363701.jpg'
    const href = await downloadImage(axios, external)
    expect(href).toEqual(external)
})

test('non-Notion-hosted Image: Download Base64 and Upload to S3', async () => {
    const internal = 'https://image.rocketpunch.com/images/2022/9/5/캡처_1662365516.JPG'
    await downloadImage(axios, internal).then(filename=>{
        expect(filename).toContain('캡처_1662365516.JPG')
        filename && fs.rm(filename)
    })
})
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