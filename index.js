const express=require('express');
const path= require('path');
//The Path module provides a way of working with directories and file paths.
const port=5000;
const sender= require('./sender');


const db=require('./config/mongoose');
const model= require('./models/avalanche.js');
var multer= require('multer');
var csv= require('csvtojson');  
var bodyParser  = require('body-parser'); 

const app= express();// create an instance /object from express

app.set('view engine', 'ejs'); //setting our view engine as ejs
app.set('views', path.join(__dirname, 'views'));//joining path to views
//static folder  
app.use(express.static(path.resolve(__dirname,'public'))); 
//app.use('/', require('./routes'));//using our routes
app.use(express.urlencoded()); //middleware for parser- preprocessing data
app.use(express.static('assets')); //middleware for static pages- read em
app.use(bodyParser.urlencoded({extended:false})); 


//multer for storing the form data 
var storage = multer.diskStorage({  
    destination:function(req,file,cb){  
    cb(null,'./public/uploads');  
    },  
    //original name??? we want variable
    filename:function(req,file,cb){  
    cb(null,file.originalname);  
    }  
    });

    var count = 0 ;

var uploads = multer({storage: storage}); 

//get and post functions to render pages
//dis rendering home wid the data
app.get('/',(req,res)=>{  
    model.find((err,data)=>{  
    if(err){  
    console.log(err);  
    }else{  
    if(data!=''){  
    res.render('home',{data:data});  
    }else{  
    res.render('home',{data:''});  
    }  
    }  
    });  
    }); 

//this is adding the data via a json object array
var temp ;  

app.post('/',uploads.single('csv'), function(req,res){  
console.log(req.file.filename);
console.log(req.file.length);
count= req.file.length;
//convert csvfile to jsonArray     
csv()  
.fromFile(req.file.path)  
.then(function(jsonObj){  

console.log('there there');
for(var x=0;x<jsonObj;x++){  
temp = parseFloat(jsonObj[x].sector_id)  
jsonObj[x].sector_id = temp;  
temp = parseFloat(jsonObj[x].avalanche_axis)  
jsonObj[x].avalanche_axis = temp;  
temp = parseFloat(jsonObj[x].forecast1)  
jsonObj[x].forecast1 = temp;  
temp = parseFloat(jsonObj[x].forecast2) 
jsonObj[x].forecast2 = temp;  
temp = parseFloat(jsonObj[x].forecast3)  
jsonObj[x].forecast3 = temp;  
count++;
console.log(count);
} 

//insertmany is used to save bulk data in database.
//saving the data in collection(table)
model.insertMany(jsonObj,function(err,data){ 
    count=jsonObj.length;
    console.log(jsonObj.length);
if(err){  
console.log(err);  
}else{  
res.redirect('/');  
}  
});  
});  
}); 

app.listen(port, function(err){
    if(err){
        console.log("errorrrr ", err);
    }
    console.log('Server running on port: ', port);
})
