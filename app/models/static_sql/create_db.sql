CREATE
	TABLE
		warehouse (id_ws INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		code text NOT NULL,
		name text NOT NULL UNIQUE,
		level number not null,
		id_higher integer);

CREATE
	INDEX ws_higher_idx on
	warehouse(id_higher);

CREATE
	TABLE
		contractor (id_contr INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		name text NOT NULL UNIQUE,
		level number not null,
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
		name text UNIQUE NOT NULL);

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

COMMIT;