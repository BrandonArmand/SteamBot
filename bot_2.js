const SteamUser = require('steam-user');
const client = new SteamUser();

/* logOnOptions
The Login Details for the Bot
*/
const logOnOptions = {
  accountName: 'psn_mattisgaismurf',
  password: 'luisisreallygay'
};


/* accountUser
The Object for each user in the chat containing their

name: account name
invited: whether the account has been auto invited to the Group
steamID: the accounts steam ID
invite: whether the account should be invited to the Group
ingroup: whether the user is in the group right now or not
money: the users current money, default at 100, unless setPersona
healthLoss: the amount of negative health given to the user
updateHealth, function: a function that updates the values of
  level: the users level based on their current money
  health: the users health based on their money, and - healthLoss
  maxHealth: the user's max health, based on the health + healthLoss
*/
var accountUser = function(name, sid, money = 100, level = 1) {
  this.name = name;
  this.invited = false;
  this.steamid = sid;
  this.invite = true;
  this.inGroup = false;

  this.level = level;
  this.money = money;
  this.health = 100;
  this.maxHealth = 100;
  this.healthLoss = 0;

  this.updateHealth = function(){
    this.level = Math.floor(this.money / 100) >= 1 ? Math.floor(this.money / 100) : 1;
    this.health = (100 * this.level) - this.healthLoss ;
    this.maxHealth = this.health + this.healthLoss;
  }

  return this;
};

/* accounts
  an array for every steam account participating in the
*/
var accounts = [new accountUser('StacheOG', 'STEAM_0:0:42734832'),
                new accountUser('Swag', 'STEAM_0:0:54814970'),
                new accountUser('Mr.Fish-Go-Moo', 'STEAM_0:1:52931588'),
                new accountUser('Breezey','STEAM_0:0:99513268'),
                new accountUser('whorunbartertown','STEAM_0:1:97478055'),
                new accountUser('Mondough','STEAM_0:0:83306746'),
                new accountUser('Mr.Mish Fo Goo | kickback.com','STEAM_0:1:88052725'),
                new accountUser('Hacker Faggot','STEAM_0:0:117464167'),
                new accountUser('MIKEY','STEAM_0:1:129833392')];

/* logOn
  logs in the Bot
*/
client.logOn(logOnOptions);
client.on('loggedOn', () => {
  console.log('logged into steam');

  client.setPersona(SteamUser.Steam.EPersonaState.Max, 'Sick AF BOT');
  client.joinChat('103582791441497183');
});


/* friendRelationship
  auto adds any user that adds the Bot
*/
client.on('friendRelationship', (steamid, relationship) => {
    if (relationship === 2) {
        client.addFriend(steamid);
        console.log(steamid + " added as a friend");
        client.chatMessage(steamid, 'Thanks for adding me');
    }
});

/* friendMessage
  handles all private messages sent to the bot
*/
client.on('friendMessage', (steamid, message) => {
  var command = message.toLowerCase();
  if(command.search('!help') != -1){
    helpPrompt(steamid);
  }

  if(command.search('!list') != -1){
    console.log(accounts);
  }


  client.getPersonas([steamid], function(personas) {
    var persona = personas[steamid];
    var user = persona ? persona.player_name : ("[" + steamid.getSteamID64() + "]");
    addUser(user, steamid, false);
    console.log("[Private] " + user + " :  " + message);
  });


});

