from datetime import datetime
from requests import post
import json

from crawler.comon import as_chart_array
from crawler.utils import (
    date_to_string,
    set_queries,
    object_to_list,
    roll
)

TODAY = datetime.today()
TERM = 30
MONTH = 'month'
CIRCLE_URL = 'https://circlechart.kr'


def fetch_chart_api(period: str, chart_type: str, dt: datetime):
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
    headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': f'{CIRCLE_URL}/page_chart/{chart_type}.circle'
    }
    req = post(url, headers=headers)
    result = json.loads(req.text)
    if result["ResultStatus"] == "OK":
        return as_chart_array(object_to_list(result["List"]), yyyymm, url)
    else:
        return {
            "status_code": req.status_code,
            "url": req.url,
            "content": json.loads(req.content),
            "encoding": req.encoding,
            "reason": req.reason
        }


def main(mode: str):
    if mode == "w":
        roll(TODAY, fetch_chart_api, "global", TERM, MONTH, 10)
        roll(TODAY, fetch_chart_api, "album", TERM, MONTH, 130)
    else:
        roll(TODAY, fetch_chart_api, "global", TERM, MONTH, 1)
        roll(TODAY, fetch_chart_api, "album", TERM, MONTH, 1)
