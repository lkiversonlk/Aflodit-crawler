#-*- encoding:utf-8 -*-

import  ConfigParser
import os

class InitUtil():

	def __init__(self):
		self.cf=ConfigParser.ConfigParser()
		self.cf.read('config.ini')

	def getDownloadPath(self):
		#print 'GET DOWNLOAD DIR......'
		base_dir =self.cf.get('path','download')
		return base_dir
	def getMongoClient(self):
		client= self.cf.get('db','mongodb')
		port=self.cf.get('db','mongoport')
		return client,port
	def getDataBase(self):
		return self.cf.get('db','db_name')
	def getCollection(self):
		return self.cf.get('db','collect_name')


if __name__=='__main__':
	count =0
	path='D:\\python\\code\\crawler\\mm\\pic'
	for root, dirs, files in os.walk(path):
		print files
		fileLength = len(files)
		if fileLength != 0:
			count = count + fileLength
	print count
