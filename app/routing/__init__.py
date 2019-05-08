import json, traceback

__all__ = ('commons', 'operation', 'warehouse', 'contractor', 'article')
ok_msg = 'OK'


class HTTPException(Exception):
    pass


class MethodNotAllowed(HTTPException):
    pass


routes = dict()


def add_route(url, method):
    def decorator(fn):
        if url not in routes:
            routes.update({url: {'methods': dict()}})
        routes[url]['methods'].update({method: fn})

        def wrapper(*args, **kwargs):
            result = fn(*args, **kwargs)
            return result

        return wrapper

    return decorator


def json_decorator(fn):
    """
    Декоратор Преобразует вывод декорируемой функции к JSON
    :param fn:
    :return: fn
    """

    def wrapper(*args, **kwargs):
        """
        Выполняет декорируемую функцию и преобразвет результат к JSON
        :return: JSON
        """
        res, status = fn(*args, **kwargs)
        return json.dumps(res), status

    wrapper.__name__ = fn.__name__
    return wrapper


def exceptions_decorator(fn):
    def wrapper(*args, **kwargs):
        """
        Выполняет декорируемую функцию и, если есть исключения,
        возвращает трейсбэк и ошибку клиента (409)
        Иначе - 200
        :return: res, status http
        """
        try:
            res, status = fn(*args, **kwargs), 200
            res = res if res else ok_msg
        except MethodNotAllowed:
            res, status = traceback.format_exc(limit=1), 405
        except Exception:
            res, status = traceback.format_exc(limit=1), 409
        finally:
            return res, status

    # Для регистрации метода во фласке переименовываем враппер в декорируемую функцию
    wrapper.__name__ = fn.__name__
    return wrapper
