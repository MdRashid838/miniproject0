const express = require('express');
const app = express();
const userModel = require('./models/users');
const bcrypt = require('bcrypt')


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// app.use(cookieParser());

app.get('', (req, resp)=>{
    resp.render("index")
});

app.post('/ragister', async (req, resp)=>{
    let {name, username, age, password, email} = req.body;
    let user = await userModel.findOne({email});
    if(user) return resp.status(500).send("user already ragister")

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash) =>{
            await userModel.create({
                name:name,
                username:username,
                age:age,
                email:email,
                password:hash
            })
            
        });
    });
});

app.listen(2000, ()=>{
    console.log("server is running")
});