/* chatMessage
  reads every group message sent to the Bot
*/
client.on('chatMessage', (room, sender, message) => {
  var command = message;




  client.getPersonas([sender], function(personas) {
    var persona = personas[sender];
    var user = persona ? persona.player_name : ("[" + sender + "]");
    addUser(user, sender);
    console.log("[Group] " + user + " :  " + message);
  });

  if(command.toLowerCase().search('!name') != -1 && command.length > 5){
    var x = command.search('!name');
    client.setPersona(SteamUser.Steam.EPersonaState.Max, message.slice(6));
    console.log('name changed to ' + message.slice(6));
  }

  if(command.toLowerCase().search('!money') != -1){
    client.getPersonas([sender], function(personas) {
      var persona = personas[sender];
      var user = persona ? persona.player_name : ("[" + sender.getSteamID64() + "]");
      var search = searchUser(user);
      if(search){
        client.chatMessage(room, user + "'s Money is at " + search.money);
      }
    });
  }


  var duplicateSearch = 0;
  var namelist = '';
  if(command.toLowerCase().search('!hit') != -1 && command.length > 5){
    client.getPersonas([sender], function(personas) {
      var victum = message.slice(5);
      victum = victum.toLowerCase();
      var persona = personas[sender];
      var attacker = persona ? persona.player_name : ("[" + sender.getSteamID64() + "]");
      var attackerX;

      var search = searchUser(attacker);
      if(search){
        attackerX = search;
      }

      var x = false;
      for(var i = 0; i < accounts.length; i++){

        if(accounts[i].name.toLowerCase().search(victum) != -1){
          duplicateSearch = duplicateSearch + 1;
          var found = accounts[i];
          namelist = namelist + "  |  " + found.name;
        }
      }

        if(duplicateSearch == 1) {
          client.chatMessage(found.steamid, 'HIT by ' + attacker);

          if(getRandom(1,20) >= 19) {
            var hitResult = attackerX.level != undefined ? getRandom(10, 20) * attackerX.level: getRandom(10, 20);
            found.healthLoss = found.healthLoss + hitResult;
            found.updateHealth();
            client.chatMessage(room, attacker + " CRITICAL HIT " + found.name + " for " + hitResult);
          }
          else if (getRandom(1,20) == 1) {
            var hitResult = attackerX.level != undefined ? getRandom(-10, -1) * attackerX.level: getRandom(10, 20);
            found.healthLoss = found.healthLoss + hitResult;
            found.updateHealth();
            client.chatMessage(room, attacker + " CRITICAL FAIL " + found.name + " for " + hitResult);
          }
          else {
            var hitResult = attackerX.level != undefined ? getRandom(0, 10) * attackerX.level: getRandom(10, 20);
            found.healthLoss = found.healthLoss + hitResult;
            found.updateHealth();
            client.chatMessage(room, attacker + " HIT " + found.name + " for " + hitResult);
          }

          if(found.health <= 0){
                attackerX.money = attackerX.money + (Math.floor(found.money / 2));
                client.kickFromChat(room, found.steamid);
                client.chatMessage(room, attackerX.name + " has killed " + found.name + " and taken his money");
                console.log(attackerX.name + " has killed " + found.name + " and taken his money");
                client.chatMessage(found.steamid, "you ded lol");

            found.money = (Math.floor(found.money / 2));
            found.healthLoss = 0;
            found.updateHealth();
          }

          client.chatMessage(room, found.name + "'s health is now at " + found.health + "/" + found.maxHealth);
          x = true;
        }

        else if (duplicateSearch > 1) {
          client.chatMessage(room, namelist + "  | \nmore than one user shares that phrase, be more specific");
          x = true;
        }

      if(x == false){
        client.chatMessage(room, victum + " is not found");
      }
    });
  }

  if(command.toLowerCase().search('!playercount') != -1){
    if(command.length > 12){
      var game = message.slice(12);
      var game = parseInt(game);
      client.getPlayerCount(game, function(result, players){
        client.chatMessage(room, "Game ID #" + game + " has " + players + " players currently playing");
      });

    }

    else {
      client.chatMessage(room, 'type in a game\'s appID');
    }
  }

  if(command.search('!game') != -1){
    if(command.length > 6){
      var game = command.slice(6);
      var gameint = parseInt(game);
        if(!gameint){
          client.gamesPlayed(game);
        }
        else{
          client.gamesPlayed(gameint);
        }
    }

    else{
      client.gamesPlayed(0);
    }
  }

  if(command.toLowerCase().search('!help') != -1){
    helpPrompt(sender);
  }

  if(command.toLowerCase().search('!health') != -1){
    client.getPersonas([sender], function(personas) {
      var persona = personas[sender];
      var user = persona ? persona.player_name : ("[" + sender.getSteamID64() + "]");
      var search = searchUser(user);
        if(search){
          search.updateHealth();
          client.chatMessage(room, user + "'s Health is at " + search.health + "/" + search.maxHealth);
        }
    });
  }

  if(command.toLowerCase().search('!clear') != -1){
    clear();
  }

});

