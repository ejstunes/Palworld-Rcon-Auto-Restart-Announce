// Script created by EJS - 01/24/2024
// Thank you to pushrax for the node-rcon package
// All you need is NodeJS & NPM
// Install node-rcon via command 'npm install rcon'
// Install screen via command 'apt/yum install screen'
// Save this script as 'autorestart.js'
// Then run this script after configuring it via command 'screen node autorestart.js'

// Main config
var serverip = ''
var serverport = 27025
var rconpassword = ''
var restartHour = 04; // 01 - 24
var restartMinute = 20; // must be over 10.
var ampm = "AM"; // AM or PM
var timezone = "PST"; // PST, CST, EST, etc...

// Repeat check bools 
var cmdSent = false;
var announceSent = false;

// Rcon stuff
var Rcon = require('rcon');
var conn = new Rcon(serverip, serverport, rconpassword);


async function doLoop(c) {
  c.send("");
  var d = new Date(Date());
  if (d.getMinutes() == 30 && !announceSent) { // Broadcast a message every hour at the 30 minute mark
    c.send("Broadcast " + ("Server restarting at " + (restartHour + ":" + restartMinute+" "+ampm+" "+timezone)).replaceAll(" ", "-"));
    announceSent = true; // Prevent command repeat
  } else announceSent = false;
  if (d.getHours() == restartHour) {
    if (d.getMinutes() == restartMinute - 10 && !cmdSent) { // Broadcast message 10 minutes before restart
      c.send("Broadcast Server-restart-in-10-mins!");
      cmdSent = true; // Prevent command repeat
    } else if (d.getMinutes() == restartMinute - 5 && !cmdSent) { // Broadcast message 5 minutes before restart
      c.send("Broadcast Server-restart-in-5-mins!");
      cmdSent = true; // Prevent command repeat
    } else if (d.getMinutes() == restartMinute && !cmdSent) {
      c.send("Broadcast Restarting!");
      c.send("Save");
      setTimeout(function() { c.send("DoExit"); conn.disconnect(); conn.emit("end"); }, 3000) // Wait 3 secs before killing server to ensure it saved. Also close Rcon connection.
      cmdSent = true; // Prevent command repeat
    } else cmdSent = false;
  }
}

conn.on('auth', function() {
  console.log("Authenticated");
  var d = new Date(Date());
  setInterval(function() { doLoop(conn) }, 10000); // Run function every 10 seconds
}).on('error', function(err) {
  console.log("Error: " + err);
}).on('end', function() {
  console.log("Connection closed. Waiting 45 seconds before reconnecting.");
  setTimeout(function() { conn.connect(); }, 45000); // Reconnect after 45 seconds
});

conn.connect();
