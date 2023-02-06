window.addEventListener('DOMContentLoaded', (event) => {
  particlesJS('particles-js', {
    "particles": {
      "number": {
        "value": 40,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#ffffff"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": 5
        },
        "image": {
          "src": "img/github.svg",
          "width": 100,
          "height": 100
        }
      },
      "opacity": {
        "value": 0.5,
        "random": false,
        "anim": {
          "enable": false,
          "speed": 1,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 4,
        "random": true,
        "anim": {
          "enable": false,
          "speed": 80,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 180,
        "color": "#ffffff",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 1,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": false,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "repulse"
        },
        "onclick": {
          "enable": true,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 800,
          "line_linked": {
            "opacity": 1
          }
        },
        "bubble": {
          "distance": 800,
          "size": 80,
          "duration": 2,
          "opacity": 0.8,
          "speed": 3
        },
        "repulse": {
          "distance": 100,
          "duration": 0.4
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true
  }, function () {
    console.log('callback - particles.js config loaded');
  });

})

function urlExists(url, callback) {
  fetch(url, { method: 'head' })
    .then(function (status) {
      callback(status.ok)
    });
}

const getERC20Tokens = async () => {
  window.w3 = new Web3(window.ethereum)
  var accounts = await w3.eth.getAccounts()
  account = accounts[0]
  fetch(`/get-tokens?addr=${account}`)
    .then(response => response.text())
    .then((response) => {
      let resp = JSON.parse(response)
      $('#loading').text('');
      Object.entries(resp).forEach((entry) => {
        console.log(entry)
        let [key, value] = entry
        $('.tokens').append(`<p style="color:white; font-family:descriptionFont; font-size:13px; text-align:center;">${key}: <span class="value"> ${value} </span>
        </p>`)
      })

    })
    .catch(err => console.log(err))
}

const getNfts = async () => {
  window.w3 = new Web3(window.ethereum)
  var accounts = await w3.eth.getAccounts()
  account = accounts[0]
  fetch(`/get-nfts?addr=${account}`)
    .then(response => response.text())
    .then((response) => {
      let resp = JSON.parse(response)
      Object.entries(resp).forEach((entry) => {
        let [key, value] = entry
        if (value.substring(0, 7) == 'ipfs://') {
          let ipfsUri = value.slice(7);
          value = 'https://ipfs.io/ipfs/' + ipfsUri
        }
        let ext = value.substring(value.length - 3)
        if (ext == 'png' || ext == 'jpg' || ext == 'webp' || ext == 'jpeg') {
          urlExists(value, function (exists) {
            if (exists) {
              $('.nft').append(`<img style=padding:5px; src="${value}" alt="${key}" width="100" height="150">`)
            }
          });

        }
        console.log(`key: ${key} \n value:${value}`)

      })

    })
    .catch(err => console.log(err))
}

const ul_1 = document.querySelector(".options1")

const ul_2 = document.querySelector(".options2")

const ul_3 = document.querySelector(".options3")

const ul_4 = document.querySelector(".options4")

const ul_5 = document.querySelector(".options5")





const q1 = document.querySelector(".q1")

const q2 = document.querySelector(".q2")

const q3 = document.querySelector(".q3")

const q4 = document.querySelector(".q4")

const q5 = document.querySelector(".q5")




ul_1.addEventListener("click", function () {
  q1.style.display = "none";
  q2.style.display = "block"

});

ul_2.addEventListener("click", function () {
  q2.style.display = "none";
  q3.style.display = "block"
});

ul_3.addEventListener("click", function () {
  q3.style.display = "none";
  q4.style.display = "block"
});

ul_4.addEventListener("click", function () {

  q4.style.display = "none";
  q5.style.display = "block"
});




var x, i, j, l, ll, selElmnt, a, b, c;

x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;

  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);

  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {

    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function (e) {

      var y, i, k, s, h, sl, yl;
      s = this.parentNode.parentNode.getElementsByTagName("select")[0];
      sl = s.length;
      h = this.parentNode.previousSibling;
      for (i = 0; i < sl; i++) {
        if (s.options[i].innerHTML == this.innerHTML) {
          s.selectedIndex = i;
          h.innerHTML = this.innerHTML;
          y = this.parentNode.getElementsByClassName("same-as-selected");
          yl = y.length;
          for (k = 0; k < yl; k++) {
            y[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          break;
        }
      }
      h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function (e) {

    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {

  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

const handleAccounts = async () => {
  if (window.ethereum) {
    window.w3 = new Web3(window.ethereum)
    var accounts = await w3.eth.getAccounts()
    account = accounts[0]
    console.log(`Help us improve, connected metamask account ${account}`)
    $('.q5').append(`<input class='addr' type="hidden" name="addr" value='${account}' />`)
  } else if (window.offlineAuthAddr) {
    console.log(`Help us improve, connected offline auth account ${account}`)
    $('.q5').append(`<input class='addr' type="hidden" name="addr" value='${window.offlineAuthAddr}'/>`)
  }
}

document.addEventListener("click", closeAllSelect);




getERC20Tokens()
getNfts()
handleAccounts()


