/* 설치한 express 모듈 불러오기 */
const express = require("express");

/* 설치한 socket.io 모듈 불러오기 */
const socket = require("socket.io");

/* Node.js 기본 내장 모듈 불러오기 */
const http = require("http");
const fs = require("fs"); // 파일과 관련된 처리를 할 수 있는 모듈

/* express 객체 생성 */
const app = express();

/* express http 서버 생성 */
const server = http.createServer(app);

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server);

// 정적파일을 제공하기 위해 미들웨어를 사용하는 코드
// app.use()를 사용하여 원하는 미들웨어를 추가하여 조합할 수 있다
app.use("/css", express.static("./static/css"));
app.use("/js", express.static("./static/js"));

/* get(경로, 함수) : GET 방식으로 / 경로에 접속하면 실행 됨 */
// 서버의 경로를 GET 방식으로 접속하면 호출됨
// 함수를 request와 response 객체를 받는다
// request : 클라이언트에서 전달된 데이터와 정보들이 담겨있다
// response : 클라이언트에게 응답을 위한 정보가 들어있다
app.get("/", function (request, response) {
  //   console.log("유저가 / 으로 접속했습니다");
  //   response.send("Hello, Express Server"); // response.send(정달 데이터)
  fs.readFile("./static/index.html", function (err, data) {
    // readFile() 함수는 지정된 파일을 읽어서 데이터를 가져온다
    if (err) {
      response.send("에러");
    } else {
      // 클라이언트에게 보낼 내용은 index.html의 내용이다
      response.writeHead(200, { "Content-Type": "text/html" }); // html 파일이라는 것을 알리기 위해
      response.write(data); // html 데이터를 보내준다
      response.end(); // 모두 보냈으면 완료되었음을 알린다
    }
  });
});

// io.sockets : 접속되는 모든 소켓
// on() : 소켓에서 해당 이벤트를 받으면 콜백함수가 실행된다
io.sockets.on("connection", function (socket) {
  // connection 이라는 이벤트가 발생할 경우 콜백함수가 실행된다
  console.log("유저 접속 됨");
  // 콜백함수 안에서 해당 소켓과 통신할 코드
  socket.on("send", function (data) {
    // sned 라는 이벤트를 받으면 호출
    console.log("전달된 메세지 : ", data.msg);
  });

  // 새로운 유저가 접속했을 때, 다른 소켓에게 알려줌
  socket.on("newUser", function (name) {
    console.log(name + " 님이 접속했습니다.");
    // 소켓에 이름 저장
    socket.name = name;
    // 모든 소켓에게 전송
    // io.sockets.emit("update" 데이터) : 본인을 포함한 모든 유저에게 알림!
    io.sockets.emit("update", {
      type: "connect",
      name: "SERVER",
      message: name + "님이 접속했습니다.",
    });
  });

  // 전송한 메세지 받기
  socket.on("message", function (data) {
    // 받은 데이터에 데이터를 누가 보냈는지 보낸 유저의 이름을 추가
    data.name = socket.name;
    console.log(data);
    // socket.broadcast.emit("이벤트명", 전달할 데이터) : 본인(보낸 유저)을 제외한 나머지 유저에게 메세지 전송
    socket.broadcast.emit("update", data);
  });

  socket.on("disconnect", function () {
    // disconnect : socket.io의 기본 이벤트
    console.log("접속 종료"); // 연결되어있던 소켓과 접속이 끊어지면 자동으로 실행됨
    console.log(socket.name + "님이 나가셨습니다.");
    // 나간 유저를 제외한 나머지 유저에게 메세지 전송
    socket.broadcast.emit("update", {
      type: "disconnect",
      name: "SERVER",
      message: socket.name + "님이 나가셨습니다.",
    });
  });
});

/* listen(포트, 리스너) : 서버를 포트로 listen */
// 지정한 포트로 서버를 실행하고, 실행이 되면 리스너가 호출됨
server.listen(9090, function () {
  console.log("서버 실행 중");
});
