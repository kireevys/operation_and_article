import logging
from config import db_log, application_log

full_path = 'logs/'
db_log, application_log = full_path + db_log, full_path + application_log
end = '||'


def setup_logger(logger_name, log_file, level=logging.INFO,
                 format='%(name)-6s: [%(module)s/%(funcName)-20s |LINE:%(lineno)-3d]# %(levelname)-8s [%(asctime)s]:  %(message)-90s ||'):
    """
    Функция настраивает логгер который пишет в переданный файл
    :param logger_name:
    :param log_file:
    :param level:
    :return: None
    """
    # Просто на всякий случай проверим, что в конфиге нет опечатки
    # Автозаказные привычки
    if not log_file.endswith('.log'):
        log_file = f'{log_file}.log'
    new_logger = logging.getLogger(logger_name)
    formatter = logging.Formatter(format)
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)

    new_logger.setLevel(level)
    new_logger.addHandler(file_handler)
    new_logger.addHandler(stream_handler)
    return new_logger


db_logger = setup_logger('db', db_log)
test_logger = setup_logger('test', application_log)
debug_logger = setup_logger('debug', f'{full_path}debug.log')

# debug_logger.info('Loggers activated')
