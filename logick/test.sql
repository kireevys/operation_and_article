SELECT oa.id_opart,
       oa.id_op, 
       a.id_art,
       a.name, 
       oa.price,
       a.price CURRENT_price,
       oa.quantity,
       oa.summ  
     from article a
left join op_art oa on oa.id_art = a.id_art and oa.id_op = 2
where oa.id_opart is not null
order by a.id_art;

