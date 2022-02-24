import fetch from "node-fetch";

(async ()=> {
  let result = await fetch('http://localhost:8000/sign/verification_key.json');
  let json = result.json();
  console.log(json);
})()