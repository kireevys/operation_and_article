from app.models.tables import Contractor, Warehouse
from app.models.orm import Column

import unittest
import sqlite3
import os

os.chdir('/home/kiryu/repos/kireevys/operation_and_article/app')


class TestWorkingWithDB(unittest.TestCase):

    def setUp(self):
        self.test_name = Column('name', 'TestCA1')
        self.test_inn = Column('inn', 'TestInn')
        self.test_address = Column('address', 'TestAddress')

    def test_add_contractors(self):
        contr = Contractor(self.test_name.value, self.test_inn.value, self.test_address.value)
        contr.insert()
        connect = contr.get_new_session()
        sql = f'''select * from contractor c where c.name = \'{self.test_name.value}\''''
        fetch = connect.execute(sql).fetchall()[0]
        my_contr = Contractor().__construct__(fetch)
        contr = Contractor().select_expression(name=self.test_name.value)[0]
        self.assertEqual(my_contr, contr, 'КА не совпадают')

    def test_bupdate_contr(self):
        new_name = Column('name', f'{self.test_name.value}_update')
        new_address = Column('inn', f'{self.test_address.value}_update')
        new_inn = Column('address', f'{self.test_inn.value}_update')

        contr = Contractor().select_expression(name=self.test_name.value)[0]

        new_contr = Contractor().select_expression(name=self.test_name.value)[0]

        new_contr.name.value = new_name.value
        new_contr.address.value = new_address.value
        new_contr.inn.value = new_inn.value

        new_contr.update_data()

        updating_contr = Contractor().select_expression(name=new_name.value)
        self.assertNotEqual(len(updating_contr), 0, 'В бднет такого имени')
        updating_contr = updating_contr[0]
        self.assertEqual(updating_contr, new_contr, 'КА не обновлен')

        contr.update_data()
        updating_contr = Contractor().select_expression(name=self.test_name.value)
        self.assertNotEqual(len(updating_contr), 0, 'В бднет такого имени')
        updating_contr = updating_contr[0]
        self.assertEqual(contr, updating_contr, 'КА не обновлен')

    def test_delete_contr(self):
        contr = Contractor().select_expression(name=self.test_name.value)[0]
        contr.delete_data()
        sql = f'''select * from contractor c where c.name = \'{self.test_name.value}\''''
        connect = contr.get_new_session()
        fetch = connect.execute(sql).fetchall()
        self.assertListEqual(fetch, [], 'КА не был удален')


suite = unittest.TestSuite()
suite.addTest(TestWorkingWithDB('test_add_contractors'))
suite.addTest(TestWorkingWithDB('test_delete_contr'))
result = unittest.TestResult()
suite.run(result)
