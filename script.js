

var startimage = document.getElementById("startback");
var onabout = false;
var aboutme = document.getElementById("aboutme");

var wordsTogether = aboutme.innerHTML;
var words = wordsTogether.split(" ");
var finishedWords = ""
var first = true;


const startFrameIndex = 5;
const endFrameIndex = 20;
const startFI2 = 30;
const startFI3 = 50;
const startFI4 = 70;

window.onload = function() {
  // Start Image Fade

  setTimeout(function() {
    startimage.classList.add("opacity0");
  }, 200);
  setTimeout(function() {
    startimage.style.zIndex = "-1"
  }, 1200);

  // Rewrites The Letters
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

  // Letters Animation
  startLetters();

  // Image Initializations

  for (let i = 1; i <= 60; i++) {
    const preImage = "svg/water drop" + pad(i, 4) + ".svg";
    preloadImages(preImage);
  }

  for (let i = 1; i <= 38; i++) {
    const preImage = "runningMan/rniinung" + pad(i, 4) + ".png";
    preloadImages(preImage);
  }

  // Running Man Initialization

  imageDefaults(runI);
  imageBackgroundDefaults(backgroundImage);
  imageBackgroundDefaults(startimage);

  // Scroll Animation in case it happends when start
  scroll("start");
}

window.onresize = function() {
  imageDefaults(runI);
  imageBackgroundDefaults(backgroundImage);
  imageBackgroundDefaults(startimage);
}

window.onbeforeunload = function() {
  startimage.classList.remove("opacity0");
  startimage.style.zIndex = "1000";
}

// Document Scroll Variables

var body = document.body;
var bodyHeight = body.clientHeight;
var winHeight = window.innerHeight;
var workingHeight = bodyHeight - winHeight;
var offSet = window.pageYOffset;

// Water Drop Variable

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

// Pre Load images

function preloadImages(url) {
  var img = new Image();
  img.src = url;
}

// Scroll Function

function scroll(which) {

  var name = document.getElementById("name");
  body = document.body;
  bodyHeight = body.clientHeight;
  winHeight = window.innerHeight;
  workingHeight = bodyHeight - winHeight;
  offSet = window.pageYOffset;

  const scrollFraction = offSet/workingHeight;
  const frameIndex = scrollFraction * 100;

  waterDropletAnimation(frameIndex, workingHeight, offSet);
  words1(frameIndex);
  pianoBlack(frameIndex);
  runningManAnimation(frameIndex);


}
// Image initialization

function imageDefaults(image) {
  const windowAspectRatio = window.innerHeight/window.innerWidth;
  if (windowAspectRatio <= 1080/1920) {
    image.style.width = "100vw";
    image.style.height = "auto";
  }
  else {
    image.style.width = "auto";
    image.style.height = "100vh";
  }
}

function imageBackgroundDefaults(image) {
  const windowAspectRatio = window.innerHeight/window.innerWidth;
  if (windowAspectRatio <= 1) {
    image.style.width = "120vw";
    image.style.height = "auto";
  }
  else {
    image.style.width = "auto";
    image.style.height = "120vh";
  }
}

// Letters Animation
function startLetters() {
  var letters = document.getElementsByClassName("nameWord");
  for (let i=0; i<letters.length; i++) {
    var rand = Math.floor(Math.random() * 2000);
    letters[i].style.opacity = "0";
    setTimeout(function() {
      letters[i].style.opacity = "0.8";
      letters[i].classList.add("lettersanimation");
    }, rand);
  }
}


function waterDropletAnimation(frameIndex, workingHeight, offSet) {
  if (frameIndex > startFrameIndex && frameIndex <= endFrameIndex) {
    waterD.style.zIndex = "1";
    const startAnimation = workingHeight * startFrameIndex/100;
    const endAnimation = workingHeight * endFrameIndex/100;
    const animationLength = endAnimation - startAnimation;
    const animationOffSet = offSet - startAnimation;
    const scrollFractionAnimation = animationOffSet/animationLength;
    const animationFrame = Math.floor(scrollFractionAnimation * 60) + 1;
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
}

function words1(frameIndex) {
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
}

// New Words
// Bubble Animation

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

// Remove New Word

function newLettersRm(name) {
  var letters = document.getElementsByClassName(name);
  for (let i=0; i<letters.length; i++) {
    letters[i].classList.remove("smallanimation");
  }
}


function pianoBlack(frameIndex) {

  const black = document.getElementById("black");
  const piano = document.getElementById("piano");


  if (window.pageYOffset > piano.offsetTop + piano.height * 2/3) {
    black.style.position = "fixed";
    black.style.top = "0";
  }
  else {
    black.style.position = "absolute";
    black.style.top = String(piano.offsetTop + piano.height * 2/3) + "px";
  }
  if (window.pageYOffset > piano.offsetTop + piano.height * 1.4) {
    black.classList.add("turnColor");
  }
  else {
    black.classList.remove("turnColor");
  }
}


function runningManAnimation(frameIndex) {
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

