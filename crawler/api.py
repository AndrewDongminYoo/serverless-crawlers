import logging
import requests
import json
from datetime import datetime
from common import as_chart_array
from utils import (
    date_to_string,
    set_queries,
    object_to_list,
    roll,
    USER_AGENT
)

TODAY = datetime.today()
TERM = 30
MONTH = 'month'
CIRCLE_URL = 'https://circlechart.kr'


def fetch_chart_api(period: str, chart_type: str, dt: datetime):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info(f"requests module version: {requests.__version__}")
    try:
        queries = {'termGbn': period}
        yyyymm = date_to_string(dt, period)
        if chart_type == "global":
            queries['yyyymmdd'] = yyyymm
        elif chart_type == "album":
            queries['hitYear'] = date_to_string(dt, 'year')
            queries['targetTime'] = date_to_string(dt, 'M')
            queries['nationGbn'] = 'T'
            queries['yearTime'] = '3'
            queries['curUrl'] = f'{CIRCLE_URL}/page_chart/{chart_type}.circle{set_queries(queries)}'
        url = f'{CIRCLE_URL}/data/api/chart/{chart_type}{set_queries(queries)}'
        logger.info(f"TARGET URL IS = {url}")
        headers = requests.utils.default_headers()
        headers["User-Agent"] = USER_AGENT
        headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
        headers['Accept-Language'] = 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        headers['Sec-Fetch-Dest'] = 'empty'
        headers['Sec-Fetch-Mode'] = 'cors'
        headers['Sec-Fetch-Site'] = 'same-origin'
        headers['X-Requested-With'] = 'XMLHttpRequest'
        headers['sec-ch-ua'] = '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"'
        headers['Referer'] = f'{CIRCLE_URL}/page_chart/{chart_type}.circle'
        req = requests.Request('POST', url)
        request = req.prepare()
        request.prepare_headers(headers=headers)
        res = requests.Session().send(request=request)
        logger.info(f"request's header: {headers}")
        logger.info(f"response's header: {res.headers}")
        result = res.json()
        if result["ResultStatus"] == "OK":
            return as_chart_array(object_to_list(result["List"]), yyyymm, url)
        else:
            return {
                "status_code": res.status_code,
                "url": res.url,
                "content": json.loads(res.content),
                "encoding": res.encoding,
                "reason": res.reason
            }
    except Exception as e:
        logger.exception(e)
        raise e


def main(mode: str):
    if mode == "w":
        roll(TODAY, fetch_chart_api, "global", TERM, MONTH, 10)
        roll(TODAY, fetch_chart_api, "album", TERM, MONTH, 130)
    else:
        roll(TODAY, fetch_chart_api, "global", TERM, MONTH, 1)
        roll(TODAY, fetch_chart_api, "album", TERM, MONTH, 1)
