
function isValidLinkedinUrl(url) {
  if (!validator.isURL(url)) return false;

  return url.startsWith("https://www.linkedin.com/in/");
}

function isValidGithubUrl(url){
    if(!validator.isURL(URL)) return false;

    return url.startsWith("https://github.com/")
}

module.exports = {isValidGithubUrl,isValidLinkedinUrl}