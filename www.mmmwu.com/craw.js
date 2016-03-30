/**
 * Created by jerry on 3/30/16.
 */

var mongoose = require("mongoose");
var fs = require("fs");
var http = require("http");
var path = require("path");

var lineReader = require("readline").createInterface({
    input : fs.createReadStream("./pic_one.source")
});
var uuid = require("node-uuid");

try{
    var configPath = path.join(process.env.HOME, "crawler", "config.json");
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

lineReader.on("line", function(line){
    lineReader.pause();
    var info = JSON.parse(line);

    var id = uuid.v4();

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
    var data = new imageModel({
        file_name : info.result.title,
        get_time : parseInt(info.updatetime),
        file_id : id,
        status : 0,
        img_url : info.result.pic,
        web_info : info.result.kind,
        page_url : info.result.url
    });

    data.save(function(err, doc){
        if(err){
            console.log(err);
        }else{
            console.log("processing " + doc.img_url);
            //get the image from web
            var filePath = path.join(configuration.folder, id.substr(0,2), id);
            var dir = path.dirname(filePath);
            try{
                fs.mkdirSync(dir);
            }catch (error){

            }

            var file = fs.createWriteStream(filePath);
            var request = http.get(doc.img_url, function(response){
                response.pipe(file);
                lineReader.resume();
            });
        }
    });
});


