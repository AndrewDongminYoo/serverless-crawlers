from datetime import datetime, timedelta
from requests import post
import json

from crawler.utils import set_queries, date_to_string

today = datetime.today()
three_days = timedelta(days=3)
one_months = timedelta(days=30)
three_d_ago = today - three_days
one_mon_ago = today - one_months
CIRCLE_URL = 'https://circlechart.kr'


def fetch_chart_api(period: str):
    queries = {
        'termGbn': period,
        'yyyymmdd': date_to_string(one_mon_ago, period)
    }
    url = f'{CIRCLE_URL}/data/api/chart/global{set_queries(queries)}'
    headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': f'{CIRCLE_URL}/page_chart/global.circle{set_queries(queries)}'
    }
    req = post(url, headers=headers)
    result = req.json()
    print(json.dumps(result, sort_keys=True, indent=4))
    return result


if __name__ == '__main__':
    month = 'month'
    fetch_chart_api(month)
