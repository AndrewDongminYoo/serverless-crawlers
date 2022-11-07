'use strict'
const axios = require('axios');
import { parse, UrlWithParsedQuery } from 'url';
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';
import { Params, Response, ElementChild } from './response.types';
import { load, CheerioAPI, Cheerio } from 'cheerio';
import { PageStats } from './notion.types';
import { writeNotion } from './notionhq';
import { multiSelect, richText, toSelect, toTitle, thumbnails } from './notion.utils';
import { ParsedUrlQuery } from 'querystring';

const baseURL = 'https:/www.rocketpunch.com'
const selected = ['웹 개발자', '서버 개발자', '소프트웨어 엔지니어', '프론트엔드 개발자', '자바 개발자', 'Node.js 개발자', '파이썬 개발자', '크로스플랫폼 앱 개발자']
const headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'referer': 'https://www.rocketpunch.com/jobs',
    'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'same-origin',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
}

export async function run(
    // event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback
) {
    const time = new Date()
    // console.info("EVENT\n" + JSON.stringify(event, null, 2))
    // console.info("CONTEXT\n" + JSON.stringify(context, null, 2))
    // console.info(`Your cron function "${context.functionName}" ran at ${time}`)
    let start: Params = {
        // 검색 조건을  변경하려면 파라미터를 수정하세요.
        q: '',
        job: 1,
        career_type: 1,
        location: '서울특별시',
        page: ''
    }
    while (start) {
        start = await getWantedResponse(start)
    }
}

const getWantedResponse = async (params: Params) => {
    const init = {
        url: '/api/jobs/template',
        baseURL, params, headers
    }
    const parameters: Params = await axios(init).then((res: Response) => {
        const div = res.data.data.template
        // console.log(div)
        const $: CheerioAPI = load(div)
        $('.ui.job.items.segment.company-list > .company.item').each((i, el) => {
            const element = el as ElementChild
            if (element) {
                console.log(element.data)
            }
        })
        // const wantedJob= res.data
        // const links = wantedJob.links
        // if (!links.next) process.exit(1)
        // const url: UrlWithParsedQuery = parse(links.next, true)
        // const urlQuery: ParsedUrlQuery = url.query
        // const nextParams = Object.assign(urlQuery) as Params
        // const jobArray = wantedJob.data
        // jobArray.forEach(async (job) => {
        //     const { address, id, company } = job
        //     if (address.location == '서울') {
        //         const init = {
        //             url: `/api/jobs/template`,
        //             baseURL, headers
        //         }
        //         await axios(init).then((res: Response) => {
        //             const response = res.data
        //             const jobDetail = response.job
        //             const { name, industry_name, application_response_stats } = job.company
        //             const { detail, skill_tags, company_images, company_tags, position, address, like_count } = jobDetail
        //             const { requirements, main_tasks, intro, benefits, preferred_points } = detail
        //             const skills = skill_tags.map((skill) => skill.title)
        //             const company_types = company_tags.map((tags) => tags.title.replace(',', ''))
        //             const full_address = address?.geo_location?.n_location?.address ?? address.full_location
        //             const API_URL = `${baseURL}/api/v4/jobs/${id}`
        //             const WEB_URL = `${baseURL}/wd/${id}`
        //             const newPage: PageStats = {
        //                 "URL": { url: API_URL },
        //                 "주요업무": { rich_text: richText(main_tasks)},
        //                 "회사타입": {multi_select: multiSelect(company_types) },
        //                 "포지션": { rich_text: richText(position)},
        //                 "회사위치": { rich_text: richText(full_address)},
        //                 "우대사항": { rich_text: richText(preferred_points)},
        //                 "좋아요": { number: like_count },
        //                 "기술스택": { multi_select: multiSelect(skills)},
        //                 "회사설명": { rich_text: richText(intro)},
        //                 "혜택및복지": { rich_text: richText(benefits)},
        //                 "자격요건": { rich_text: richText(requirements)},
        //                 "아이디": { title: toTitle(String(id), WEB_URL) },
        //                 "분야": { select: toSelect(industry_name) },
        //                 "응답률": { number: application_response_stats.avg_rate },
        //                 "회사명": { rich_text: toTitle(name, WEB_URL) },
        //                 "썸네일": { files: thumbnails(company_images) },
        //             }
        //             writeNotion(newPage)
        //         }).catch((err: any) => console.error(err))
        //     } else {
        //         console.log(`${company.name}'s LOCATION: ${address.location}`)
        //     }
        // })
        // return nextParams
    })
    return parameters
}

run()