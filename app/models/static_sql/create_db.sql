CREATE
	TABLE
		warehouse (id_ws INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		code text NOT NULL,
		name text NOT NULL UNIQUE,
		level integer not null,
		id_higher integer);

CREATE
	INDEX ws_higher_idx on
	warehouse(id_higher);

CREATE
	TABLE
		contractor (id_contr INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		name text NOT NULL UNIQUE,
		code text not null,
		inn integer NOT NULL,
		address text NOT NULL);

CREATE
	TABLE
		opstatus_tbl(id_status INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		name integer,
		stat_order integer,
		on_delete integer check(on_delete between 0 and 1));

CREATE
	TABLE
		optype (id_type integer PRIMARY KEY AUTOINCREMENT NOT NULL ,
		name text NOT NULL UNIQUE);

CREATE
	TABLE
		operation (id_op INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		opdate DATE,
		code text NOT NULL,
		id_status integer NOT NULL,
		optype integer NOT NULL,
		id_ws integer NOT NULL,
		id_contr integer NOT NULL,
		opsumm integer NOT NULL,
		gm_res integer,
		doccount integer,
		id_rack integer,
		FOREIGN KEY(id_status) REFERENCES opstatus_tab(id_status),
		FOREIGN KEY(optype) REFERENCES optype(id_type),
		FOREIGN KEY(id_ws) REFERENCES warehouse(id_ws),
		FOREIGN KEY(id_contr) REFERENCES contractor(id_contr));

CREATE
	INDEX op_optype_date_idx on
	operation(opdate,
	optype);

CREATE
	INDEX op_ws_contr_idx on
	operation(id_ws,
	id_contr);

CREATE
	TABLE
		unit_tab (id_unit INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		name text UNIQUE NOT NULL,
		fullname text UNIQUE NOT NULL);

CREATE
	TABLE
		article (id_art INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		code text NOT NULL,
		name text not NULL UNIQUE,
		price integer NOT NULL,
		unit integer,
		FOREIGN KEY (unit) REFERENCES unit_tab(id_unit));

CREATE
	INDEX art_name_idx on
	article(name);

CREATE
	TABLE
		op_art (id_opart INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		id_op integer NOT NULL,
		id_art integer NOT NULL,
		price integer NOT NULL,
		quantity integer NOT NULL check(quantity > 0),
		summ integer check(summ = quantity * price),
		FOREIGN KEY(id_op) REFERENCES operation(id_op) ON DELETE CASCADE,
		FOREIGN KEY(id_art) REFERENCES article(id_art));

CREATE
	INDEX opart_op_idx on
	op_art(id_op);

CREATE
	INDEX opart_art_idx on
	op_art(id_art);

--First data
INSERT INTO opstatus_tbl (name, stat_order, on_delete) values ('Новая', 1, 1);
INSERT INTO opstatus_tbl (name, stat_order, on_delete) values ('Формируемая', 2, 1);
INSERT INTO opstatus_tbl (name, stat_order, on_delete) values ('Сформированная', 3, 1);
INSERT INTO opstatus_tbl (name, stat_order, on_delete) values ('Закрытая', 4, 0);
INSERT INTO opstatus_tbl (name, stat_order, on_delete) values ('Отправленая', 5, 0);
INSERT INTO opstatus_tbl (name, stat_order, on_delete) values ('Подтвержденная', 6, 0);
INSERT INTO opstatus_tbl (name, stat_order, on_delete) values ('Отмененная', 6, 1);

INSERT INTO optype (name) values ('Заказ');
INSERT INTO optype (name) values ('От поставщика');
INSERT INTO optype (name) values ('На гипермаркете');
INSERT INTO optype (name) values ('На у дома');
INSERT INTO optype (name) values ('На косметике');
INSERT INTO optype (name) values ('На аптеке');
INSERT INTO optype (name) values ('Складская');
INSERT INTO optype (name) values ('Приход');

INSERT INTO warehouse (name, code, id_higher, level) values ('Сеть ММ', '100000', null, 1);
INSERT INTO warehouse (name, code, id_higher, level) values ('Сеть МК', '200000', null, 1);
INSERT INTO warehouse (name, code, id_higher, level) values ('Сеть МА', '300000', null, 1);
INSERT INTO warehouse (name, code, id_higher, level) values ('Сеть ГМ', '400000', null, 1);
INSERT INTO warehouse (name, code, id_higher, level) values ('Краснодар ММ', '110000', 1, 2);
INSERT INTO warehouse (name, code, id_higher, level) values ('Кореновск ММ', '120000', 1, 2);
INSERT INTO warehouse (name, code, id_higher, level) values ('Краснодар МК', '210000', 2, 2);
INSERT INTO warehouse (name, code, id_higher, level) values ('Кореновск МК', '220000', 2, 2);
INSERT INTO warehouse (name, code, id_higher, level) values ('Краснодар МА', '310000', 3, 2);
INSERT INTO warehouse (name, code, id_higher, level) values ('Кореновск МА', '320000', 3, 2);
INSERT INTO warehouse (name, code, id_higher, level) values ('Краснодар ГМ', '410000', 4, 2);
INSERT INTO warehouse (name, code, id_higher, level) values ('Кореновск ГМ', '420000', 4, 2);
INSERT INTO warehouse (name, code, id_higher, level) values ('Рис', '420001', 1, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Апельсин', '420002', 1, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Перкресток', '420003', 1, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Табрис', '420004', 1, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Органик', '420005', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Натура', '420006', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Красота', '420007', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Леди', '420008', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Айболит', '420009', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Красный крест', '420010', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Доктор', '420011', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Здоровье', '420013', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Миллениум', '420012', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Салют', '420014', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Ола', '420015', 4, 3);
INSERT INTO warehouse (name, code, id_higher, level) values ('Привет', '420016', 4, 3);
INSERT INTO CONTRACTOR (name, code, inn, address ) values ('Рога и копыта', '0001', 6449013711, 'У дедушки');
INSERT INTO CONTRACTOR (name, code, inn, address ) values ('Копыта и Рога', '0002', 6449077777, 'У бабушки');

INSERT INTO unit_tab (fullname, name) values ('кг', 'килограмм');

INSERT INTO unit_tab (fullname, name) values ('л','литр');

INSERT INTO unit_tab (fullname, name) values ('уп','упаковка');

INSERT INTO unit_tab (fullname, name) values ('шт','штука');

INSERT INTO unit_tab (fullname, name) values ('бут','бутылка');

COMMIT;