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
		operation (
		id_op INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		opdate DATE,
		code text NOT NULL,
		id_status integer NOT NULL,
		optype integer NOT NULL,
		id_ws integer NOT NULL,
		id_contr integer NOT NULL,
		opsumm float(15,2) NOT NULL,
		gm_res integer,
		doccount integer,
		id_rack integer,
		FOREIGN KEY(id_status) REFERENCES opstatus_tab(id_status),
		FOREIGN KEY(optype) REFERENCES optype(id_type),
		FOREIGN KEY(id_ws) REFERENCES warehouse(id_ws),
		FOREIGN KEY(id_contr) REFERENCES contractor(id_contr)
	);
		--FOREIGN KEY(id_op) REFERENCES op_art(id_op) ON DELETE CASCADE;

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
		op_art (
		id_opart INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		id_op integer REFERENCES operation(id_op) ON DELETE CASCADE,
		id_art integer NOT NULL,
		price integer NOT NULL,
		--TODO: Не работает каскад от операций
		quantity integer NOT NULL check(quantity > 0),
		summ float(7,2),
		FOREIGN KEY(id_art) REFERENCES article(id_art) );

CREATE
	INDEX opart_op_idx on
	op_art(id_op, id_art);

-- create CONSTRAINT op_art FOREIGN KEY(id_op) REFERENCES operation(id_op) ON DELETE CASCADE;


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

INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (1, 'Сеть ММ', '100000', null, 1);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (2, 'Краснодар ММ', '110000', 1, 2);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (3, 'Рис', '420001', 2, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (4, 'Апельсин', '420002', 2, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (5, 'Кореновск ММ', '120000', 1, 2);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (6, 'Перкресток', '420003', 5, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (7, 'Табрис', '420004', 5, 3);

INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (8, 'Сеть МК', '200000', null, 1);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (11, 'Краснодар МК', '210000', 8, 2);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (12, 'Кореновск МК', '220000', 8, 2);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (17, 'Органик', '420005', 11, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (18, 'Натура', '420006', 11, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (19, 'Красота', '420007', 12, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (20, 'Леди', '420008', 12, 3);

INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (9, 'Сеть МА', '300000', null, 1);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (13, 'Краснодар МА', '310000', 9, 2);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (14, 'Кореновск МА', '320000', 9, 2);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (21, 'Айболит', '420009', 13, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (22, 'Красный крест', '420010', 13, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (23, 'Доктор', '420011', 14, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (24, 'Здоровье', '420013', 14, 3);

INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (10, 'Сеть ГМ', '400000', null, 1);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (15, 'Краснодар ГМ', '410000', 10, 2);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (16, 'Кореновск ГМ', '420000', 10, 2);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (25, 'Миллениум', '420012', 15, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (26, 'Салют', '420014', 15, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (27, 'Ола', '420015', 16, 3);
INSERT INTO warehouse (id_ws, name, code, id_higher, level) values (28, 'Привет', '420016', 16, 3);

INSERT INTO CONTRACTOR (name, code, inn, address ) values ('Рога и копыта', '0001', 6449013711, 'У дедушки');
INSERT INTO CONTRACTOR (name, code, inn, address ) values ('Копыта и Рога', '0002', 6449077777, 'У бабушки');

INSERT INTO unit_tab (fullname, name) values ('кг', 'килограмм');
INSERT INTO unit_tab (fullname, name) values ('л','литр');
INSERT INTO unit_tab (fullname, name) values ('уп','упаковка');
INSERT INTO unit_tab (fullname, name) values ('шт','штука');
INSERT INTO unit_tab (fullname, name) values ('бут','бутылка');

insert into article (code, name, price, unit) values ('1', 'Шоколадка', 34, 4);
insert into article (code, name, price, unit) values ('2', 'Чай', 32, 4);
insert into article (code, name, price, unit) values ('3', 'Печеньки', 34, 4);
insert into article (code, name, price, unit) values ('4', 'Кофе', 200, 4);
insert into article (code, name, price, unit) values ('5', 'Молоко', 44.9, 4);
insert into article (code, name, price, unit) values ('6', 'Сок', 54.5, 4);
insert into article (code, name, price, unit) values ('7', 'Зефир', 23.7, 4);
insert into article (code, name, price, unit) values ('8', 'Чтототам', 999.99, 4);