client.on('chatUserJoined', (room, user) => {
  client.getPersonas([user], function(personas) {
    var persona = personas[user];
    var name = persona ? persona.player_name : ("[" + user.getSteamID64() + "]");
    if(name != 'Breezey'){
      client.chatMessage(room, 'Welcome ' + name + "! Type !Help for help");
    }
    else {
      client.chatMessage(room, 'Fuck Mark');
    }
    console.log(name + " joined the chat");

    addUser(name, user);
  });
});

client.on('chatUserLeft', (room, user) => {
  client.getPersonas([user], function(personas) {
    var persona = personas[user];
    var name = persona ? persona.player_name : ("[" + user.getSteamID64() + "]");

    console.log(name + " left the chat");
    addUser(name, user);
  });
});

client.on('user', (sid, user) => {
  for(var i = 0; i < accounts.length; i++) {
    if(accounts[i].name == user.player_name
    && user.online_session_instances == 1
    && user.persona_state == 1
    && accounts[i].invited == false
    && accounts[i].invite == true
    && accounts[i].inGroup != true

    || accounts[i].name == user.player_name
    && user.online_session_instances == 5
    && user.persona_state == 1
    && accounts[i].invited == false
    && accounts[i].invite == true
    && accounts[i].inGroup != true){

      console.log(user.online_session_instances + " .. " + user.player_name + ' - ' + user.persona_state);
      client.inviteToChat('103582791441497183', accounts[i].steamid);
      console.log('invited ' + accounts[i].name);
      accounts[i].invited = true;
    }

    else if (accounts[i].name == user.player_name
    && user.online_session_instances != 1
    && user.persona_state == 0
    && accounts[i].invited == true
    && accounts[i].invite == true

    || accounts[i].name == user.player_name
    && user.online_session_instances != 5
    && user.persona_state == 0
    && accounts[i].invited == true
    && accounts[i].invite == true) {
      console.log(user.online_session_instances + " .. " + user.player_name + ' - ' + user.persona_state);

      accounts[i].invited = false;
    }
  }
});

var clear = function(){
  var clear = '';
  for(var i = 0; i < 50; i++){
    clear = clear + '\n';
  }
  client.chatMessage(room, clear);
}

var searchUser = function(user){
  var x = false;
  for(var o = 0; o < accounts.length; o++){
    if(accounts[o].name == user){
      x = true;
      return accounts[o];
    }
  }
  if(x == false) {
    return x;
  }
}

var addUser = function(name, user, joined = true){
  var x = false;
  var search = searchUser(name)
  if(search){
    x = true;
  }

  if(x == false){
    accounts.push(new accountUser(name, user));
    accounts[accounts.length - 1].inGroup = joined;
    console.log(accounts[accounts.length - 1].name + " was added to account list");
  };
}

var getRandom = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var helpPrompt = function(room){
  client.chatMessage(room, 'I am a Bot created by Mr.Fish-Go-Moo! Version 0.2.2' + "\n" + "\n"
  + 'I can Do a few things so far, like:' + "\n"
  + '                                    • !Name "insert name here"' + "\n"
  + '                                         • (change my name)' + "\n"
  + '                                    • !Hit "insert victim here"' + "\n"
  + '                                         • (hit another user)' + "\n"
  + '                                    • !Money' + "\n"
  + '                                         • (shows your current value)' + "\n"
  + '                                    • !PlayerCount "GameID"' + "\n"
  + '                                         • (shows the player count for a game using it\'s AppID)' + "\n"
  + '                                              • EX) !PlayerCount 730 shows CSGO\'s playercount' + "\n"
  + '                                    • !Health' + "\n"
  + '                                         • (shows your remaining Health)' + "\n"
  + '                                    • !Game' + "\n"
  + '                                         • (changes my game to any real (via appID), or fake(anything) game)' + "\n"
  + '                                              • EX) !Game 730 starts up CSGO' + "\n"
  + '                                              • EX) !Game Swag starts up a non-steam game, Swag' + "\n"
  + '                                    • !Clear' + "\n"
  + '                                         • (clears the chat room of messages)' + "\n"
  + 'Commands are no longer case sensitive' + "\n"
  + 'If some features don\'t work, rejoin the chat room.');
}
