'use strict';
const axios = require('axios');

async function run(event, context) {
    const time = new Date();
    console.log(`Your cron function "${context.functionName}" ran at ${time}`);
}

const getWantedResponse = () => {
    const init = {
        baseURL: 'https://www.wanted.co.kr',
        url: '/api/v4/jobs?1667565031108&country=kr&tag_type_ids=507&job_sort=job.popularity_order&locations=seoul.yeongdeungpo-gu&years=0',
        method: 'GET',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'referer': 'https://www.wanted.co.kr/wdlist/507?country=kr&amp;job_sort=job.popularity_order&amp;years=0&amp;locations=seoul.yeongdeungpo-gu',
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
    };
    axios(init).then((res) => console.log(JSON.stringify(res.data, null, 2)))
}

getWantedResponse()