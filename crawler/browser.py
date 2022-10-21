from bs4 import BeautifulSoup
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.service import Service as ChromiumService
from webdriver_manager.chrome import ChromeDriverManager as DriverManager
from selenium.webdriver import ChromeOptions
import logging
import os
from datetime import datetime
from common import as_chart_array
from utils import date_to_string, roll, set_queries, css, nth, pair, USER_AGENT

TODAY = datetime.today()
TERM = 30
MONTH = 'month'
CIRCLE_URL = 'https://circlechart.kr'
logger = logging.getLogger()
logger.setLevel(logging.INFO)
logger.info(f"""
BeautifulSoup: {BeautifulSoup.__dict__['__doc__']}""")


def get_driver():
    try:
        paths = set(os.environ["PATH"].split(':'))
        for (root, dirName, fileName) in os.walk("/"):
            for f in fileName:
                if "chrom" in f:
                    paths.add(root)
                    print(root + "/" + f)
        driver_path = DriverManager(path='/opt/usr/bin/').install()
        print(f"{driver_path} isfile: {os.path.isfile(driver_path)}")
        print(f"{driver_path} is dir: {os.path.isdir(driver_path)}")
        print(f"{driver_path} exists: {os.path.exists(driver_path)}")
        options = ChromeOptions()
        arguments = [
            # '--allow-running-insecure-content',
            '--disable-dev-shm-usage',
            # '--disable-extensions',
            # '--disable-gpu',
            # '--disable-infobars',
            # '--disable-popup-blocking',
            # '--disable-web-security',
            # '--enable-logging',
            '--headless',
            # '--hide-scrollbars',
            # '--ignore-certificate-errors',
            '--no-sandbox',
            # '--single-process',
            # '--start-maximized',
            pair('--data-path', '/tmp/data-path'),
            pair('--disk-cache-dir', '/tmp/cache-dir'),
            pair('--homedir', '/tmp'),
            pair('--log-level', 0),
            pair('--user-data-dir', '/tmp/user-data'),
            pair('--v', 99),
            pair('--window-size', '1280x1696'),
            pair('user-agent', USER_AGENT)
        ]
        options.arguments.extend(arguments)
        options.binary_location = os.path.realpath(os.path.join(driver_path, os.pardir))
        service = ChromiumService(executable_path=driver_path)
        paths.add(options.binary_location)
        os.environ["PATH"] = ":".join(paths)
        driver = Chrome(service=service, options=options, service_log_path='/tmp/chromedriver.log')
        return driver
    except Exception as e:
        logger.exception(e)
        raise e


def crawl_browser(period: str, chart_type: str, dt: datetime):
    try:
        queries = {
            'termGbn': period,
            'hitYear': date_to_string(dt, 'year'),
            'targetTime': date_to_string(dt, 'M'),
            'nationGbn': 'T',
            'yearTime': 3
        }
        url = f'{CIRCLE_URL}/page_chart/{chart_type}.circle{set_queries(queries)}'
        with get_driver() as driver:
            driver.get(url)
            soup = BeautifulSoup(driver.page_source, "html.parser")
            table_body = soup.find("tbody", {"id": "pc_chart_tbody"})
            result = list()
            for tr in table_body.select("tr"):
                data = dict(url=url)
                data["month"] = date_to_string(dt, period)[2:]
                data['RankStatus'] = tr.select_one(css([nth('td',2),"div.h-full.text-center.leading-[30px].mt-[7px].pl-[10px]","span"])).text
                if chart_type == "global":
                    data['Rank'] = tr.select_one(css([nth('td',1),"div","span"])).text
                    data['Title'] = tr.select_one(css([nth('td',3),"div",nth('section',2),"div","div.font-bold.mb-2"])).text
                    data['Album'] = tr.select_one(css([nth('td',3),"div",nth('section',2),"div","div.font-bold.mb-2"])).text
                    data['ALBUMIMG'] = tr.select_one(css([nth('td',3),"div",nth('section',1),"div","div.rounded-full.w-[70px].h-[70px]","img"])).get("src")
                    data['Artist'] = tr.select_one(css([nth('td',3),"div",nth('section',2),"div","div.text-sm.text-gray-400.font-bold"])).text
                    data['CompanyDist'] = tr.select_one(css(["td.text-left.text-xs","div.mt-2","span"])).text
                    data['CompanyMake'] = tr.select_one(css(["td.text-left.text-xs",nth('div',1),"span"])).text
                elif chart_type == "album":
                    data['FILE_NAME'] = tr.select_one(css([nth('td',3),"div",nth('section',1),"div","div.rounded-full.w-[70px].h-[70px]","img"])).get("src")
                    data['ALBUM_NAME'] = tr.select_one(css([nth('td',3),"div",nth('section',2),"div","div.font-bold.mb-2"])).text
                    data['ARTIST_NAME'] = tr.select_one(css([nth('td',3),"div",nth('section',2),"div","div.text-sm.text-gray-400.font-bold"])).text
                    data['de_nm'] = tr.select_one("td.text-left.text-xs > div > span").text
                    data['SERVICE_RANKING'] = tr.select_one(css([nth('td',1),"div","span"])).text  # 랭킹
                    data['RankChange'] = tr.select_one(css([nth('td',2),"div.h-full.text-center.leading-[30px].mt-[7px].pl-[10px]","span"])).text  # 전월대비 (1up)
                    count = tr.select_one("td.text-center > span").text.split(" / ")
                    if count:
                        data["Album_CNT"] = count[0].replace(",", '').strip()
                        data["Total_CNT"] = count[1].replace(",", '').strip()  # 앨범 판매량
                result.append(data)
            return as_chart_array(result, date_to_string(dt, period), url)
    except Exception as e:
        logger.exception(e)
        raise e


def main(mode: str):
    if mode == "w":
        roll(TODAY, crawl_browser, "global", TERM, MONTH, 10)
        roll(TODAY, crawl_browser, "album", TERM, MONTH, 130)
    else:
        roll(TODAY, crawl_browser, "global", TERM, MONTH, 1)
        roll(TODAY, crawl_browser, "album", TERM, MONTH, 1)
