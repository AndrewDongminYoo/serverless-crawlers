class GlobalChart(object):
    album_image = ''
    album_name = ''
    artist_name = ''
    distribute_company = ''
    producing_company = ''
    rank = "101"
    rank_status = '-'
    # total_counts = 0
    song_title = ''

    def __init__(self, data: dict):
        self.album_image = "https://circlechart.kr" + data['ALBUMIMG']
        self.album_name = data['Album']
        self.artist_name = data['Artist']
        self.distribute_company = data['CompanyDist']
        self.producing_company = data['CompanyMake']
        self.rank = data['Rank']  # 랭킹
        self.rank_status = data['RankStatus']  # 전월대비 (+1)
        # self.total_counts = data[""]
        self.song_title = data['Title']  # 곡명


class AlbumChart(object):
    album_image = ''
    album_name = ''
    artist_name = ''
    distribute_company = ''
    # producing_company = ''
    rank = "101"
    rank_status = '-'
    total_counts = 0
    # song_title = ''

    def __init__(self, data: dict):
        self.album_image = "https://circlechart.kr" + data['FILE_NAME']
        self.album_name = data['ALBUM_NAME']
        self.artist_name = data['ARTIST_NAME']
        self.distribute_company = data['de_nm']
        # self.producing_company = data['']
        self.rank = data['SERVICE_RANKING']  # 랭킹
        self.rank_status = rank_status(data['RankStatus'], data['RankChange'])  # 전월대비 (1up)
        self.total_counts = data["Total_CNT"]  # 앨범 판매량
        # self.song_title = data['']


def as_chart(data: dict):
    if "Total_CNT" in data.keys():
        return AlbumChart(data)
    elif "Title" in data.keys():
        return GlobalChart(data)


def as_chart_array(array: list):
    return [as_chart(x).__dict__ for x in array]


def rank_status(status: str, change: str):
    if status == "new":
        return status
    elif change == "0":
        return ""
    else:
        if status == "down":
            return "-" + change
        else:
            return "+" + change
