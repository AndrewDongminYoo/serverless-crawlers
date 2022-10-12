from datetime import datetime, timedelta
from requests import post
import json

from crawler.comon import as_chart_array
from crawler.utils import date_to_string, set_queries, object_to_list

today = datetime.today()
one_months = timedelta(days=30)
one_mon_ago = today - one_months
CIRCLE_URL = 'https://circlechart.kr'


def fetch_chart_api(period: str, chart_type: str):
    queries = {'termGbn': period}
    if chart_type == "global":
        queries['yyyymmdd'] = date_to_string(one_mon_ago, period)
    elif chart_type == "album":
        queries['curUrl'] = f'{CIRCLE_URL}/page_chart/{chart_type}.circle{set_queries(queries)}'
        queries['nationGbn'] = 'T'
        queries['hitYear'] = one_mon_ago.year
        queries['targetTime'] = '09'
        queries['yearTime'] = '3'
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
        print(json.dumps(as_chart_array(object_to_list(result["List"])), indent=4, ensure_ascii=False))
        return as_chart_array(object_to_list(result["List"]))
    else:
        return req.status_code


if __name__ == '__main__':
    month = 'month'
    charts = ["global", "album"]
    for chart in charts:
        fetch_chart_api(month, chart)
