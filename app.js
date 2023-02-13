//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
} 



const day = date.getDate();




const Item = mongoose.model("Item",itemSchema);

const List = mongoose.model("List",listSchema);

const wakeUp = new Item({name: "Wake Up"});
const eat = new Item({name: "Eat"});
const code = new Item({name: "Code"});
const sleep = new Item({name: "Sleep"});

const defaulItems = [wakeUp,eat,code,sleep];


app.get("/", function(req, res) {

  Item.find({},(err,items)=>{

    if(items.length===0){
      Item.insertMany(defaulItems,(err)=>{
        if(err) console.log(err);
        res.redirect("/");
      });
    }
   
    else{res.render("list", {listTitle: day, newListItems: items});}
    
  })


  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});
  

  if(listName === day){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
    
  }
});

app.post("/delete",(req,res)=>{

  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName===day){

    Item.findByIdAndRemove(checkedItemID,(err)=>{
      if(err) console.log(err);
      else res.redirect("/");
    });
    

  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, (err,foundList)=>{
      if(err) console.log(err);
      else res.redirect("/"+listName);
    });
  }
  
});


app.get("/:customListName",(req,res)=>{

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},(err,foundList)=>{
    if(err) console.log(err);

    else if(!foundList){

      const list = new List({
        name: customListName,
        items: []
      });

      list.save();
      res.redirect(`/${customListName}`)
    }

    else {
      
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
    }
  })

  

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
