import Axios, { AxiosError } from "axios";
import { CustomHeader, Params, Response } from "./types/response.types";
import { PageStats, Platform } from "./types/notion.types";
import { Position, StatusText } from "./types/wanted.types";
import { UrlWithParsedQuery, parse } from "url";
import {
    multiSelect,
    removeCom,
    removeComma,
    richText,
    thumbnails,
    toNumber,
    toSelect,
    toTitle,
    toURL,
} from "./notion.utils";
import writeNotion, { removeOldJobs } from "./notionhq";
import { ParsedUrlQuery } from "querystring";
import filters from "./types/wanted.filters";

const baseURL = "https://www.wanted.co.kr";
const selected: Position[] = [
    "웹 개발자",
    "서버 개발자",
    "소프트웨어 엔지니어",
    "프론트엔드 개발자",
    "Node.js 개발자",
    "크로스플랫폼 앱 개발자",
];
const platform: Platform = "원티드";

const headers: CustomHeader = {
    Accept: "application/json, text/plain, */*",
    Referer: `${baseURL}/wdlist/507`,
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Sec-Ch-Ua":
        '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"macOS"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    "Wanted-User-Agent": "user-web",
    "Wanted-User-Country": "KR",
    "Wanted-User-Language": "ko",
};

const axios = Axios.create({
    baseURL,
    headers,
    timeout: 10000,
    withCredentials: true,
});

const getWantedResponse = async (
    params: Params
): Promise<void | ParsedUrlQuery> =>
    await axios.get("/api/v4/jobs", { params }).then(
        (res: Response<"Wanted">) => {
            // console.debug('res.data:', res.data);
            // console.debug('res.request.url:', res.request.url);
            res.data.data &&
                res.data.data.forEach(async (job) => {
                    const jobID = job.id;
                    // console.debug('jobID: ', jobID);
                    await axios(`/api/v4/jobs/${jobID}`).then(
                        async (out: Response<"Detail">) => {
                            const jobDetail = out.data.job;
                            // console.debug('jobDetail: ', jobDetail);
                            const { application } = out.data;
                            // console.debug('application: ', application);
                            const { name, industry_name, application_response_stats } =
                                job.company;
                            const {
                                detail,
                                skill_tags,
                                company_images,
                                company_tags,
                                position,
                                address,
                                like_count,
                            } = jobDetail;
                            const {
                                requirements,
                                main_tasks,
                                intro,
                                benefits,
                                preferred_points,
                            } = detail;
                            const skills = skill_tags.map((skill) => skill.title);
                            // console.debug('skills: ', skills);
                            const company_types = company_tags.map((tags) => tags.title);
                            // console.debug('company_types: ', company_types);
                            const full_address =
                                address?.geo_location?.n_location?.address ??
                                address.full_location;
                            // console.debug('full_address: ', full_address);
                            const API_URL = `${baseURL}/api/v4/jobs/${jobID}`;
                            // console.debug('API_URL: ', API_URL);
                            const WEB_URL = `${baseURL}/wd/${jobID}`;
                            // console.debug('WEB_URL: ', WEB_URL);
                            const newPage: PageStats = {
                                URL: toURL(API_URL),
                                주요업무: richText(main_tasks),
                                회사타입: multiSelect(removeComma(company_types)),
                                포지션: richText(position),
                                회사위치: richText(full_address),
                                우대사항: richText(preferred_points),
                                좋아요: toNumber(like_count),
                                기술스택: multiSelect(removeComma(skills)),
                                회사설명: richText(intro),
                                혜택및복지: richText(benefits),
                                자격요건: richText(requirements),
                                아이디: toTitle(String(jobID), WEB_URL),
                                분야: toSelect(removeCom(industry_name)),
                                응답률: toNumber(application_response_stats.avg_rate),
                                회사명: richText(name, WEB_URL),
                                썸네일: thumbnails(company_images, name),
                            };
                            if (application !== null) {
                                const indexOfS = Object.values(StatusText).indexOf(
                                    application.status_text
                                );
                                // console.debug('indexOfS: ', indexOfS);
                                const StatusKR = Object.keys(StatusText)[indexOfS];
                                // console.debug('StatusKR: ', StatusKR);
                                console.log(name, StatusKR);
                            } else {
                                await writeNotion(newPage, platform);
                            }
                        },
                        (error: AxiosError) => {
                            console.error(`there is no more data '${error.request?.path}'`);
                        }
                    );
                });
            const links = res.data.links;
            // console.debug('links: ', links);
            if (!links.next) {
                console.error(`there is no more data '${res.request?.path}'`);
                return;
            } else {
                const url: UrlWithParsedQuery = parse(links.next, true);
                const urlQuery: ParsedUrlQuery = url.query;
                const nextParams = urlQuery;
                // console.debug('nextParams: ', nextParams);
                return nextParams;
            }
        },
        (error: AxiosError) => {
            console.error(`there is no more data '${error.request?.path}'`);
        }
    );

const exploreWantedAPI = async () => {
    console.debug("WANTED API FETCHING STARTED");
    const tag_type_names = filters.positions;
    // console.debug('tag_type_names: ', tag_type_names);
    const tag_type_ids = selected.map((v) => tag_type_names[v]);
    for (const tag_id of tag_type_ids) {
        let params: void | Params = {
      // 검색 조건을  변경하려면 파라미터를 수정하세요.
            country: "kr",
            job_sort: "job.popularity_order",
            tag_type_ids: tag_id,
            locations: "all",
            years: 0,
        };
        while (params) {
            params = await getWantedResponse(params);
        }
    }
    removeOldJobs(platform);
    console.debug("WANTED API FETCHING FINISHED");
};

export default exploreWantedAPI;
