from flask import Flask
from flask_cors import CORS
from backend.config import db_config
from backend.models import init_db
from backend.routes import register_routes

app = Flask(__name__)
CORS(app)
app.config['db_config'] = db_config  # 传递配置到路由

# 初始化数据库
init_db(db_config)

# 注册路由
register_routes(app)

if __name__ == '__main__':
    app.run(debug=True)