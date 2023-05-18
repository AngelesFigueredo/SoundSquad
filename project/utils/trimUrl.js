function trimUrl (string) {
  if(string[0] === '"'){
    string = string.substring(1, string.length-1)
  }
  return string
}


module.exports = trimUrl;
