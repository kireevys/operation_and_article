from app.models.tables import Contractor, Warehouse

import unittest
import sqlite3
import os


class TestStringMethods(unittest.TestCase):

    def test_add_contractors(self):
        test_name = 'TestCA1'
        test_inn = 'TestInn'
        test_address = 'TestAddress'
        contr = Contractor(test_name, test_inn, test_address)
        contr.insert()
        connect = contr.get_new_session()
        sql = f'''select * from contractor c where c.name = \'{test_name}\''''
        fetch = connect.execute(sql).fetchall()
        print(fetch)


if __name__ == '__main__':
    open('op_and_art.db')
    # unittest.main()
