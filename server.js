const express = require('express')
const jwt = require('jsonwebtoken')
const Web3 = require('web3')
const bodyParser = require('body-parser')
const SDK = require("alchemy-sdk");
const ethers = require('ethers');
const { json } = require('express');
const sqlite3 = require('sqlite3').verbose();

const config = {
  // alchemy sdk api
  apiKey: "",
  network: SDK.Network.ETH_MAINNET,
};
const alchemy = new SDK.Alchemy(config);

const jwtSecret = 'yhpargotraced'
const app = express()
const web3 = new Web3('https://cloudflare-eth.com/')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, resp) => {
  resp.render('index')
})

app.get('/nonce', (req, res) => {
  const nonce = new Date().getTime()
  const address = req.query.address

  const tempToken = jwt.sign({ nonce, address }, jwtSecret, { expiresIn: '60s' })
  const message = getSignMessage(address, nonce)

  res.json({ tempToken, message })
})

app.post('/verify', async (req, res) => {
  const authHeader = req.headers['authorization']
  const tempToken = authHeader && authHeader.split(" ")[1]

  if (tempToken === null) return res.sendStatus(403)

  const userData = await jwt.verify(tempToken, jwtSecret)
  const nonce = userData.nonce
  const address = userData.address
  const message = getSignMessage(address, nonce)
  const signature = req.query.signature

  const verifiedAddress = await web3.eth.accounts.recover(message, signature)

  if (verifiedAddress.toLowerCase() == address.toLowerCase()) {
    const token = jwt.sign({ verifiedAddress }, jwtSecret, { expiresIn: '1d' })
    res.json({ token })
  } else {
    res.sendStatus(403)
  }
})

app.get('/help-us-improve', authenticateToken, async (req, res) => {
  res.render('help-us-improve')
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)
  jwt.verify(token, jwtSecret, (err, authData) => {
    if (err) return res.sendStatus(403)

    req.authData = authData

    next()
  })
}

app.post('/send-form-data', urlencodedParser, async (req, res) => {
  let addr = req.body.addr;
  let q1Answer = req.body.q1;
  let q2Answer = req.body.q2;
  let q3Answer = req.body.q3;
  let q4Answer = req.body.q4;
  let cluster = req.body.cluster
  console.log(`Data sent from: ${addr}`)
  if (q1Answer && q2Answer && q3Answer && q4Answer && cluster) {
    let db = new sqlite3.Database('./db/decartography.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the decartography database.');
    });
    // sql injection?
    db.run(`INSERT INTO help_us_improve(addr, question1, question2, question3, question4,  cluster)
    VALUES (?, ?, ?, ?, ?, ?)`, [addr, q1Answer, q2Answer, q3Answer, q4Answer, cluster])

    db.close((err) => {
      let status = 'success'
      if (err) {
        console.error(err.message);
        status = err
      }
      console.log('Closed the database connection.');
      res.redirect('/')
    });
  } else {
    res.sendStatus(400)
  }
})

app.get('/get-data', async (req, res) => {
  let db = new sqlite3.Database('./db/decartography.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the decartography database.');
  });
  // sql injection?
  let sql = "SELECT * FROM help_us_improve"
  let jsonObj = []
  db.all(sql, [], (err, rows) => {
    if (err) {
      reject(err);
    }
    jsonObj = rows
  });

  db.close((err) => {
    let status = 'success'
    if (err) {
      console.error(err.message);
      status = err
    }
    console.log('Closed the database connection.');
    res.json(jsonObj)
  });
})

app.get('/get-nfts', async (req, res) => {
  let spesificData = new Map([[], []])
  let addr = req.query.addr
  if (addr) {
    // CHANGE HERE TO 'addr', STATIC ADDR IS JUST FOR DEVELOPMENT
    const nfts = await alchemy.nft.getNftsForOwner('0x4F7f4B0CCE9FF2ABaB5EFfe220FeB1a7Dc51BADc');
    for (let nft of nfts['ownedNfts']) {
      spesificData[nft.title] = nft.media[0].raw
    }
    res.json(spesificData)

  } else {
    res.sendStatus(400)
  }
})

app.get('/get-tokens', async (req, res) => {
  let spesificData = new Map([[], []])
  let addr = req.query.addr
  if (addr) {
    // CHANGE HERE TO 'addr', STATIC ADDR IS JUST FOR DEVELOPMENT
    const balances = await alchemy.core.getTokenBalances('0xd7E1236C08731C3632519DCd1A581bFe6876a3B2');
    const nonZeroBalances = balances.tokenBalances.filter((token) => {
      return token.tokenBalance !== "0";
    });
    for (let token of nonZeroBalances) {
      let balance = token.tokenBalance;
      const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);

      balance = balance / Math.pow(10, metadata.decimals);
      balance = balance.toFixed(2);
      spesificData[metadata.name] = balance
    }
    res.json(spesificData)
  } else {
    res.sendStatus(400)
  }

})

app.get('/get-timestamp', async (req, res) => {
  res.json(Date.now())
})

app.get('/signature-auth', async (req, res) => {
  let signatureStr = req.query.signature
  let addrStr = req.query.addr
  let ts = req.query.ts
  if (signatureStr && addrStr && ts) {
    try {
      //console.log(signatureStr, addrStr, ts)
      let signer = ethers.utils.recoverAddress(ethers.utils.hashMessage(ts), signatureStr);
      console.log(`Authorized: ${signer}`)
      if (signer == addrStr) {
        const token = jwt.sign({ signer }, jwtSecret, { expiresIn: '1d' })
        res.json({ token })
      } else {
        res.sendStatus(403)
      }


    } catch (err) {
      res.json(err)
    }
  } else {
    res.sendStatus(400)
  }
})


const getSignMessage = (address, nonce) => {
  return `Please sign this message for authentication.\n\nYour address: ${address}:\n\nNonce: ${nonce}`
}
let port = 8080
console.log(`http://localhost:${port}`);
app.listen(port) 