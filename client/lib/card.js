



function clickB1() {
  document.querySelector(".b1").style.transform = "rotateY(180deg)";
  document.querySelector(".b2").style.transform = "rotateY(0deg)";
}
function clickB2() {
  document.querySelector(".b2").style.transform = "rotateY(-180deg)";
  document.querySelector(".b1").style.transform = "rotateY(0deg)";
}
export function rotate() {
  clickB1();
  document.querySelector(".b2").style.fontSize = "small";
  setTimeout(() => {
      clickB2();
      document.querySelector(".b2").style.fontSize = "42px";
  }, 500); 
  setTimeout(() => {
      clickB1();
  },1000); 
}

export function createCard(frontText) {
  var div = document.createElement("div");
  div.setAttribute("class","card");
  div.setAttribute("id","card");

  const b1 = document.createElement("div");
  b1.setAttribute("class","box b1");
  b1.setAttribute("id","cardBack");
  const logo = document.createElement("img")
  logo.setAttribute("src","../assets/logo.jpg");
  b1.appendChild(logo);

  const b2 = document.createElement("p");
  b2.setAttribute("class","box b2");
  b2.setAttribute("id","cardFront");
  b2.textContent = frontText;
  
  div.appendChild(b1);
  div.appendChild(b2);

  // <div class="card">
  //   <div class="box b1" id = "cardBack"><img src="../assets/logo.jpg"></div>
  //   <p class="box b2" id = "cardFront">{frontText}</p>
  // </div>
  document.body.appendChild(div);
}

export function week(frontText) {
  createCard(frontText);
  setTimeout(()=>{rotate(),500});
  setTimeout(()=>{document.body.removeChild(document.getElementById("card"));},2500);

}

