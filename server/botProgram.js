var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");
var badwords = ["fuck"];
app.use(express.static(__dirname + "/../assets"));

app.get('/',function(req,res){
    //res.sendFile(path.join(__dirname+'/../assets/view/chatpagecopy.html'));
    res.sendFile(path.join(__dirname+'/botchat.html'))
});

io.on('connection', function(socket){
    //Emits to all people that a user connected
    //io.emit('chat message','user connected');
    //Emits to all people beside sender (user that have connected) that a user connected
    socket.broadcast.emit('username', "Test");
    socket.broadcast.emit('chat message', UserConn("user"));
    socket.on("sendVar", function(value){
        console.log("The value of the variable is " + value);
    });
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        var i,word;
        word = detectingWhisper(msg,"user1","user2");
        if(word != 0){
            io.emit('private message',msg);
        }
        word = checkBot(msg,"user");
        for(i=0;i<badwords.length;i++){
            if(msg == badwords[i]){
                msg = "****";
                break;
            }
        }
        io.emit('chat message', msg);
      });

    //Emits to all people that a user disconnect
    //Don't have to exclude the user who disconnected becuase its already disconnected
    socket.on('disconnect', function(){
        io.emit('chat message',UserDisc("User"))
    });
});

http.listen(3456, function(){
    console.log('listening on localhost:3456');
});

function checkBot(msg,user){
    if(msg.indexOf("/bot add") !== -1){
        msg = msg.replace('/bot add ','');
        console.log("Knew BadWord: "+msg);
        badwords.push(msg);
    }
    if(msg.indexof("/bot help") !== -1){
        msg = "/bot <$> -add -remove -kick -invite";
    }
    if(msg.indexOf("/bot invite") !== -1){
        msg = msg.replace('/bot invite ','');
        //msg = friend want to be invited
        user.friendlist.push(msg);
    }
    if(msg.indexOf("/bot remove") !== -1){
        msg = msg.replace('/bot remove ','');
        //msg = friend want to be removed
        remove(user.friendlist.find(msg));
    }

    if(msg.indexOf("/bot kick") !== -1){
        msg = msg.replace('/bot kick ','');
        //msg = user that is kicked
        kick(user.chatroom[so].find(msg));
    }
    return msg;
}

function UserDisc(usersql){
    username = "User ";
    return username + "Disconnected.";
}

function UserConn(usersql){
    username = "User ";
    return username + "Connected.";
}

function detectingWhisper(msg,usersqlsend,usersqlrecieve){
    if(msg.indexOf("@") !== -1){
        msg = msg.replace('@'+usersqlrecieve.name+' ','');
        usersql.whisper.push(msg + ' | ' + usersqlsend.name);
        return msg;
    }
        return 0;
}