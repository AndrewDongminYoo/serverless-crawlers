from datetime import datetime


def set_queries(queries: dict):
    result = "?"
    for key, value in queries.items():
        result += key + "=" + value + "&"
    return result[:-1]


def date_to_string(dts: datetime, fmt: str):
    if fmt == 'day':
        return dts.strftime('%Y%m%d')
    elif fmt == 'month':
        return dts.strftime('%Y%m')
    elif fmt == 'year':
        return str(dts.year)
