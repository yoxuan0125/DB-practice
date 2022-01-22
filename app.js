const express = require("express");
const app=express();
const ejs=require("ejs");
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const Student=require("./models/student");
const methodOverride = require("method-override");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set("view engine","ejs");

//connect to mongoDB
mongoose
  .connect("mongodb://localhost:27017/student")
  .then(()=>{
    console.log("Connented to MongoDB");
  })
  .catch((err)=>{
    console.log("Coonection Failed.");
    console.log(err);
  });

app.get("/",(req,res)=>{
  res.send("This is homepage.")
});

app.get("/students",async(req,res)=>{
  let data=await Student.find();
  res.render("students.ejs",{data});
});


app.get("/students/:id",async(req,res)=>{
  let { id }=req.params;
  try{
    let data=await Student.findOne({id});
    if (data!==null){
      res.render("studentPage.ejs",{data});
    }else{
      res.send("Cannot find this student.");
    }
  }catch(e){
    res.send("Error!!");
    console.log(e);
  }
});

app.get("/students/insert",(req,res)=>{
  res.render("studentInsert.ejs");
});

app.post("/students/insert",(req,res)=>{
  let {id, name, age, merit, other}=req.body;
  let newStudent= new Student({id, name, age, scholarship:{merit,other}});
  newStudent.save().then(()=>{
    console.log("Student accepted.");
    res.render("accepted.ejs");
  }).catch(e=>{
    console.log("Student not accepted.");
    console.log(e);
    res.render("reject.ejs");
  });
});

app.get("/students/edit/:id",async(req,res)=>{
  let{id}=req.params;
  try{
    let data=await Student.findOne({id});
    if(data!==null){
      res.render("edit.ejs",{data});
    }else{
      res.send("Cannot find this student.");
    } 
  }catch{
    res.send("Error!!");
  }
});

app.put("/students/edit/:id",async(req,res)=>{
  let {id,name,age,merit,other}=req.body;
  try{
    let d=await Student.findOneAndUpdate(
    {id},
    {id,name,age,scholarship:{merit,other}},
    {
      new:true,
      runValidators:true,
    });
    res.redirect(`/students/${id}`);
  }catch{
    res.render("Error with updating data. Please check.");
  }
});

app.get("/*",(req,res)=>{
  res.status(404);
  res.send("Not allowed.");
});

app.listen(3000,()=>{
  console.log("Server is running on port 3000.")
});