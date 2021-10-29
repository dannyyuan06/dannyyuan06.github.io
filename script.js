// Start Fade

var startimage = document.getElementById("startback");
var onabout = false;
var aboutme = document.getElementById("aboutme");

var wordsTogether = aboutme.innerHTML;
var words = wordsTogether.split(" ");
var finishedWords = ""
var first = true;

const startFI3 = 47;

function preloadImages(url) {
  var img = new Image();
  img.src = url;
}

window.onload = function() {
  setTimeout(function() {
    startimage.classList.add("opacity0");
  }, 200);
  setTimeout(function() {
    startimage.style.zIndex = "-1"
  }, 1200);

  for (let j = 0; j < words.length; j++) {

    if (words[j] == '<br>\n' || words[j] == '<br>') {
      finishedWords += "<br>"
    }
    else if (words[j] == '' || words[j] == '\n') {
    }
    else {
      const span = "<span class='aboutmeletters'>" + words[j] + " " + "</span>";
      finishedWords += span;
    }

  }
  aboutme.innerHTML=finishedWords;
  
  for (let i = 1; i <= 60; i++) {
    const preImage = "svg/water drop" + pad(i, 4) + ".svg";
    preloadImages(preImage);
  }
  
  for (let i = 1; i <= 38; i++) {
    const preImage = "runningMan/rniinung" + pad(i, 4) + ".png";
    preloadImages(preImage);
  }

  scroll("start");
}

window.onbeforeunload = function() {
  startimage.classList.remove("opacity0");
  startimage.style.zIndex = "1000";
}

// Letters Animation

var letters = document.getElementsByClassName("nameWord");
for (let i=0; i<letters.length; i++) {
  var rand = Math.floor(Math.random() * 2000);
  letters[i].style.opacity = "0";
  setTimeout(function() {
    letters[i].style.opacity = "0.8";
    letters[i].classList.add("lettersanimation");
  }, rand);
}

// Scroll Animation

var body = document.body;
var bodyHeight = body.clientHeight;
var winHeight = window.innerHeight;
var workingHeight = bodyHeight - winHeight;
var offSet = window.pageYOffset;

// Water Drop

var waterD = document.getElementById("anime");
var waterI = document.getElementById("wanime");
var runD = document.getElementById("animeRun");
var runI = document.getElementById("wanimeRun");
var backgroundImage = document.getElementById("backgroundimage");
var fi3 = "before";

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

var frameNumber = 0;

window.onscroll = function() {
  scroll("scroll");
}

function scroll(which) {

  var name = document.getElementById("name");
  body = document.body;
  bodyHeight = body.clientHeight;
  winHeight = window.innerHeight;
  workingHeight = bodyHeight - winHeight;
  offSet = window.pageYOffset;

  const scrollFraction = offSet/workingHeight;
  const frameIndex = Math.floor(scrollFraction * 100);
  const startFrameIndex = 5;
  const endFrameIndex = 20;
  const startFI2 = 30;

  const startFI4 = 70;



  if (frameIndex > startFrameIndex && frameIndex <= endFrameIndex) {
    waterD.style.zIndex = "1";
    const startAnimation = workingHeight * startFrameIndex/100;
    const endAnimation = workingHeight * endFrameIndex/100;
    const animationLength = endAnimation - startAnimation;
    const animationOffSet = offSet - startAnimation;
    const scrollFractionAnimation = animationOffSet/animationLength;
    const animationFrame = Math.floor(scrollFractionAnimation * 60) - 3;
    const frameString = pad(animationFrame, 4);
    const source = "svg/water drop" + frameString + ".svg";
    waterI.src = source;
  }
  else if (frameIndex <= startFrameIndex){
    waterD.style.zIndex = "-1";
  }
  else {
    waterI.src = "svg/water drop0060.svg";
  }

  if (frameIndex > endFrameIndex) {
    if (onabout == false) {
      newLetters("aboutmeletters");
    }
    aboutme.classList.remove("opacity0");
    onabout = true;
    aboutme.style.zIndex = "4";
  }
  else {
    if (onabout == true) {
      newLettersRm("aboutmeletters");
    }
    aboutme.classList.add("opacity0");
    onabout = false;
    setTimeout(function() {
      aboutme.style.zIndex = "-1";
    }, 200);
  }

  const black = document.getElementById("black");

  if (frameIndex >= startFI2 + 1 && frameIndex <= startFI2 + 6) {
    black.style.zIndex = "1";
    black.style.height = "70vh";
  }
  else if (frameIndex > startFI2 + 6) {
    black.style.zIndex = "6";
    black.style.height = "100vh";
  }
  else {
    black.style.zIndex = "-1";
  }

  if (frameIndex > startFI2 + 8) {
    black.classList.add("turnColor");
  }
  else {
    black.classList.remove("turnColor");
  }

  if (frameIndex > startFI3 && fi3 == "before") {
    if (first == true) {
      first = false;
      frameNumber = 38;
      const sourcer = "runningMan/rniinung0038.png";
      runI.src = sourcer;
      runD.style.zIndex = "8";
    }
    else {
      fi3 = "in";
      body.style.overflow = "hidden";
      runD.style.zIndex = "8";
    }
    var frameUpdateAf = setInterval(function() {
      if (frameNumber < 38) {
        frameNumber++;
        const frameStringr = pad(frameNumber, 4);
        const sourcer = "runningMan/rniinung" + frameStringr + ".png";
        runI.src = sourcer;
      }
      else {
        console.log("after");
        fi3 = "after"
        window.clearInterval(frameUpdateAf);
        body.style.overflow = "scroll";
      }
    }, 1000/12);
  }


  else if (frameIndex <= startFI3 && fi3 == "after") {

    fi3 = "in";
    body.style.overflow = "hidden";
    var frameUpdateB4 = setInterval(function() {
      if (frameNumber > 1) {
        frameNumber--;
        const frameStringr = pad(frameNumber, 4);
        const sourcer = "runningMan/rniinung" + frameStringr + ".png";
        runI.src = sourcer;
      }
      else {
        runD.style.zIndex = "-1";
        fi3 = "before"
        console.log("before");
        window.clearInterval(frameUpdateB4);
        body.style.overflow = "scroll";
      }
    }, 1000/12);
  }


  if (first == true) {
    first = false;
    console.log(first);
  }
}

// about me split function



// New Letters

function newLetters(name) {
  var letters = document.getElementsByClassName(name);
  for (let i=0; i<letters.length; i++) {
    var rand = Math.floor(Math.random() * 1000);
    letters[i].style.opacity = "0";
    setTimeout(function() {
      letters[i].style.opacity = "0.8";
      letters[i].classList.add("smallanimation");
    }, rand);
  }
}

function newLettersRm(name) {
  var letters = document.getElementsByClassName(name);
  for (let i=0; i<letters.length; i++) {
    letters[i].classList.remove("smallanimation");
  }
}
