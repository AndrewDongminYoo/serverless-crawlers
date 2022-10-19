from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import os
from datetime import datetime
from comon import as_chart_array
from utils import (
    date_to_string,
    roll,
    set_queries,
)

TODAY = datetime.today()
TERM = 30
MONTH = 'month'
CIRCLE_URL = 'https://circlechart.kr'
paths = os.getenv("PATH").split(":")
pws = [x for x in paths if "venv" in x]


def get_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1280x1696')
    options.add_argument('--user-data-dir=/tmp/user-data')
    options.add_argument('--hide-scrollbars')
    options.add_argument('--enable-logging')
    options.add_argument('--log-level=0')
    options.add_argument('--v=99')
    options.add_argument('--single-process')
    options.add_argument('--data-path=/tmp/data-path')
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--homedir=/tmp')
    options.add_argument('--disk-cache-dir=/tmp/cache-dir')
    options.add_argument(
        'user-agent=Mozilla/5.0 (X11; Linux x86_64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/61.0.3163.100 Safari/537.36')
    options.binary_location = "/opt/python/bin/headless-chromium"
    service = Service(executable_path="/opt/python/bin/chromedriver")
    driver = Chrome(service=service, options=options)
    return driver


def nth(tag: str, order: int): return f"{tag}:nth-child({order})"


def crawl_browser(period: str, chart_type: str, dt: datetime):
    queries = {
        'termGbn': period,
        'hitYear': date_to_string(dt, 'year'),
        'targetTime': date_to_string(dt, 'M'),
        'nationGbn': 'T',
        'yearTime': '3'
    }
    url = f'{CIRCLE_URL}/page_chart/{chart_type}.circle{set_queries(queries)}'
    with get_driver() as driver:
        driver.get(url)
        soup = BeautifulSoup(driver.page_source, "html.parser")
        table_body = soup.find("tbody", {"id": "pc_chart_tbody"})
        result = list()
        for child in table_body.select("tr"):
            data = dict(url=url)
            data["month"] = date_to_string(dt, period)[2:]
            if chart_type == "global":
                data['Rank'] = child.select_one(f"{nth('td',1)} > div > span").text
                data['Title'] = child.select_one(f"{nth('td',3)} > div > {nth('section',2)} > div > div.font-bold.mb-2").text
                data['Album'] = child.select_one(f"{nth('td',3)} > div > {nth('section',2)} > div > div.font-bold.mb-2").text
                data['ALBUMIMG'] = child.select_one(f"{nth('td',3)} > div > {nth('section',1)} > div > div.rounded-full.w-\[70px\].h-\[70px\] > img").get("src")
                data['Artist'] = child.select_one(f"{nth('td',3)} > div > {nth('section',2)} > div > div.text-sm.text-gray-400.font-bold").text
                data['CompanyDist'] = child.select_one(f"td.text-left.text-xs > div.mt-2 > span").text
                data['CompanyMake'] = child.select_one(f"td.text-left.text-xs > {nth('div',1)} > span").text
                data['RankStatus'] = child.select_one(f"{nth('td',2)} > div.h-full.text-center.leading-\[30px\].mt-\[7px\].pl-\[10px\] > span").text
            elif chart_type == "album":
                data['FILE_NAME'] = child.select_one(f"{nth('td',3)} > div > {nth('section',1)} > div > div.rounded-full.w-\[70px\].h-\[70px\] > img").get("src")
                data['ALBUM_NAME'] = child.select_one(f"{nth('td',3)} > div > {nth('section',2)} > div > div.font-bold.mb-2").text
                data['ARTIST_NAME'] = child.select_one(f"{nth('td',3)} > div > {nth('section',2)} > div > div.text-sm.text-gray-400.font-bold").text
                data['de_nm'] = child.select_one("td.text-left.text-xs > div > span").text
                data['SERVICE_RANKING'] = child.select_one(f"{nth('td',1)} > div > span").text  # 랭킹
                data['RankStatus'] = child.select_one(f"{nth('td',2)} > div.h-full.text-center.leading-\[30px\].mt-\[7px\].pl-\[10px\] > span").text
                data['RankChange'] = child.select_one(f"{nth('td',2)} > div.h-full.text-center.leading-\[30px\].mt-\[7px\].pl-\[10px\] > span").text  # 전월대비 (1up)
                count = child.select_one("td.text-center > span").text.split(" / ")
                if count:
                    data["Album_CNT"] = count[0].replace(",", '').strip()
                    data["Total_CNT"] = count[1].replace(",", '').strip()  # 앨범 판매량
            result.append(data)
        return as_chart_array(result, date_to_string(dt, period), url)


def main(mode: str):
    if mode == "w":
        roll(TODAY, crawl_browser, "global", TERM, MONTH, 10)
        roll(TODAY, crawl_browser, "album", TERM, MONTH, 130)
    else:
        roll(TODAY, crawl_browser, "global", TERM, MONTH, 1)
        roll(TODAY, crawl_browser, "album", TERM, MONTH, 1)
