// script.js

// script.js (add this at the VERY TOP of your file, above everything else)

// Intro flood of cinnamorolls (normal + heart), then reveal the site
var intro = document.getElementById("intro");
var introGrid = document.getElementById("introGrid");

function buildIntroFlood() {
  if (!intro || !introGrid) return;

  // Lock scroll until intro is done
  document.body.classList.add("locked");

  // Determine roughly how many tiles to fill the screen
  var tileW = 100; // approx tile+gap
  var tileH = 90;
  var cols = Math.max(3, Math.floor(window.innerWidth / tileW));
  var rows = Math.max(3, Math.floor(window.innerHeight / tileH));
  var total = cols * rows;

  // Clear if rebuild (e.g., resize)
  introGrid.innerHTML = "";

  var sources = ["images/normal.png", "images/heart.png"];

  // Populate with a staggered “pop”
  for (let i = 0; i < total; i += 1) {
    let tile = document.createElement("div");
    tile.className = "intro-tile";

    // Random pick normal/heart
    let src = sources[Math.floor(Math.random() * sources.length)];
    tile.style.backgroundImage = 'url("' + src + '")';

    // Stagger timing so it "floods" in
    let delay = i * 35 + Math.random() * 120; // ms
    tile.style.animationDelay = delay + "ms";

    // Slight random tilt
    let tilt = -6 + Math.random() * 12;
    tile.style.transform = "scale(0.1) rotate(" + tilt + "deg)";

    introGrid.appendChild(tile);
  }

  // After it's full, fade out intro and unlock scroll
  var lastDelay = (total - 1) * 35 + 200; // approx when last tile pops
  var finishTime = lastDelay + 700;

  setTimeout(function () {
    intro.classList.add("hide");
  }, finishTime);

  setTimeout(function () {
    document.body.classList.remove("locked");
  }, finishTime + 750);
}

// Run intro on load
window.addEventListener("load", function () {
  buildIntroFlood();
});

// Optional: rebuild on resize (keeps it full-screen if she rotates phone)
window.addEventListener("resize", function () {
  // Only rebuild if intro is still visible
  if (intro && !intro.classList.contains("hide")) {
    buildIntroFlood();
  }
});


// Cinnamoroll: spin CW when scrolling down, CCW when scrolling up
var cinnamo = document.querySelector(".cinnamo");
var lastScrollY = window.scrollY;
var isTwirlLocked = false;

window.addEventListener("scroll", function () {
  var currentScroll = window.scrollY;
  var delta = currentScroll - lastScrollY;

  // Ignore tiny jitters
  if (Math.abs(delta) < 6) {
    lastScrollY = currentScroll;
    return;
  }

  // prevent spam
  if (isTwirlLocked) {
    lastScrollY = currentScroll;
    return;
  }

  isTwirlLocked = true;

  cinnamo.classList.remove("twirl-cw");
  cinnamo.classList.remove("twirl-ccw");

  if (delta > 0) {
    cinnamo.classList.add("twirl-cw");   // down
  } else {
    cinnamo.classList.add("twirl-ccw");  // up
  }

  setTimeout(function () {
    cinnamo.classList.remove("twirl-cw");
    cinnamo.classList.remove("twirl-ccw");
    isTwirlLocked = false;
  }, 950);

  lastScrollY = currentScroll;
});

// Memory Lane: stack cards in center and deal out (both directions)
var grid = document.querySelector(".grid");
var cards = document.querySelectorAll(".grid .card");

// Ensure Memory Lane starts in a stacked/hidden state on refresh
grid.classList.add("stacked");
grid.classList.remove("spread");

function computeCardDeltasToCenter() {
  var gridRect = grid.getBoundingClientRect();
  var centerX = gridRect.left + gridRect.width / 2;
  var centerY = gridRect.top + gridRect.height / 2;

  cards.forEach(function (card, idx) {
    var r = card.getBoundingClientRect();
    var cardCenterX = r.left + r.width / 2;
    var cardCenterY = r.top + r.height / 2;

    var dx = centerX - cardCenterX;
    var dy = centerY - cardCenterY;

    var rot = (idx - (cards.length - 1) / 2) * 2.2;

    card.style.setProperty("--dx", dx + "px");
    card.style.setProperty("--dy", dy + "px");
    card.style.setProperty("--rot", rot + "deg");
  });
}

