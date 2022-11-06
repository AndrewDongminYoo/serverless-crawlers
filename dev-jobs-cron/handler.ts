'use strict'
const axios = require('axios');
import { parse } from 'url';
import { AxiosResponse } from "axios";
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';
import filters from './filters'
import { Job, WantedResponse } from "./job.types";
import { Params, Response } from './response.types';
import { DescribeJob, JobDetail } from "./detail.types";
import { PageStats } from './notion.types';
import { writeNotion } from './notionhq';
import { multiSelectArray, richTextArray, toSelect, toTitle } from './notion.utils';

const baseURL = 'https://www.wanted.co.kr'
const selected = ['웹 개발자', '서버 개발자', '소프트웨어 엔지니어', '프론트엔드 개발자', '자바 개발자', 'Node.js 개발자', '파이썬 개발자', '크로스플랫폼 앱 개발자']

export async function run(event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) {
    const time = new Date()
    console.info("EVENT\n" + JSON.stringify(event, null, 2))
    console.info("CONTEXT\n" + JSON.stringify(context, null, 2))
    console.info(`Your cron function "${context.functionName}" ran at ${time}`)
    const tag_type_names: { [key: string]: number } = filters.positions
    const tag_type_ids = Object.entries(tag_type_names).filter(([k, _]) => selected.includes(k)).map(v => v[1])
    for (let tag_id of tag_type_ids) {
        let start: Params = {
            country: 'kr',
            job_sort: 'job.popularity_order',
            tag_type_ids: tag_id,
            locations: 'seoul.all',
            years: 0
        }
        while (start) {
            start = await getWantedResponse(start)
        }
    }
}

const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    'referer': `${baseURL}/wdlist/507`,
    'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'wanted-user-agent': 'user-web',
    'wanted-user-country': 'KR',
    'wanted-user-language': 'ko'
}

const getWantedResponse = async (params: Params) => {
    const init = {
        url: '/api/v4/jobs',
        baseURL, params, headers
    }
    const parameters: Params = await axios(init).then((res: any) => {
        const response = res as Response
        const wantedJob: WantedResponse = response.data
        const links = wantedJob.links
        if (!links.next) process.exit(1)
        const urlQuery = parse(links.next, true).query
        const nextParams = Object.assign(urlQuery) as Params
        const jobArray = wantedJob.data as Array<Job>
        jobArray.forEach(async (job: Job) => {
            const { address, id } = job
            if (address.location == '서울') {
                const init = {
                    url: `/api/v4/jobs/${id}`,
                    baseURL, headers
                }
                await axios(init).then((res: AxiosResponse) => {
                    const response = res.data as JobDetail
                    const jobDetail = response.job as DescribeJob
                    const { name, industry_name, application_response_stats } = job.company
                    const { detail, skill_tags, company_images, company_tags, position, address, like_count } = jobDetail
                    const { requirements, main_tasks, intro, benefits, preferred_points } = detail
                    const skills = skill_tags.map((skill) => skill.title)
                    const company_types = company_tags.map((tags) => tags.title.replace(',', ''))
                    const full_address = address?.geo_location?.n_location?.address ?? address.full_location
                    const newPage: PageStats = {
                        "URL": { url: `${baseURL}/api/v4/jobs/${id}` },
                        "주요업무": richTextArray(main_tasks),
                        "회사타입": multiSelectArray(company_types),
                        "포지션": richTextArray(position),
                        "회사위치": richTextArray(full_address),
                        "우대사항": richTextArray(preferred_points),
                        "좋아요": { number: like_count },
                        "기술스택": multiSelectArray(skills),
                        "회사설명": richTextArray(intro),
                        "혜택및복지": richTextArray(benefits),
                        "자격요건": richTextArray(requirements),
                        "아이디": toTitle(String(id)),
                        "분야": { select: toSelect(industry_name) },
                        "응답률": { number: application_response_stats.avg_rate },
                        "회사명": richTextArray(name),
                        "썸네일": { url: company_images[0].url },
                        "사이트": { url: `${baseURL}/wd/${id}`}
                    }
                    writeNotion(newPage)
                }).catch((err: any)=>console.error(err))
            }
        })
        return nextParams
    })
    return parameters
}