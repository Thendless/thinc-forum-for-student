// Initialize Firebase
var config = {
  apiKey: "AIzaSyDbBjXOLuweRFjgN7tJTEiO_TswPjRkONU",
  authDomain: "forum-for-student.firebaseapp.com",
  databaseURL: "https://forum-for-student.firebaseio.com",
  projectId: "forum-for-student",
  storageBucket: "forum-for-student.appspot.com",
  messagingSenderId: "861870829993"
};
firebase.initializeApp(config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

var data;
var auth_email,auth_uid;
var isadmin = false;

function urlparam(param) {
  var url = new URL(window.location);
  var c = url.searchParams.get(param);
  return c;
}

// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

//load all data
async function getAllTopicData() {
  var querySnapshot = await db.collection('topic').get()
  var res = {};
  querySnapshot.forEach(function(doc) {
    res[doc.id] = doc.data()
  })
  return res;
}

//new topic
async function newTopic(title,text) {
  await db.collection("topic").add({
    "topic": title,
    "comment": [],
    "content": {
      "like": 0,
      text: text,
      owner: 1
    }
  });
}

//like topic
async function likeTopic(id) {
  data[id].content.like++;
  await db.collection("topic").doc(id).set(data[id]);
}

//like comment
async function likeComment(id,commentid) {
  data[id].comment[commentid].like++;
  await db.collection("topic").doc(id).set(data[id]);
}

//new comment
async function newComment(id,text) {
  data[id].comment.push({
    owner: 1,
    text: text,
    like: 0
  });
  await db.collection("topic").doc(id).set(data[id]);
}

async function getAllComment(id) {
  return data[id].comment;
}

//int main()
(async function() {
  //cache all data in a variable, so it easy to use
  data = await getAllTopicData();

  //init auth
  var ui = new firebaseui.auth.AuthUI(firebase.auth());

  ui.start('#firebaseui-auth-container', {
    signInOptions : [
      // List of OAuth providers supported.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ]
    // Other config options...
  });
  
  firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
      var email = user.email;
      var uid = user.uid;

      auth_email = email;
      auth_uid = uid;
    
      $("#email").text(email);
      $("#uid").text(uid);
      $("#firebaseui-auth-container").hide();

      if (vm) vm.$forceUpdate();

      await main();

      //await init_countamount();

      loading = false;
      if (vm) vm.$forceUpdate();
    }
  });
})();