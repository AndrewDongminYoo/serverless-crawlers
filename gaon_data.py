import pandas as pd
import numpy as np

# Get sales data from raw gaon chart data


def sales_clean_up():
    sales = pd.read_csv('./data/gaon_chart_all.csv',
                        usecols=['selector', 'production', 'title', 'artist', 'sales_volume'])
    sales.rename(columns={'selector': 'month'}, inplace=True)
    sales = sales.astype({'month': 'int32'}, errors='raise')
    sales[['monthly_sales', 'annual_sales']
          ] = sales['sales_volume'].str.split('/', 1, expand=True)
    sales = sales.drop(columns=['sales_volume']).drop_duplicates(
        ['title', 'artist', 'month'])
    sales = sales.reindex(
        columns=['month', 'title', 'artist', 'production', 'monthly_sales', 'annual_sales'])
    sales = sales.sort_values(by=['month', 'monthly_sales'])
    return sales


def producer_clean_up():
    # Get producer data from raw gaon chart data
    producer = pd.read_csv('./data/producer_all.csv',
                           usecols=['link', 'artist', 'producer'])
    producer.rename(columns={"link": "month"}, inplace=True)
    producer = producer.astype({'month': 'int32'}, errors='raise')
    producer['artist'] = producer['artist'].str.split('|', 1).str[0]
    producer = producer.drop_duplicates(
        subset=['artist', 'producer'], keep='first')
    # Caution: Some artists has multiple agencies that has changed
    producer = producer.reindex(columns=['artist', 'month', 'producer'])
    producer = producer.sort_values(by=['artist', 'month'])
    return producer


def merge_sales_with_producer(sales: pd.DataFrame, producer: pd.DataFrame):
    # Search producer from producer dataframe and insert into new_sales
    new_sales = pd.merge(left=sales, right=producer,
                         how='left', on='artist')  # merge two dataframe
    # clean up the data
    new_sales['month_y'] = new_sales['month_y'].fillna(1800)
    new_sales['producer'] = new_sales['producer'].fillna('미상')
    new_sales = new_sales.astype({'month_y': 'int32'}, errors='raise')
    # find the producer artist belonged to before the release of the album
    new_sales[new_sales['month_x'] >= new_sales['month_y']]
    new_sales = new_sales.sort_values('month_y', ascending=True).drop_duplicates([
        'title', 'artist', 'month_x'])
    new_sales.rename(columns={'month_x': 'month'}, inplace=True)
    new_sales = new_sales.drop(columns=['month_y'])
    new_sales = new_sales.reindex(columns=[
                                  'month', 'title', 'artist', 'producer', 'production', 'monthly_sales', 'annual_sales'])
    new_sales = new_sales.sort_values(by=['month', 'monthly_sales'])
    return new_sales


def pivot_data(new_sales: pd.DataFrame):
    return pd.pivot_table(new_sales, values="monthly_sales", index=['producer', 'artist', 'title'], columns="month", aggfunc=np.sum).fillna(0)


def save_to_excel(sales_table: pd.DataFrame, new_sales: pd.DataFrame, sales: pd.DataFrame, producer: pd.DataFrame):
    # Create a Pandas Excel writer using XlsxWriter as the engine.
    writer = pd.ExcelWriter(
        './data/gaon_chart_all_cleanup.xlsx', engine='xlsxwriter')
    sales_table.to_excel(writer, sheet_name='cleanup')
    new_sales.to_excel(writer, sheet_name='sales_with_producer')
    sales.to_excel(writer, sheet_name='raw_sales')
    producer.to_excel(writer, sheet_name='raw_producer')
    writer.save()


if __name__ == '__main__':
    sales = sales_clean_up()
    producer = producer_clean_up()
    new_sales = merge_sales_with_producer(sales, producer)
    sales_table = pivot_data(new_sales)
    save_to_excel(sales_table, new_sales, sales, producer)
