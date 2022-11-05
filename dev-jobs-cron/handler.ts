'use strict';
const axios = require('axios');
import { parse } from 'url';
import { AxiosResponse } from "axios";
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';
import filters from './filters'
import { Job } from "./job.types";
import { Params, Response } from './response.types';
import { DescribeJob, JobDetail } from "./detail.types";
import { WantedResponse } from "./wanted.res.types";

const baseURL = 'https://www.wanted.co.kr'

// Generated by https://quicktype.io

export async function run(event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) {
    const time = new Date();
    console.log(`Your cron function "${context.functionName}" ran at ${time}`);
    main();
}

const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    'referer': 'https://www.wanted.co.kr/wdlist/507',
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
    };
    const parameters: Params = await axios(init).then((res: any) => {
        const response = res as Response
        const wantedJob: WantedResponse = response.data
        const links = wantedJob.links
        if (!links.next) throw Error('다음 URL이 없습니다.')
        const urlQuery = parse(links.next, true).query
        const nextParams = Object.assign(urlQuery) as Params
        const jobArray = wantedJob.data as Array<Job>
        jobArray.forEach(async (job: Job) => {
            const { address, company, like_count, title_img, id } = job
            const { name, industry_name, application_response_stats } = company
            if (address.location == '서울') {
                console.log(`아이디 : ${id}`)
                console.log(`분야 : ${industry_name}`)
                console.log(`회사명 : ${name}`)
                console.log(`좋아요 : ${like_count}`)
                console.log(`응답률 : ${application_response_stats.avg_rate}`)
                console.log(`썸네일 : ${title_img.thumb}`)
                console.log(`URL: ${baseURL}/api/v4/jobs/${String(id)}`)
                console.log()
                const init = {
                    url: `/api/v4/jobs/${id}`,
                    baseURL, headers
                };
                await axios(init).then((res: AxiosResponse) => {
                    const response = res.data as JobDetail
                    const jobDetail = response.job as DescribeJob
                    const { detail, skill_tags, company_tags, position } = jobDetail
                    const { requirements, main_tasks, intro, benefits, preferred_points } = detail
                    const skills = skill_tags.map((skill)=>skill.title)
                    const company_types = company_tags.map((tags)=>tags.title)
                    console.log(`포지션 : ${position}`)
                    console.log(`자격요건 : ${requirements}`)
                    console.log(`주요업무 : ${main_tasks}`)
                    console.log(`회사설명 : ${intro}`)
                    console.log(`혜택및복지 : ${benefits}`)
                    console.log(`우대사항 : ${preferred_points}`)
                    console.log(`기술스택 : ${skills}`)
                    console.log(`회사타입 : ${company_types}`)
                    console.log()
                })
            }
        })
        return nextParams
    })
    return parameters
}

const main = async () => {
    const tag_type_names: { [key: string]: number } = filters.positions
    const selected = ['웹 개발자', '서버 개발자', '소프트웨어 엔지니어', '프론트엔드 개발자', '자바 개발자', 'Node.js 개발자', '파이썬 개발자', '크로스플랫폼 앱 개발자']
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

main()