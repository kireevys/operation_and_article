from app.config import db_path
from app.models.dbapi_tools import APITools
import os


create_db_sql_path = f'{os.getcwd()}/static_sql/create_db.sql'

db = APITools(db_path)
db.execute_sql_file(create_db_sql_path)
