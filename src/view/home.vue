<template>
  <div class="web-main">
    <div class="son">
      <el-input
        type="textarea"
        class="dataInput"
        placeholder="输入手机号，多个换行输入"
        v-model="phone"
        rows="7"
        resize="none"
      />

      <div
        style="display: flex; justify-content: space-between; margin-top: 20px"
      >
        <!-- <button id="toggleView">切二维码</button> -->
        <button id="generate" @click="generateCode">生成编码</button>
        <button @click="next(10)">下十页</button>
        <button @click="pre">上一页</button>
      </div>
      <div id="barcodeContainer">
        <svg id="barcode"></svg>
      </div>
      <div id="qrcodeContainer" style="display: none">
        <div id="qrcode"></div>
      </div>

      <div
        style="
          width: 100%;
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
        "
      >
        <span id="totalPages" style="margin-right: 4px"
          >总页数:{{ totalPages }}</span
        >
        <span id="currentPage">当前页: {{ currentPage + 1 }}</span>
      </div>

      <div style="margin: 20px 0; display: flex">
        <button id="nextPage" @click="next(1)">下一页</button>
        <!-- <button id="toggleView">保存并分享</button> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage, ElInput } from "element-plus";
import { isLogin } from "../api/home.js";
const totalPages = ref(0);
const currentPage = ref(0);
const phone = ref("");
const phones = ref([]);
function isValidPhoneNumber(phoneNumber) {
  // 正则表达式，用于匹配11位手机号
  const regex = /^\d{11}$/;
  // 使用test方法校验手机号
  return regex.test(phoneNumber);
}
const generateCode = () => {
  const list = phone.value.split("\n");
  phones.value = list;
  totalPages.value = list.length;
  if (!list.length) return;
  currentPage.value = 0;
  genBarCode();
};

const genBarCode = () => {
  const phone = phones.value[currentPage.value];
  if (!phone) {
    return ElMessage.error("手机号不能为空! ");
  }
  JsBarcode("#barcode", phone);
};

const next = (page) => {
  const current = currentPage.value + page;
  if (current < totalPages.value) {
    currentPage.value = current;
    genBarCode();
  }
};

const pre = () => {
  const current =   currentPage.value - 1;
  if (current > -1) {
    currentPage.value = current;
    genBarCode();
  }
};
</script>

<style scoped lang="less">
.web-main {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9f9f9;
  padding: 0 8px;

  button {
    min-width: 80px;
    height: 60px;
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #202020bb;
  }
  .dataInput {
    width: 100%;
    height: 200px;
    font-size: 1.2rem;
    margin-top: 40px;
  }
  .son {
    width: 80%;
  }

  #barcodeContainer {
    height: 200px;
    text-align: center;
    border: 1px solid #ccc;
    margin: 8px 0;
  }
  #qrcodeContainer {
    display: flex;
    justify-content: center;
  }
  #prevPage {
    flex: 1;
  }
  #nextPage {
    width: 100%;
  }
  .prevPage {
  }
}
</style>
