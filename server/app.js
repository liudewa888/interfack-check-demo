const express = require("express");
const jwt = require("jsonwebtoken");
const compression = require("compression");
const { writeFile, readdir, readFile } = require("fs/promises");

const app = express();
// app.use((req, res, next) => {
//   if (req.url.includes("/find")) {
//     req.url = req.url.replace("/find", "");
//   }
//   if (req.url.includes("/api")) {
//     req.url = req.url.replace("/api", "");
//   }
//   next();
// });
app.use(express.static("./dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// 响应统一格式化
function responseFormat(code = 200, data = [], msg = "ok") {
  const response = {
    code,
    data,
    msg,
  };
  return response;
}
// token生成
function generateAccessToken(user, key) {
  return jwt.sign(user, key, {
    expiresIn: "8h",
  });
}

// 返回10位格式时间戳
function getTimeSpan() {
  return String(parseInt(new Date().getTime() / 1000));
}

async function readUser() {
  const data = await readFile("./user.json");
  const res = JSON.parse(data);
  return res;
}

async function writeUser(user) {
  const users = await readUser();
  const index = users.findIndex((item) => {
    return user.uname === item.uname && user.password === item.password;
  });
  if (index < 0) return;
  users.forEach((item) => {
    if (item.uname === user.uname) {
      item.token_key = user.token_key;
      item.token = user.token;
    }
  });
  return writeFile("./user.json", JSON.stringify(users));
}

// 登录
app.post("/admin/login", async (req, res) => {
  const data = req.body;
  const users = await readUser();
  const user1 = users.find((item) => {
    return data.uname === item.uname && data.password === item.password;
  });
  if (!user1) {
    return res.send(responseFormat(409, [], "用户名或密码错误"));
  }
  const user = { uname: data.uname };
  const token_key = data.uname + getTimeSpan();
  const token = generateAccessToken(user, token_key);
  user1.token_key = token_key;
  user1.token = token;
  writeUser(user1)
    .then(() => {
      res.send(responseFormat(200, { token }));
    })
    .catch(() => {
      res.send(responseFormat(409, [], "更新用户出错"));
    });
});
// token验证
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader;
  if (!token) {
    return res.send(responseFormat(409, null, "需要登录,才能操作"));
  }

  const users = await readUser();
  const user1 = users.find((item) => {
    return token === item.token;
  });
  if (!user1) {
    return res.send(responseFormat(401, null, "token无效"));
  }
  const token_key = user1.token_key;
  jwt.verify(token, token_key, (err, decoded) => {
    if (!err) {
      const time = getTimeSpan();
      if (time < decoded.exp) {
        next();
      } else {
        return res.send(responseFormat(401, null, "token过期"));
      }
    } else {
      return res.send(responseFormat(401, null, "token过期"));
    }
  });
}
app.get("/isLogin", authenticateToken, async (req, res) => {
  res.send(responseFormat());
});

app.listen(9080, () => {
  console.log("9080 is running");
});

// 服务器写法
// app.listen(process.env.PORT,function() {
//   console.log(process.env.PORT ,"is running");
// })
