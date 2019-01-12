insert into {{ tablename }} (
    {% for i in fields[:-1] %}{{ i }}, {% endfor %}{{ fields[-1] }})
values (
    {% for i in value[:-1] %} {{ i }}, {% endfor %}{{ value[-1] }});