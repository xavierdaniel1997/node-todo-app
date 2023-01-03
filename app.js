const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();


const items = [];
const workItems = [];

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin-danielXavier:test123@cluster0.qphrygy.mongodb.net/todolistDB',{useNewUrlParser:true});

const itemsSchema = {
    name : String
};

const Item = mongoose.model('Item',itemsSchema);

const Item1 = new Item({
    name : "Welcome to the todo-List"
});
const Item2 = new Item({
    name : "hit the + icon to add the items"
});

const defaultItems = [Item1,Item2,];

const listSchema = {
    name : String,
    items : [itemsSchema]
}
const List = mongoose.model("List",listSchema)

app.get('/',(req,res)=>{

    Item.find({},function(err,foundItem){

        // console.log(foundItem);

        if (foundItem.length === 0) {
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("successfully conneted to DB");
                }
            });
            res.redirect('/')
        } else {
            res.render("list",{ listTitle: "Today",newListItems: foundItem});
        }
        
    })

});
app.get('/:customListName',function(req,res){
   const customListName = _.capitalize(req.params.customListName);

   List.findOne({name: customListName},function(err,foundList){
    if (!err) {
        if (!foundList){
            const list = new List({
                name : customListName,
                items : defaultItems
               });
               list.save();
               res.redirect('/' + customListName)
        } else {
            res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
        }
    }
   })
 
});

app.post('/',(req,res)=>{
   const itemName = req.body.newItem;
   const listName = req.body.list;
   
   const item = new Item({
    name : itemName
   });
   if (listName === "Today") {
    item.save();
    res.redirect('/');
   }else{
    List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect('/'+listName)
    })
   }
  
});
app.post('/delete',(req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log('Successfully deleted');
                res.redirect('/')
            }
            
        });
    }else {
        List.findOneAndUpdate({name : listName},{$pull:{items:{_id: checkedItemId}}},function(err,foundList){
            if (!err){
                res.redirect('/'+listName)
            }
        })
    }
    
});
app.get('/work',(req,res)=>{
    res.render("list",{listTitle:"Work list",newListItems:workItems});
});

app.listen(3000,()=>{
    console.log('Server starts in port 3000..')
})