from routing.server import app
from models.tables import Articles

# if __name__ == '__main__':
#     op = OpArt(id_op=1, id_art=1,quantity=10)
#     op.insert()


if __name__ == '__main__':
    app.run()
