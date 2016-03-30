#-*-encoding:utf-8 -*-

import requests
from bs4 import BeautifulSoup
import codecs
import pymongo
import random
import  uuid
import time
import os

from util import  InitUtil

baseUrl='http://www.mm131.com/xinggan/list_6_'

urls=[baseUrl+'{}.html'.format(str(i)) for i in range(11,13)]

def getMongodb():
	iu = InitUtil()
	mongo_addr,mongo_port=iu.getMongoClient()
	client=pymongo.MongoClient(mongo_addr,int(mongo_port))

	db=client[iu.getDataBase()]

	collec = db[iu.getCollection()]
	return collec
def getBaseDir():
	iu1 = InitUtil()
	base_dir=iu1.getDownloadPath()
	return base_dir

def mkImgDir(uid):
	file_path=uid.__str__()[:2]
	doc_path = os.path.join(getBaseDir(),file_path)
	#print doc_path
	if not os.path.isdir(doc_path):
		os.mkdir(doc_path)
		return doc_path
	else:
		return doc_path


def getPage(urls):
	collec=getMongodb()
	for url in urls:
		getDetail(url,collec)

def getDetail(url,collec):
	res = requests.get(url)
	#print res.encoding
	html =res.content
	soup = BeautifulSoup(html,'lxml')
	images= soup.select(' div.main > dl:nth-of-type(1) > dd > a > img')
	for img in images:
		src= img['src'][:-5]
		file_name=img['alt']+'.jpg'
		img_url=src+str(random.randint(1,5))+'.jpg'
		#print img_url
		get_time = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time()))
		#print get_time
		uid=uuid.uuid4()
		file_path=mkImgDir(uid)
		#print file_path
		data={
			'img_url':img_url,
			'get_time':get_time,
			'file_name':file_name,
			'file_id':uid.__str__(),
			'status':0
		}
		print data
		collec.insert_one(data)
		save_path=file_path+'/'+uid.__str__()
		saveImg(save_path,img_url)

def saveImg(file_path,img_url):
	try:
		res=requests.get(img_url,stream=True)
		img=res.content
		with open(file_path,'wb') as img_file:
			img_file.write(img)
			return
	except Exception ,e:
		print 'an error catched when download a image:',e

#col=getMongodb()

#getDetail('http://www.mm131.com/xinggan/list_6_2.html',col)
getPage(urls)
#file_path='D:\\python\\code\\crawler\\mm\\pic\\2f\\1.jpg'
#img_url='http://img1.mm131.com/pic/2398/0.jpg'
#saveImg(file_path,img_url)

#get_time = time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time()))
#print get_time
#print getBaseDir()
#uid=uuid.uuid4()
#mkImgDir(uid)
#for i in range(0,50):
#	uid=uuid.uuid4()
#	print mkImgDir(uid)
