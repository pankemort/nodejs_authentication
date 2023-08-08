// Basic node js functions include readfile write file import 

// import http from "http";
// import gfName from "./features.js";

// // const http = require("http");
// // const gfffName = require("./features")

// console.log(gfName)
// const server = http.createServer((req, res) =>{
//     console.log(req.url)
//     res.end("hello")
//     console.log("server ")
// });

// server.listen(5000, () =>{
//     console.log("server is working11");
// })
import mongoose from "mongoose";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { name } from "ejs";
import bcrypt from "bcrypt";


mongoose.connect("mongodb://127.0.0.1:27017" , {
    dbName: "backend",

}).then(() =>
    console.log("database connected")).catch((e)=> console.log(e));

const UserSchema = mongoose.Schema({
    name: String,
    email: String,
    password:String,
});
const Users = mongoose.model("Users" , UserSchema);



//to get the static files from public folder where we can make files for photos videos etc
//
// const users =[];
const app = express();
//middleware to excess the file or path
app.use(express.urlencoded({ extended:true}))
app.use(express.static(path.join(path.resolve() , "public")));
app.use(cookieParser());
app.set("view engine", "ejs");

const Authenticated = async (req ,res, next)=>{
    const {token} = req.cookies;
    if(token){

       const decoded =  jwt.verify(token ,"fkszsddjf" );
       req.user1  = await Users.findById(decoded._id);
       next();
    }
  else{
    res.render("login");
  }
}

app.get("/", Authenticated, async(req ,res) => {
    console.log(req.user1)
  
     await res.render('logout' ,{name : req.user1.name});   
    // res.sendFile("index.html");
    // res.end("heleo")
    // const pathlocation = path.resolve();
    // console.log(path.join(pathlocation , "lol"))

});
// app.get("/success", (req ,res) => {
//     res.render("success.ejs");

// });
app.get("/register" , async (req ,res) =>{
    res.render('register')

})
// app.post("/register" , async (req ,res) =>{
//     res.render('register')

// })
app.get('/login' , (req ,res) =>{
    res.render('login')
})
app.post("/register" , async (req,res)=>{
    // console.log(req.body)
    const {name, email, password} = req.body;
    let user = await Users.findOne({email});
    if(user){
       return res.redirect("/login");
    }
    const hashedpw = await bcrypt.hash(password ,10);

  user = await Users.create({ 
    name,
    email , 
    password:hashedpw,   }
       
    )
    const token = jwt.sign({_id: user._id}, "fkszsddjf"); // to create an unique id of the user


    res.cookie("token" ,token   ,{
        httpOnly : true,
        expires : new Date(Date.now() + 60 * 1000),
    })
    res.redirect("/");
})


app.post('/login' , async (req ,res) =>{
    const {email , password} = req.body
    let user = await Users.findOne({email})

    if(!user){
         return res.redirect('/register')
    }
    const ispasswordsame = bcrypt.compare(password,user.password);
    if(!ispasswordsame){
        return res.render("login" , {message:"Incorrect password"}) 
        const token = jwt.sign({_id: user._id}, "fkszsddjf"); // to create an unique id of the user


        res.cookie("token" ,token   ,{
            httpOnly : true,
            expires : new Date(Date.now() + 60 * 1000),
        })
        res.redirect("/");
    }

})
app.get("/logout", (req ,res) =>{
    res.cookie("token" ,null,{
        httpOnly : true,
        expires : new Date(Date.now()),
    })
    res.redirect("/");
 
})
app.listen(5000, () =>{
    console.log("server is working fine ")
})