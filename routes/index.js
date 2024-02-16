var express = require('express');
var router = express.Router();
const axios = require('axios');
var userModel = require("./users");
var postModel = require("./posts");
const storyModel = require('./story');
const reelsModel = require("./reels")
const msgModel = require("./messages")
const passport = require('passport');
const upload = require("./multer")
const users = require('./users');
const commentModel = require("./comment")
const replyModel = require("./reply")

const multer = require('./multer');
const localStratagy = require("passport-local");
var ImageKit = require("imagekit");

const fs = require("fs");
const { log } = require('console');
var imagekit = new ImageKit({
  publicKey: "publ21mpeGsUXktNLeztVPMSMy7w1w=ic_v",
  privateKey: "private_chfo2+sM1rnwp3sjVefYNrj7ccY=",
  urlEndpoint: "https://ik.imagekit.io/gunj6f9gb"
});
passport.use(new localStratagy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search', isLoggedIn, function (req, res, next) {
  const loggedinuser = req.user
  res.render('search', { loggedinuser });
});

router.get("/createstory", isLoggedIn, async function (req, res) {
  const loggedinuser = req.user

  const userstory = await storyModel.find({ userId: loggedinuser._id })
  // console.log(userstory);

  const alluser = await storyModel.find({ userId: { $nin: [loggedinuser._id] } })
  // console.log(alluser);
  res.render("createstory", { loggedinuser })
})

router.post('/addstory', isLoggedIn, upload.single('babu'), async (req, res) => {
  var loggedinUser = req.user
  // console.log(req.file);
  let story = await storyModel.create({
    dp: loggedinUser.profilepic,
    story: req.file.filename,
    userId: req.user._id
  })
  loggedinUser.story.push(story._id)
  await loggedinUser.save()
  res.redirect("/home")
});


router.get("/search/:username", isLoggedIn, async function (req, res, next) {
  const user = await userModel.find({ username: req.params.username })
  res.json(user)
})

router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.get('/userprofile/:userid', isLoggedIn, async function (req, res, next) {
  const loggedinUser = req.user
  const sender = req.params.userid;
  var userposts = await userModel.findById(req.params.userid).populate("posts")
  res.render('userprofile', { userposts, loggedinUser, sender });
});

router.get('/createpost', isLoggedIn, async function (req, res, next) {
  let loggeedinUser = req.user
  let user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  res.render('createpost', { user, loggeedinUser });
});

router.post('/editpic', isLoggedIn, upload.single('imge'), async function (req, res) {
  var user = await userModel.findOne({username:req.session.passport.user})
  
  fs.readFile(req.file.path, function (err, data) {
    // console.log(data);
    if (err) throw err; // Fail if the file can't be read.
    imagekit.upload({
      file: data, //required
      fileName: req.file.filename, //required
      tags: ["tag1", "tag2"]
    },async function (error, result) {
      if (error) console.log(error);
      else {
        var users = await userModel.findOneAndUpdate({username:req.session.passport.user},{profilepic:result.url})
        
      };
    });

   
  });
  await user.save()
  res.render("editpage", { user })
});

router.post("/editbioname", isLoggedIn, async function (req, res, next) {
  var user = await userModel.findOne({ username: req.session.passport.user })
  user.name = req.body.name,
    user.bio = req.body.bio
  await user.save();

  res.redirect("/profile")
})

router.post('/addpostimg', isLoggedIn, upload.single('imge'), async function (req, res) {
  var user = await userModel.findOne({ username: req.session.passport.user })
  var newurl;
  fs.readFile(req.file.path, function (err, data) {
    if (err) throw err; 
    imagekit.upload({
      file: data, //required
      fileName: req.file.filename, //required
      tags: ["tag1", "tag2"]
    }, async function (error, result) {
      if (error) console.log(error);
      else {
        var postimg = await postModel.create({
          postPic: result.url,
          postText: req.body.description,
          userid: user._id
        })
        user.posts.push(postimg._id);
        await user.save();

      };
    });
    // console.log(imageURL);
  });
  console.log(newurl);


  // var detail = await postModel.findOne({})

  res.redirect("/profile")
});

router.post("/register", function (req, res, next) {
  var newUser = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email
  })
  userModel.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect("/home")
      })
    })
    .catch(function (e) {
      res.send(e);
    })
})

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

