
'use strict'
import { parse, UrlWithParsedQuery } from 'url';
import filters, { Position } from './wanted.filters'
import { Job, WantedResponse, DescribeJob, JobDetail } from "./wanted.types";
import { Params, Response } from './response.types';
import { PageStats, Platform } from './notion.types';
import { writeNotion } from './notionhq';
import { multiSelect, richText, toSelect, toTitle, thumbnails } from './notion.utils';
import { ParsedUrlQuery } from 'querystring';
import Axios, { AxiosError } from 'axios'

const baseURL = 'https://www.wanted.co.kr'
const selected: Position[] = ['웹 개발자', '서버 개발자', '소프트웨어 엔지니어', '프론트엔드 개발자', '자바 개발자', 'Node.js 개발자', '파이썬 개발자', '크로스플랫폼 앱 개발자']
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
const axios = Axios.create({
    baseURL,
    headers,
    timeout: 10000
})

const getWantedResponse = async (params: Params) => {
    const parameters: void | Params = await axios('/api/v4/jobs', { params })
        .then((res: Response) => {
            const wantedJob = res.data as WantedResponse
            const links = wantedJob.links
            if (!links.next) return
            const url: UrlWithParsedQuery = parse(links.next, true)
            const urlQuery: ParsedUrlQuery = url.query
            const nextParams = Object.assign(urlQuery) as Params
            const jobArray = wantedJob.data as Array<Job>
            jobArray.forEach(async (job: Job) => {
                const { address, id, company } = job
                if (address.location == '서울') {
                    await axios(`/api/v4/jobs/${id}`).then((res: Response) => {
                        const response = res.data as JobDetail
                        const jobDetail = response.job as DescribeJob
                        const { name, industry_name, application_response_stats } = job.company
                        const { detail, skill_tags, company_images, company_tags, position, address, like_count } = jobDetail
                        const { requirements, main_tasks, intro, benefits, preferred_points } = detail
                        const skills = skill_tags.map((skill) => skill.title)
                        const company_types = company_tags.map((tags) => tags.title.replace(',', ''))
                        const full_address = address?.geo_location?.n_location?.address ?? address.full_location
                        const API_URL = `${baseURL}/api/v4/jobs/${id}`
                        const WEB_URL = `${baseURL}/wd/${id}`
                        const platform: Platform = "원티드";
                        const newPage: PageStats = {
                            "URL": { url: API_URL },
                            "주요업무": { rich_text: richText(main_tasks) },
                            "회사타입": { multi_select: multiSelect(company_types) },
                            "포지션": { rich_text: richText(position) },
                            "회사위치": { rich_text: richText(full_address) },
                            "우대사항": { rich_text: richText(preferred_points) },
                            "좋아요": { number: like_count },
                            "기술스택": { multi_select: multiSelect(skills) },
                            "회사설명": { rich_text: richText(intro) },
                            "혜택및복지": { rich_text: richText(benefits) },
                            "자격요건": { rich_text: richText(requirements) },
                            "아이디": { title: toTitle(String(id), WEB_URL) },
                            "분야": { select: toSelect(industry_name) },
                            "응답률": { number: application_response_stats.avg_rate },
                            "회사명": { rich_text: toTitle(name, WEB_URL) },
                            "썸네일": { files: thumbnails(company_images, name) },
                        }
                        writeNotion(newPage, platform)
                    }, (error: any) => {
                        if (error instanceof AxiosError) {
                            console.error(`there is no more data "${error.request?.path}"`)
                        }
                    })
                } else {
                    console.log(`${company.name}'s LOCATION: ${address.location}`)
                }
            })
            return nextParams
        }, (error) => {
            if (error instanceof AxiosError) {
                console.error(`there is no more data "${error.request?.path}"`)
            }
        })
    return parameters
}
export const exploreWantedAPI = async () => {
    console.debug("WANTED API FETCHING STARTED")
    const tag_type_names = filters.positions
    const tag_type_ids = Object.entries(tag_type_names)
        .filter(([k, _]) => selected.includes(k as Position))
        .map(v => Number(v[1]))
    for (let tag_id of tag_type_ids) {
        let start: void | Params = {
            // 검색 조건을  변경하려면 파라미터를 수정하세요.
            country: 'kr',
            job_sort: 'job.popularity_order',
            tag_type_ids: tag_id,
            locations: 'all',
            years: '0'
        }
        while (start) {
            start = await getWantedResponse(start)
        }
    }
}