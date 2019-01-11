CREATE
	TABLE
		warehouse (id_ws INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		code text NOT NULL,
		name text NOT NULL UNIQUE,
		id_higher number);

CREATE
	INDEX ws_higher_idx on
	warehouse(id_higher);

CREATE
	TABLE
		contractor (id_contr INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		name text NOT NULL UNIQUE,
		inn number NOT NULL,
		address text NOT NULL);

CREATE
	TABLE
		opstatus_tbl(id_status INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		name number,
		stat_order number);

CREATE
	TABLE
		optype (id_type integer PRIMARY KEY AUTOINCREMENT NOT NULL ,
		name text NOT NULL UNIQUE);

CREATE
	TABLE
		operation (id_op INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		opdate DATE,
		code text NOT NULL,
		id_status number NOT NULL,
		optype number NOT NULL,
		id_ws number NOT NULL,
		id_contr number NOT NULL,
		opsumm number NOT NULL,
		gm_res number,
		doccount number,
		id_rack number,
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
		name text UNIQUE NOT NULL);

CREATE
	TABLE
		article (id_art INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		code text NOT NULL,
		name text not NULL UNIQUE,
		price number NOT NULL,
		unit number,
		FOREIGN KEY (unit) REFERENCES unit_tab(id_unit));

CREATE
	INDEX art_name_idx on
	article(name);

CREATE
	TABLE
		op_art (id_opart INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		id_op number NOT NULL,
		id_art number NOT NULL,
		price number NOT NULL,
		quantity number NOT NULL check(quantity > 0),
		summ number check(summ = quantity * price),
		FOREIGN KEY(id_op) REFERENCES operation(id_op),
		FOREIGN KEY(id_art) REFERENCES article(id_art));

CREATE
	INDEX opart_op_idx on
	op_art(id_op);

CREATE
	INDEX opart_art_idx on
	op_art(id_art);

COMMIT;