router.get('/feed', isLoggedIn, async function (req, res, next) {

  const result = await postModel.aggregate(pipeline).exec();
  // console.log(result);

  const currentUser = await userModel.findById(req.user._id);
  const followingIds = currentUser.following;
  // console.log(req.user.isPrivate);

  const feed = await postModel.find({ userid: { $in: followingIds } })
    .populate('userid', 'username profilepic')
  // console.log(feed);
  res.render('feed', { feed, loggedinuser: req.user, result });
});

router.get('/createreels', isLoggedIn, async function (req, res, next) {
  res.render('createreels', { loggedinuser: req.user });
});

router.get('/notification', isLoggedIn, async function (req, res, next) {
  const loggedinUser = req.user

  var user = await userModel.findById(loggedinUser._id).populate({
    path: 'requests',
    model: 'User',
  })
  res.render('notification', { user });
});

router.get("/unfollow/:unfollwingID", isLoggedIn, async function (req, res, next) {
  var loggedinUser = req.user
  // console.log(req.params.unfollwingID);
  loggedinUser.following.remove(req.params.unfollwingID)

  var touser = await userModel.findById(req.params.unfollwingID)
  touser.follower.remove(loggedinUser._id)

  await touser.save();
  await loggedinUser.save()

  const referrer = req.get('Referer');

  if (referrer.includes('/home')) {
    res.redirect('/home');
  } else if (referrer.includes('/userprofile/:userid')) {
    res.redirect('/userprofile/:useri');
  } else {
    res.redirect('/');
  }
})

router.get("/accept/:folowingID", isLoggedIn, async function (req, res, next) {
  const loggedinUser = req.user
  var touser = await userModel.findById(req.params.folowingID)
  if (loggedinUser.requests.includes(touser._id)) {
    touser.following.push(loggedinUser._id)
    loggedinUser.follower.push(touser._id)
    loggedinUser.requests.remove(touser._id)
    await userModel.findOneAndUpdate({ _id: touser._id }, { isprivate: true })
  }
  await touser.save()
  await loggedinUser.save()
  res.redirect("/profile")

})

router.get("/reject/:folowingID", isLoggedIn, async function (req, res, next) {
  const loggedinUser = req.user
  var touser = await userModel.findById(req.params.folowingID)
  if (touser.requests.includes(loggedinUser._id)) {
    touser.requests.remove(loggedinUser._id)
  }
  await touser.save()
  res.redirect("/home")

})

router.get("/requested/:folowingID", isLoggedIn, async function (req, res, next) {
  const loggedinUser = req.user
  var touser = await userModel.findById(req.params.folowingID)
  if (touser.requests.includes(loggedinUser._id)) {
    // console.log("id  mer a pass hai");
    touser.requests.remove(loggedinUser._id)
  }
  await touser.save()
  res.redirect("/home")

})

router.get('/follow/:folowingID', isLoggedIn, async function (req, res, next) {

  var loggedinUser = req.user
  // console.log(req.params.folowingID)
  var touser = await userModel.findById(req.params.folowingID)

  if (touser.requests.includes(loggedinUser._id)) {
    // console.log("hai mera passs user id");
    return
  }
  else {
    touser.requests.push(loggedinUser._id)
  }

  await touser.save()
  res.redirect('/home');
});

router.get('/home', isLoggedIn, async function (req, res, next) {
  var loggedinuser = req.user
  let allUser = await userModel.find({ username: { $nin: [loggedinuser.username] } }).populate("posts", "story")

  const currentUserId = req.user._id; // Adjust this based on your authentication mechanism

  // Get the list of users whom the current user is following
  // console.log(currentUserId);
  const currentUser = await userModel.findById(currentUserId);
  const followingIds = currentUser.following;

  // console.log(followingIds);
  // Get posts from users in the following list
  const posts = await postModel.find({ userid: { $in: followingIds } })
    .populate('userid','username  profilepic' ).populate("comments").populate({path:"comments", populate:"userid"})// Populate the 'user' field with the 'username' only
  // .sort('-createdAt') // Sort posts by createdAt in descending order

  // console.log(posts);

const commentss = await commentModel.find().populate("userid").populate("reply").populate({path:"reply", populate:"userid"})

// res.send(commentss)
// console.log(commentss);

  const userstory = await userModel.findOne({ username: loggedinuser.username }).populate("story")
  // console.log(userimg);

  const alluserstory = await storyModel.find({ userId: { $nin: [loggedinuser._id] } })
  // console.log(alluserstory);
  // console.log(posts);
  
  res.render('home', { allUser, loggedinuser, posts, userstory, alluserstory, commentss});
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  var user = await userModel.findOne({ username: req.session.passport.user }).populate("posts")
  // console.log(user.username);
  // console.log(user);
  await user.save();
  res.render('profile', { user });
});

