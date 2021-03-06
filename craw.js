/**
 * Created by jerry on 3/30/16.
 */

var mongoose = require("mongoose");
var fs = require("fs");
var http = require("http");
var path = require("path");
var uuid = require("node-uuid");
var easyimg = require("easyimage");

function usage(){
    console.log("usage: node craw.js <file>");
}
var argv = process.argv;

if(argv.length != 3){
    usage();
    process.exit(-1);
}

try{
    var configPath = path.join(process.env.HOME, ".aflodit.json");
    var configuration = require(configPath);
    mongoose.connect(configuration.mongo.mongourl + "/" + configuration.mongo.db);
}catch (error){
    console.log("error parsing configuration", error);
    process.exit(-1);
}


var Schema = mongoose.Schema;

var imageScema = new Schema({
    file_name : {
        type : String
    },
    get_time : {
        type : Number
    },
    file_id : {
        type : String
    },
    status : {
        type : Number
    },
    img_url : {
        type : String
    },
    web_info : {
        type : String
    },
    page_url : {
        type : String
    }
});

var imageModel = mongoose.model("image", imageScema);


var fd = fs.openSync(path.resolve(argv[2]), "r");

var bufferSize = 1024;
var buffer = new Buffer(bufferSize);

var left = "";

getLine(fd);

function processline(line, callback){
    var info = JSON.parse(line);
    var id = uuid.v4();

    var title = info.result.img_title;
    var result = ["女", "美", "性感", "胸", "腿", "诱惑"].filter(function(key){
        if(title.indexOf(key) != -1){
            return true;
        }
        return false;
    });

    if(result.length == 0){
        console.log("jump " + info.result.img_title);
        return callback();
    }

    imageModel.find({img_url : info.result.img_url}).exec(function(error, docs){
        if(error){
            callback();
        }else{
            if(!docs || docs.length == 0){
                var filePath = path.join(configuration.folder, id.substr(0,2), id);
                var dir = path.dirname(filePath);
                try{
                    fs.mkdirSync(dir);
                }catch (error){

                }

                var file = fs.createWriteStream(filePath);
                var request = http.get(info.result.img_url, function(response){
                    response.on('data', function(data){
                        file.write(data);
                    });
                    response.on("end", function(){
                        file.end();
                        var data = new imageModel({
                            file_name : info.result.img_title,
                            file_id : id,
                            status : 0,
                            img_url : info.result.img_url,
                            web_info : info.result.kind,
                            page_url : info.result.page_url
                        });


                        data.save(function(err, doc){
                            if(err){
                                console.log(err);
                            }else{
                                console.log("processing " + doc.img_url);
                                //get the image from web
                                return callback(null);
                            }
                        });
                    })
                });
                request.on("error", function(error){
                    console.log(error);
                    return callback();
                })
            }else{
                console.log(info.result.img_title + " 已经存在了");
                callback();
            }
        }
    });
    /**
     * url : image url
     * updatetime : long
     * result : {
     *    kind : image type
     *    title : image name
     *    url : page url
     *    pic : image_url
     * }
     */

}




function getLine(fd){

    var read;
    read = fs.readSync(fd, buffer, 0, bufferSize, null);
    if(read !== 0) {
        left += buffer.toString('utf-8', 0, read);
        var end;

        function getNextline(){
            end = left.indexOf("\n");
            if(end !== -1){
                processline(left.substring(0, end), function(){
                    left = left.substring(end + 1);
                    getNextline();
                });
            }else{
                getLine(fd);
            }
        }
        getNextline();
    }else{
        processline(left, function(){});
    }
}
