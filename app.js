const express = require('express');
const app = express();
const userModel = require('./models/users');
const postModel = require("./models/post");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.get('', (req, resp)=>{
    resp.render("index")
});
app.get('/login', (req, resp)=>{
    resp.render("login")
});
app.get('/profile', isLoggedIn , async (req, resp)=>{
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    resp.render("profile", {user});
});


app.get('/like/:id', isLoggedIn , async (req, resp)=>{
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    if(post.likes.indexOf(req.user.userid) === -1){
    post.likes.push(req.user.userid);
}
else{
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
}
    await post.save();
    resp.redirect("/profile");
});

app.get('/edit/:id', isLoggedIn , async (req, resp)=>{
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    
    resp.render("edit" , {post});
});

app.post('/update/:id', isLoggedIn , async (req, resp)=>{
    let post = await postModel.findOneAndUpdate({_id: req.params.id} , {content: req.body.content});
    
    resp.redirect("/profile");
});


app.post('/post', isLoggedIn , async (req, resp)=>{
    let user = await userModel.findOne({email: req.user.email})
    let {content} = req.body;
    let post = await postModel.create({
        user:user._id,
        content: content,
    });
    user.posts.push(post._id);
    await user.save();
    resp.redirect("/profile");
});

app.post('/ragister', async (req, resp)=>{
    let {name, username, age, password, email} = req.body;
    let user = await userModel.findOne({email});
    if(user) return resp.status(500).send("user already ragister")
    

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash) =>{
            await userModel.create({
                name,
                username,
                age,
                email,
                password:hash
            });

           let token = jwt.sign({email: email, userid: username}, "shhh")
           resp.cookie("token", token);
           resp.send("Ragistered")
            
        });
    });
});


app.post('/login', async (req, resp)=>{
    let {password, email} = req.body;

    let user = await userModel.findOne({email});
    if(!user) return resp.status(500).send("Something went Wrong");


    bcrypt.compare(password, user.password , function(err, result){
    if(result) {
        let token = jwt.sign({email: email, password:password}, "shhh")
           resp.cookie("token", token);
        resp.status(200).redirect("/profile")
    }
    else resp.redirect("/login");
    })
});

app.get('/logout', (req, resp)=>{
    resp.cookie("token","")
    resp.redirect("/login")
})  

function isLoggedIn(req, resp, next){
    if(req.cookies.token === "") resp.redirect("/login"); 
    else{
        let data = jwt.verify(req.cookies.token, "shhh")
        req.user = data;
        next();
    }
}

app.listen(2000, ()=>{
    console.log("server is running")
});