router.get('/reels', isLoggedIn, async function (req, res, next) {
  var loggedinuser = req.user

  const currentUser = await userModel.findById(loggedinuser.id);
  const followingIds = currentUser.following;

  // console.log(followingIds);

  const reels = await reelsModel.find({ userid: { $in: followingIds } })
    .populate('userid', 'username profilepic following')

  // console.log(reels);

  // console.log(reels);
  res.render("reels", { reels, loggedinuser })
});

router.get('/editpage', isLoggedIn, async function (req, res, next) {
  var user = await userModel.findOne({ username: req.session.passport.user })
  res.render('editpage', { user });
});

router.post('/addreel', isLoggedIn, upload.single('video'), async (req, res) => {
  var loggedinUser = req.user
  // console.log(req.file);
  fs.readFile(req.file.path, function (err, data) {
    if (err) throw err; 
    imagekit.upload({
      file: data, //required
      fileName: req.file.filename, //required
      tags: ["tag1", "tag2"]
    }, async function (error, result) {
      if (error) console.log(error);
      else {
        let reels = await reelsModel.create({
          title: req.body.title,
          description: req.body.description,
          path: result.url,
          userid: req.user._id
        })
        loggedinUser.reels.push(reels._id)
        await loggedinUser.save()

      };
    });
    // console.log(imageURL);
  });
  
  res.redirect("/profile")
});

router.get("/like/:userid", isLoggedIn, async function (req, res, next) {


  const loggedinuser = req.user
  // console.log(req.params.userid);
  const postlike = await postModel.findById(req.params.userid)
  if (postlike.likes.includes(loggedinuser._id)) {
    postlike.likes.remove(loggedinuser._id)
  } else {
    postlike.likes.push(loggedinuser._id)
  }

  await postlike.save();
  res.json(postlike)
})

router.get("/message", isLoggedIn, async function (req, res, next) {
  const loggedinuser = req.user
  res.render("message", { loggedinuser })
})


router.get("/comment", isLoggedIn, async function (req, res, next) {
  // console.log(req.query.postid);
  // console.log(req.query.commenthai);


  console.log(req.user._id);
  const comment = await commentModel.create({
    userid:req.user._id,
    postid:req.query.postid,
    comment: req.query.commenthai
  })

  // console.log(comment);
  const pushcomment = await postModel.findById(req.query.postid)
  pushcomment.comments.push(comment._id)

  pushcomment.populate("comments")
  await pushcomment.save();

  console.log(pushcomment);


  await comment.save();
  // await postcommentpush.save()
  res.json(pushcomment)

})

router.get("/post/:info", isLoggedIn, async function(req, res ,next){
  console.log(req.params.info);
  const posinfo  = await postModel.findOne({_id:req.params.info})
  .populate("comments").populate({path:"comments", populate:"reply"}).populate("userid")
  const commentss = await commentModel.find().populate("userid").populate("reply").populate({path:"reply", populate:"userid"})
  // console.log(commentss);
  
  const newResponse = {
    posinfo,
    commentss
  }
  res.json(newResponse)
})

router.get("/reply", isLoggedIn, async function(req, res, next){
  console.log(req.query.reply);
  console.log(req.query.commentid);

  const newReply = await replyModel.create({
    userid:req.user._id,
    postid:req.query.postid,
    reply:req.query.reply,
  })
  console.log(req.query.commentid);
  const parentComment= await commentModel.findById(req.query.commentid);

  parentComment.reply.push(newReply._id)
  await parentComment.populate({path:"reply", populate:"userid"})
  console.log(parentComment);
  await parentComment.save();
  res.json(parentComment)
})


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect("/")
  }
}

router.post("/login", passport.authenticate('local', {
  successRedirect: "/home",
  failureRedirect: "/"
}), function (req, res, next) { })


const pipeline = [
  {
    $lookup: {
      from: 'users',
      localField: 'userid',
      foreignField: '_id',
      as: 'user'
    }
  },
  {
    $match: {
      'user.isPrivate': { $ne: true }
    }
  },
  {
    $project: {
      _id: 1,
      postText: 1,
      postDate: 1,
      postPic: 1,
      userid: 1,
      likes: 1,
    }
  },

  {
    $sample: { size: 10 }
  }
];



module.exports = router;

