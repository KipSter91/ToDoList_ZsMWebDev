const express = require("express");
const bodyParser = require("body-parser");
const date = require(`${__dirname}/date.js`);
const mongoose = require('mongoose');
const _ = require('lodash');

const port = 3000;
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(MONGOOSECONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);

app.get("/", (req, res) => {

    const day = date.fullDate();

    Item.find({})
        .then(foundItems => {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems);
                res.redirect("/");
            } else {
                res.render("list", { title: day, newListItems: foundItems });
            };
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/:customListName", (req, res) => {
    if (req.params.customListName != "favicon.ico") {
        const customListName = _.capitalize(req.params.customListName);
        List.findOne({ name: customListName })
            .then(foundList => {
                if (!foundList) {
                    // List does not exist, create a new one with default items
                    const list = new List({
                        name: customListName,
                        items: defaultItems
                    });

                    list.save();
                    console.log("List created!");
                    res.redirect(`/${customListName}`);

                } else {
                    // List exists, render it with its items
                    console.log("List found!");
                    res.render("list", { title: foundList.name, newListItems: foundList.items });
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
});

app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if (listName === date.fullDate()) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
            .then(foundList => {
                foundList.items.push(item);
                foundList.save();
                res.redirect(`/${listName}`)
            })
            .catch(err => {
                console.log(err);
            });
    };

});

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === date.fullDate()) {
        Item.findByIdAndRemove(checkedItemId)
            .then(() => {
                console.log(`Deleted item with ID: ${checkedItemId}`);
            })
            .catch(err => {
                console.log(err);
            });
        res.redirect('/');
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
            .then(() => {
                res.redirect(`/${listName}`)
            })
            .catch(err => {
                console.log(err);
            });
    };

});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
