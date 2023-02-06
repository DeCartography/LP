// node signature-auth-demo.js 123421

const ethers = require('ethers');

async function main() {
  var args = process.argv.slice(2);
  const PRIVATE_KEY = 'PRIVATE_KEY'
  const message = args[0];
  // openssl rand -hex 32
  const walletInst = new ethers.Wallet(PRIVATE_KEY);
  const signMessage = walletInst.signMessage(message);

  const messageSigner = signMessage.then((value) => {
    const verifySigner = ethers.utils.recoverAddress(ethers.utils.hashMessage(message), value);
    return verifySigner;
  });

  try {
    console.log("Success!\nThe message: " + message + '\n' + "\nThe signature: " + await signMessage);
    console.log("\nThe signer: " + await messageSigner + '\n');
  } catch (err) {
    console.log("Something went wrong while verifying your message signature: " + err);
  }

}


main()