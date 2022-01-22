const NodeCache = require( "node-cache" );
const sessionTokens = new NodeCache();


function generateSession(username) {
    let stok =  (Math.random().toString(36) + Math.random().toString(36)).replace("0.", "").replace("0.", "");
    sessionTokens.set(stok, username);
    return stok;
  }
  
  function checkSession(username, session) {
    if(sessionTokens.get(session) == username) return true;
    return false;
  }

  module.exports = {generateSession, checkSession};