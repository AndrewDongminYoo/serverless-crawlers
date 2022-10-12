from datetime import datetime, timedelta
from requests import post
import json

from crawler.comon import as_chart_array
from crawler.utils import (
    date_to_string,
    set_queries,
    object_to_list,
    pprint
)

TODAY = datetime.today()
TERM = 30
MONTH = 'month'
CIRCLE_URL = 'https://circlechart.kr'


def fetch_chart_api(period: str, chart_type: str, dt: datetime):
    queries = {'termGbn': period}
    ymd = date_to_string(dt, period)
    if chart_type == "global":
        queries['yyyymmdd'] = ymd
    elif chart_type == "album":
        queries['hitYear'] = date_to_string(dt, 'year')
        queries['targetTime'] = date_to_string(dt, 'M')
        queries['nationGbn'] = 'T'
        queries['yearTime'] = '3'
        queries['curUrl'] = f'{CIRCLE_URL}/page_chart/{chart_type}.circle{set_queries(queries)}'
    url = f'{CIRCLE_URL}/data/api/chart/{chart_type}'
    headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': f'{CIRCLE_URL}/page_chart/{chart_type}.circle'
    }
    req = post(url, headers=headers, params=queries)
    result = json.loads(req.text)
    if result["ResultStatus"] == "OK":
        return as_chart_array(object_to_list(result["List"]), ymd)
    else:
        return {
            "status_code": req.status_code,
            "url": req.url,
            "content": json.loads(req.content),
            "encoding": req.encoding,
            "reason": req.reason
        }


if __name__ == '__main__':
    for n in range(10, 0, -1):
        N_months = timedelta(days=TERM * n)
        N_month_ago = TODAY - N_months
        chart_array = fetch_chart_api(MONTH, "global", N_month_ago)
        pprint(chart_array)
    for n in range(130, 0, -1):
        N_months = timedelta(days=TERM * n)
        N_month_ago = TODAY - N_months
        chart_array = fetch_chart_api(MONTH, "album", N_month_ago)
        pprint(chart_array)