function stackThenDeal() {
  computeCardDeltasToCenter();

  // Always start from a clean, stacked state
  grid.classList.add("stacked");
  grid.classList.remove("spread");

  // Force the browser to paint the stacked state (SUPER IMPORTANT)
  void grid.offsetWidth;

  // Next frame: deal out
  requestAnimationFrame(function () {
    grid.classList.add("spread");

    // Then remove stacked so they travel to their slots
    requestAnimationFrame(function () {
      grid.classList.remove("stacked");
    });
  });
}

function collapseToStack() {
  computeCardDeltasToCenter();

  // When collapsing, go back to center stack
  grid.classList.add("stacked");
  grid.classList.remove("spread");
}


var lastScrollYForGrid = window.scrollY;

var gridObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      var currentScroll = window.scrollY;
      var scrollingDown = currentScroll > lastScrollYForGrid;
      var scrollingUp = currentScroll < lastScrollYForGrid;

      // When Memory Lane ENTERS from top (scrolling down)
      if (entry.isIntersecting && scrollingDown) {
        stackThenDeal();
      }

      // When Memory Lane LEAVES to top (scrolling up)
      if (!entry.isIntersecting && scrollingUp) {
        collapseToStack();
      }

      lastScrollYForGrid = currentScroll;
    });
  },
  {
    threshold: 0.35
  }
);

gridObserver.observe(grid);


window.addEventListener("resize", function () {
  computeCardDeltasToCenter();
});

// Floating hearts
var heartsContainer = document.querySelector(".hearts");
var heartChars = ["💗", "💖", "💘", "💞", "💕"];

function spawnHeart() {
  var heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];

  var left = Math.random() * 100;
  var size = 14 + Math.random() * 16;
  var duration = 4 + Math.random() * 4;

  heart.style.left = left + "vw";
  heart.style.bottom = "-40px";
  heart.style.fontSize = size + "px";
  heart.style.animationDuration = duration + "s";

  heartsContainer.appendChild(heart);

  setTimeout(function () {
    heart.remove();
  }, duration * 1000);
}

setInterval(spawnHeart, 350);

// Runaway "No" button
var noBtn = document.getElementById("noBtn");
var yesBtn = document.getElementById("yesBtn");
var choiceBox = document.getElementById("choiceBox");
var result = document.getElementById("result");

function moveNoButton() {
  var boxRect = choiceBox.getBoundingClientRect();
  var btnRect = noBtn.getBoundingClientRect();

  var padding = 12;
  var maxX = boxRect.width - btnRect.width - padding;
  var maxY = boxRect.height - btnRect.height - padding;

  var x = padding + Math.random() * maxX;
  var y = padding + Math.random() * maxY;

  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
  noBtn.style.transform = "translate(0, 0)";
}

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("touchstart", function (e) {
  e.preventDefault();
  moveNoButton();
});

var yesArt = document.getElementById("yesArt");

yesBtn.addEventListener("click", function () {
  result.textContent = "YAY!! 🎉💘 I knew it. Happy Valentine’s Day, my love.";

  // disable the No button
  noBtn.style.opacity = "0.3";
  noBtn.style.pointerEvents = "none";

  // show the flower image below the text
  yesArt.style.display = "flex";

  // re-trigger animation every click (even if clicked again)
  var img = yesArt.querySelector("img");
  img.style.animation = "none";
  void img.offsetWidth; // force reflow
  img.style.animation = "punchPop 520ms steps(7, end)";

  // punch the whole page a bit
  document.body.classList.remove("screen-punch");
  void document.body.offsetWidth;
  document.body.classList.add("screen-punch");

  setTimeout(function () {
    document.body.classList.remove("screen-punch");
  }, 280);
});


window.addEventListener("load", function () {
  computeCardDeltasToCenter();
});


window.addEventListener("load", function () {
  computeCardDeltasToCenter();

  // If user reloads while already near Memory Lane, trigger deal
  var lane = document.getElementById("memory-lane");
  var laneRect = lane.getBoundingClientRect();
  if (laneRect.top < window.innerHeight * 0.7) {
    stackThenDeal();
  }
});