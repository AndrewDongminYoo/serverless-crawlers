from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import os
from datetime import datetime

from crawler.comon import as_chart_array
from crawler.utils import (
    date_to_string,
    roll,
    set_queries,
)

TODAY = datetime.today()
TERM = 30
MONTH = 'month'
CIRCLE_URL = 'https://circlechart.kr'
options = Options()
options.headless = True
paths = os.getenv("PATH").split(":")
pws = [x for x in paths if "venv" in x]
print(pws[0])

service = Service(executable_path="/Users/bside/Downloads/chromedriver")
driver = Chrome(service=service, options=options)


def crawl_browser(period: str, chart_type: str, dt: datetime):
    queries = {
        'termGbn': period,
        'hitYear': date_to_string(dt, 'year'),
        'targetTime': date_to_string(dt, 'M'),
        'nationGbn': 'T',
        'yearTime': '3'
    }
    url = f'{CIRCLE_URL}/page_chart/{chart_type}.circle{set_queries(queries)}'
    driver.get(url)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    table_body = soup.find("tbody", {"id": "pc_chart_tbody"})
    result = list()
    for child in table_body.select("tr"):
        data = {
            "month": date_to_string(dt, period)[2:],
            "url": url
        }
        if chart_type == "global":
            data['Rank'] = child.select_one("td:nth-child(1) > div > span").text
            data['Title'] = child.select_one(
                "td:nth-child(3) > div > section:nth-child(2) > div > div.font-bold.mb-2").text
            data['Album'] = child.select_one(
                "td:nth-child(3) > div > section:nth-child(2) > div > div.font-bold.mb-2").text
            data['ALBUMIMG'] = child.select_one(
                "td:nth-child(3) > div > section:nth-child(1) > div > div.rounded-full.w-[70px].h-[70px] > img").get(
                "src")
            data['Artist'] = child.select_one("td:nth-child(3) > div > section:nth-child(2) > div > "
                                              "div.text-sm.text-gray-400.font-bold").text
            data['CompanyDist'] = child.select_one("td.text-left.text-xs > div > span").text
            data['CompanyMake'] = child.select_one("td.text-left.text-xs > div.mt-2 > span").text
            data['RankStatus'] = child.select_one(
                "td:nth-child(2) > div.h-full.text-center.leading-[30px].mt-[7px].pl-[10px] > span").text
        elif chart_type == "album":
            data['FILE_NAME'] = child.select_one(
                "td:nth-child(3) > div > section:nth-child(1) > div > div.rounded-full.w-[70px].h-[70px] > img").get(
                "src")
            data['ALBUM_NAME'] = child.select_one(
                "td:nth-child(3) > div > section:nth-child(2) > div > div.font-bold.mb-2").text
            data['ARTIST_NAME'] = child.select_one(
                "td:nth-child(3) > div > section:nth-child(2) > div > div.text-sm.text-gray-400.font-bold").text
            data['de_nm'] = child.select_one("td.text-left.text-xs > div > span").text
            data['SERVICE_RANKING'] = child.select_one("td:nth-child(1) > div > span").text  # 랭킹
            data['RankStatus'] = child.select_one(
                "td:nth-child(2) > div.h-full.text-center.leading-[30px].mt-[7px].pl-[10px] > span").text
            data['RankChange'] = child.select_one(
                "td:nth-child(2) > div.h-full.text-center.leading-[30px].mt-[7px].pl-[10px] > span").text  # 전월대비 (1up)
            count = child.select_one("td.text-center > span").text.split(" / ")
            if count:
                data["Album_CNT"] = count[0]
                data["Total_CNT"] = count[1]  # 앨범 판매량
        result.append(data)
    return as_chart_array(result, date_to_string(dt, period), url)


def main(period: str):
    if period == "all":
        roll(TODAY, crawl_browser, "global", TERM, MONTH, 10)
        roll(TODAY, crawl_browser, "album", TERM, MONTH, 130)
    else:
        roll(TODAY, crawl_browser, "global", TERM, MONTH, 1)
        roll(TODAY, crawl_browser, "album", TERM, MONTH, 1)