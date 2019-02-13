SELECT operation.id_op,
       operation.opdate,
       operation.code,
       operation.id_status,
       opstatus_tbl.name,
       operation.optype,
       optype.name,
       operation.id_ws,
       operation.id_contr,
       operation.opsumm,
       operation.gm_res,
       operation.doccount,
       operation.id_rack,
       contractor.name,
       contractor.inn,
       warehouse.name
     from operation
join contractor using(id_contr)
join warehouse USING(id_ws)
join opstatus_tbl USING(id_status)
join optype on optype.id_type = operation.optype;