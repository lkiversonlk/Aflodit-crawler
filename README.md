# Aflodit-crawler 规范

标签（空格分隔）： crawler 规范

---

前言
-------
本文规定了Aflodit-crawler爬取图片需要的信息和存取方式。

#### 爬取流程
1. 读取配置文件
配置文件采用json格式，目前有两个字段：
    * folder
    图片存放根目录
    * mongo
    mongo数据库连接信息，子对象包括：
        * mongourl
        mongo数据库地址
        * db
        使用的database 
        * imgCollection
        图片摘要信息collection

1. 爬取图片
爬虫启动时，默认读取 ~/crawler/config.json文件（方便统一配置），每张图片爬取到之后，首先为该文件生成一个file_id (uuid v4版本)，然后向mongo[db][imgCollection]中插入一条记录，记录格式如下：

    | 字段名称  | 字段含义    | 字段格式 |
    |---        |---          |----      | 
    | file_name | 图片原名称  | 字符串 |
    | get_time  | 抓取时间    | 标准Unix时间（自1970年来毫秒数) |
    | file_id   | 图片uuid    | uuid v4 |
    | status    | 审核状态    | int，初值为0，具体对应含义参见附表 |
    | web_info  | 网页相关信息| string，逗号分隔类型 |
    | img_url   | 图片url地址 | url |
    
如果记录生成成功，抓取图片文件，并且按照生成的file_id，取前两位作为子目录名称，file_id作为文件名，存储在配置文件指定的文件夹下。

    假设配置指定目录是/mydata/image, 图片uuid为8d155ef5-c9ee-4ec8-964d-617c7fffd132, 则最后图片存储为/mydata/image/8d/8d155ef5-c9ee-4ec8-964d-617c7fffd132。
    
#### 代码上传规范
请以url作为文件夹名称将爬虫添加到项目内，例如爬取www.test.com/pic/people路径的，请上传到www.test.com/pic/people路径内，同时请在执行目录下贴上run.sh脚本，方便自动执行爬虫。

#### 附表

1. 图片status字段对应表

| 值 | 含义 | 解释 |
|----|------|------|
| 0  | 未审核 | 初始状态，表示图片还未经审核 |
| 1 | 正在审核 | 图片正在被某一管理员取出审核中 |
| 2 | 合格 | 合格图片指三点均有正常衣服穿戴 |
| 3 | 遮挡 | 未有正常衣服穿戴，但是有物品遮挡 |
| 4 | 半露 | 未有正常衣物穿戴，但是通过身体或者角度遮挡 |
| 5 | 背面裸露 | 背面图片 |
| 6 | 正面裸露 | 正面图片 |




