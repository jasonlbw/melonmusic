"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");
const qstring = require("querystring");
const _ = require("underscore");

const musicList = [{
    id: '1',
    name: '演员',
    singer: '薛之谦',
    isHighRate: true,

}, {
        id: '2',
        name: '宫保鸡丁',
        singer: '陶喆',
        isHighRate: true,

    }, {
        id: '3',
        name: '扒马褂',
        singer: '郭德纲',
        isHighRate: false,

    }];

const regex_edite = /^\/edite\/(\d{1,6})$/;
const regex_remove = /^\/remove\/(\d{1,6})?$/;


const server = http.createServer((req, res) => {
    let urlObj = url.parse(req.url);
    let pathname = urlObj.pathname;
    let method = req.method;

    if (pathname === "/") {
        fs.readFile("./melon.html", "utf8", function (err, data) {
            if (err) {
                return res.end(err.message);
            }
            let compiled = _.template(data);
            let htmlStr = compiled({ musicList });

            res.writeHead(200, {
                'Content-Type': "text/html"
            });
            res.end(htmlStr);
        });
    } else if (method === "GET" && pathname === "/add") {
        fs.readFile("./add.html", "utf8", function (err, data) {
            if (err) {
                return res.end(err.message);
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            })
            res.end(data);
        });
    } else if (method === "POST" && pathname === "/add") {
        recievePostData(req, function (requestBody) {
            let musicInfo = musicList.find(item => item.id == requestBody.id);

            requestBody.isHighRate = requestBody.isHighRate === "1" ? true : false;

            if (musicInfo) {
                return res.end("the music is already exists");
            }

            musicList.push(requestBody);
            res.end("success");
        })
    } else if (method === "GET" && regex_remove.test(pathname)) {
        let m_id = pathname.match(regex_remove)[1];

        let isexists = musicList.find(item => item.id === m_id);
        if (isexists) {

            let index = musicList.findIndex(m => m.id === m_id);
            musicList.splice(index, 1);
        }

        res.end("remove success");
    } else if (method === "GET" && regex_edite.test(pathname)) {
        fs.readFile("./edite.html", "utf8", function (err, data) {
            if (err) {
                return res.edn(err.message);
            }

            let m_id = pathname.match(regex_edite)[1];
            let item = musicList.find(item => item.id === m_id);

            if (!item) {
                return res.end("the music is not exists");
            }

            let compiled = _.template(data);
            let htmlStr = compiled({ item });

            res.writeHead(200, {
                'Content-Type': "text/html,charset=utf8"
            });
            res.end(htmlStr);
        });
    } else if (method === "POST" && pathname === "/edite") {
        recievePostData(req, function (requestBody) {
            let index = musicList.findIndex(item => item.id === requestBody.id);

            if (index < 0) {
                return res.end("the music is not exists,so can't edite");
            }

            musicList[index].id = requestBody.id;
            musicList[index].name = requestBody.name;
            musicList[index].singer = requestBody.singer;
            musicList[index].isHighRate = requestBody.isHighRate === "1";

            //res.end("edite success");

            //301：永久重定向（浏览器会缓存），302：临时重定向（浏览器不会缓存）
            res.writeHead(302, {
                "Location": "/"
            });
            res.end();
        });
    }

});

server.listen(3000, function () {
    console.log("server is listen at 3000");
});


function recievePostData(req, callback) {
    let data = "";
    req.on("data", function (chunk) {
        data += chunk;
    });
    req.on("end", function () {
        callback(qstring.parse(data));
    });
}