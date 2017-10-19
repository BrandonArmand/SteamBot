# SteamBot
A simple moderator Bot for steam built with Node

to setup the bot for yourself, you don't have to do any work!
* just open the config.js
* put your steam info there
```
exports.accountName   = 'Name Here';                  //Put Username Here
exports.password      = 'password Here';              //Put password here
exports.groupId       = 'group Id here';              //Put SteamGroup Id Here
exports.botName       = 'Disired Bot name';           //The bot username you would like to set
```
* then make sure the modules are installed
```
npm install steam-user
node bot.js
```
`The console will then display every user it has invited to your disired group, and display every private message, and group message recieved`
