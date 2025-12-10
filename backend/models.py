import mysql.connector
from mysql.connector import Error

# 获取数据库连接的辅助函数
def get_db_connection(db_config):
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"连接 MySQL 时出错: {e}")
        return None

# 如果不存在，初始化数据库表
def init_db(db_config):
    connection = get_db_connection(db_config)
    if connection:
        cursor = connection.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                is_favorite BOOLEAN DEFAULT FALSE
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact_methods (
                id INT AUTO_INCREMENT PRIMARY KEY,
                contact_id INT,
                type ENUM('phone', 'email', 'social', 'address') NOT NULL,
                value VARCHAR(255) NOT NULL,
                FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
            )
        ''')
        connection.commit()
        cursor.close()
        connection.close()