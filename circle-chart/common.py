import csv
from os.path import join as join_path, realpath
from os import environ
from xlsxwriter import Workbook
from abc import ABC


header = [
    'month',
    'link',
    'image',
    'album',
    'artist',
    'distributor',
    'producer',
    'ranking',
    'rank_status',
    'sales_volume',
    'title',
]

EFS_PATH = environ.get("EFS_PATH", "./data/")
TMP_PATH = environ.get("TMP_PATH", "./data/")
GLOBAL = realpath(join_path(TMP_PATH, "global_kpop_chart.csv"))
ALBUMS = realpath(join_path(TMP_PATH, "album_chart.csv"))
RESULT = realpath(join_path(EFS_PATH, "global_kpop_chart_cleanup.xlsx"))


class Chart(ABC):
    month = None  # 'selector'
    link = None  # 'selector-href'
    image = None
    album = None
    artist = None
    distributor = None
    producer = None  # 'production'
    ranking = None
    rank_status = None
    sales_volume = None
    title = None

    def __init__(self):
        if self.__class__ is AlbumChart:
            self.target_file = ALBUMS
        if self.__class__ is GlobalChart:
            self.target_file = GLOBAL
        self.file = open(self.target_file, mode="a+", encoding="utf-8", newline="")
        self.first = len(open(self.target_file, mode="r").readlines()) == 0
        self.writer = csv.writer(self.file, dialect="excel")
        if self.first:
            self.writer.writerow(header)

    def to_csv(self):
        self.writer.writerow([
            self.month,
            self.link,
            self.image,
            self.album,
            self.artist,
            self.distributor,
            self.producer,
            self.ranking,
            self.rank_status,
            self.sales_volume,
            self.title,
        ])
        self.file.close()
        return self.__dict__


class GlobalChart(Chart):
    def __init__(self, data: dict, month, url):
        super().__init__()
        self.month = month[2:]
        self.link = url
        self.image = "https://circlechart.kr/uploadDir/" + data['ALBUMIMG']
        self.album = data['Album']
        self.artist = data['Artist']
        self.distributor = data['CompanyDist']
        self.producer = data['CompanyMake']
        self.ranking = data['Rank']  # 랭킹
        self.rank_status = str(data['RankStatus'])  # 전월대비 (+1)
        # self.sales_volume = data[""]
        self.title = data['Title']  # 곡명


class AlbumChart(Chart):
    def __init__(self, data: dict, month, url):
        super().__init__()
        self.month = month[2:]
        self.link = url
        self.image = "https://circlechart.kr" + data['FILE_NAME']
        self.album = data['ALBUM_NAME']
        self.artist = data['ARTIST_NAME']
        self.distributor = data['de_nm']
        # self.producer = data['de_nm']
        self.ranking = data['SERVICE_RANKING']  # 랭킹
        self.rank_status = rank_to_string(
            data['RankStatus'], data['RankChange'])  # 전월대비 (1up)
        self.sales_volume = data["Album_CNT"] + \
            " / " + data["Total_CNT"]  # 앨범 판매량 / 전체 판매량
        # self.title = data['']


def as_chart(chart_data: dict, timestamp: str, url: str):
    if "Total_CNT" in chart_data.keys():
        return AlbumChart(chart_data, timestamp, url)
    elif "Title" in chart_data.keys():
        return GlobalChart(chart_data, timestamp, url)


def as_chart_array(array: list, ts: str, url: str):
    return [as_chart(chart, ts, url).to_csv() for chart in array]


def rank_to_string(status: str, change: str):
    if status == "new":
        return status
    elif change == "0":
        return ""
    else:
        if status == "down":
            return "-" + change
        else:
            return "+" + change
