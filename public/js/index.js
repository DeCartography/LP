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

  toggleButton()

})
window.onload = function () {
  document.getElementById('enabled').addEventListener("click", function () {
    document.querySelector('.bg-modal').style.display = "flex";
    document.getElementById("caller").value = "improve"
  });

  document.getElementById('enabled-try').addEventListener("click", function () {
    document.querySelector('.bg-modal').style.display = "flex";
    document.getElementById("caller").value = "try"
  });


  document.querySelector('.close').addEventListener("click", function () {
    document.querySelector('.bg-modal').style.display = "none";
  });

  const getTimestamp = async () => {
    let resp = await fetch(`/get-timestamp`)
    return await resp.text()

  }

  getTimestamp().then(val => {
    console.log(`Timestamp: ${val}`)
    $form = $(`<form action="#" ></form>`);
    $form.append(`<input name='addr' type="text" placeholder="Wallet Address">`)
    $form.append(`<input name='signature' type="text" placeholder="Signature">`)
    $form.append(`<input class='ts' type="hidden" name="ts" value=${val} />`)
    $form.append(`<p class='ts' style="color: gray; font-family:descriptionFont">Timestamp: ${val}</p>`)
    $form.append(`<a href="#"><button id="submit"> Submit</button></a>`)
    $('.modal-contents').prepend($form)
    $('.modal-contents').prepend(`<h1 id="header">Log In</h1>`)

    document.querySelector('form').addEventListener('submit', (e) => {
      let url = "/help-us-improve"
      if (document.getElementById("caller").value == "try") {
        url = "/try-decartography"
      }
      e.preventDefault()
      const data = Object.fromEntries(new FormData(e.target).entries());
      let addr = data['addr']
      let signature = data['signature']
      let ts = data['ts']
      console.log(`Signature Auth Address: ${addr}`)
      window.offlineAuthAddr = addr;
      console.log(`Signature Auth Signature: ${signature}`)
      console.log(`Signature Auth Timestamp: ${ts}`)
      const handle = async () => {
        let opts = {
          method: 'GET',
          headers: {
            'Content-Type': "application/json",
          },
          redirect: 'error',
          credentials: 'include',
        }
        let authresp = await fetch(`/signature-auth?addr=${addr}&signature=${signature}&ts=${ts}`, opts)
        let authres = await authresp.text()
        let jsonres = JSON.parse(authres)

        if (jsonres.hasOwnProperty('token')) {
          console.log(`Signed token: ${jsonres['token']}`)
          let optsAuth = {
            method: 'GET',
            headers: {
              'Content-Type': "application/json",
              'Authorization': `Bearer ${jsonres['token']}`
            },
            redirect: 'error'
          }
          console.log('Offline signature authorization...')
          await fetch(url, optsAuth).then((res) => {
            if (res.ok) {
              const changeBody = async () => {
                let content = await res.text()
                $('body').html(content)
              }

              changeBody()
            }
          })




        } else {
          window.location.href = window.location.origin + window.location.pathname;
          alert('An error occured.')

        }
      }
      handle()
    });



  });



}

const metamaskButton = document.getElementById('meta')



function toggleButton() {
  if (!window.ethereum) {
    metamaskButton.onclick = function () { metamaskNotInstalled() };
    function metamaskNotInstalled() {
      document.getElementById("meta").innerHTML = "Metamask is not installed";
      metamaskButton.style.backgroundColor = 'Red'
      metamaskButton.style.color = 'white'
      metamaskButton.style.borderColor = 'Red'
      metamaskButton.style.animation = 'shake1 0.3s'
    }

    return false
  } else {
    metamaskButton.onclick = function () {
      let account = null;
      let accessToken = null;
      let url = "/help-us-improve"
      if (document.getElementById("caller").value == "try") {
        url = "/try-decartography"
      }
      const connect = async () => {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        window.w3 = new Web3(window.ethereum)
        var accounts = await w3.eth.getAccounts()
        account = accounts[0]
        console.log(`Connected wallet: ${account}`)

        accessToken = await auth()

        let opts = {
          method: 'GET',
          headers: {
            'Content-Type': "application/json",
            'Authorization': `Bearer ${accessToken}`
          }
        }

        let resp = await fetch(url, opts)
        let res = await resp.text()
        setTimeout(function () {
          $('body').html(res)

        }, 500);


      }

      const auth = async () => {
        let res = await fetch(`/nonce?address=${account}`)
        let resBody = await res.json()

        let signature = await w3.eth.personal.sign(resBody.message, account)

        let opts = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resBody.tempToken}`
          }
        }

        res = await fetch(`/verify?signature=${signature}`, opts)
        resBody = await res.json()

        console.log(`Auth token: ${resBody.token}`)
        return resBody.token
      }

      connect()
    }
  }
}
