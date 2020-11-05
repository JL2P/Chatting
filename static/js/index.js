var socket = io();

/* 접속 되었을 때 실행 */
// 클라이언트에서는 connection 이벤트가 아니라 connect이다
// 서버와 소켓이 연결되었을 때 id가 test인 요소의 값을 "접속 됨"으로 설정한다
socket.on("connect", function () {
  // on : 수신
  //   var input = document.getElementById("test");
  //   input.value = "접속 됨";

  // 이름을 입력받는다
  var name = prompt("Hello :)", "");
  // 이름이 빈칸인 경우
  if (!name) {
    name = "익명";
  }
  // 서버에 새로운 유저가 왔다고 알림
  socket.emit("newUser", name);
});

/* 서버로부터 데이터 받은 경우 */
// 메세지를 수신하기 위해
socket.on("update", function (data) {
  var chat = document.getElementById("chat");

  var message = document.createElement("div");
  var node = document.createTextNode(`${data.name}: ${data.message}`);
  var className = "";

  // 타입에 따라 적용할 클래스를 다르게 지정
  switch (data.type) {
    case "message":
      className = "other";
      break;

    case "connect":
      className = "connect";
      break;

    case "disconnect":
      className = "disconnect";
      break;
  }

  message.classList.add(className);
  message.appendChild(node);
  chat.appendChild(message);
});

/* 메세지 전송 함수 */
// id가 test인 요소의 값을 서버로 전송
function send() {
  // 입력되어있는 데이터 가져오기
  var message = document.getElementById("test").value;

  // 가져왔으니 데이터 빈칸으로 변경
  document.getElementById("test").value = "";

  // 내가 전송할 메시지 클라이언트에게 표시
  var chat = document.getElementById("chat");
  var msg = document.createElement("div");
  var node = document.createTextNode(message);
  msg.classList.add("me");
  msg.appendChild(node);
  chat.appendChild(msg);

  // 서버로 send 이벤트 전달 + 데이터와 함께
  // emit : 전송 - 전송을 했으면, on("send")가 있어야 받을 수 있다
  // 이벤트명이 같은 것끼리 데이터 송/수신 가능!!
  socket.emit("send", { msg: message });

  // 서버로 message 이벤트 전달 + 데이터와 함께!!
  socket.emit("message", { type: "message", message: message });
}
