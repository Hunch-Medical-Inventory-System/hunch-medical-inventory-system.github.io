<template>
  <div class="scanner-container">
    <div class="scan-area">
      <img src="@/assets/qr-code.png" alt="QR Code" class="scan-icon" />
    </div>
    <p class="scan-text">Hold up an NFC enabled device to scan</p>
    <button @click="startScan" class="scan-button">SCAN!</button>
  </div>
</template>

<script>
export default {
  methods: {
    async startScan() {
      if ("NDEFReader" in window) {
        try {
          const ndef = new NDEFReader();
          await ndef.scan();
          ndef.onreading = event => {
            const decoder = new TextDecoder();
            for (const record of event.message.records) {
              console.log("NFC Data:", decoder.decode(record.data));
            }
          };
        } catch (error) {
          console.error("NFC Scan failed:", error);
        }
      } else {
        alert("SCANNING..");
      }
    }
  }
};
</script>

<style scoped>
.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #0a0a12;
}

.scan-area {
  width: 300px;
  height: 300px;
  border: 4px solid #ff4664;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-icon {
  width: 150px;
}

.scan-text {
  margin-top: 10px;
  font-size: 18px;
  color: white;
  text-align: center;
}

.scan-button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  background: #ff4664;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.scan-button:hover {
  background: #d93b57;
}
</style>
