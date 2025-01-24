const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper")
const fileCancelButton = document.querySelector("#file-cancel")

//API setup
const API_KEY = "AIzaSyBqhKsqegZhRw49EuMhF5RR2t2vqdbbpoI";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

//create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

//generate bot response using api
const generateBotResponse = async (incomingMessageDiv) => {
  const messageText = incomingMessageDiv.querySelector(".message-text");

  const requestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: userData.message },
            ...(userData.file.data ? [{ inline_data: userData.file }] : []),
          ],
        },
      ],
    }),
  };

  try {
    const response = await fetch(API_URL, requestOption);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error.message);
    }
    console.log(data);

    //extract and display bot's response text
    const apiResponseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();

    messageText.innerText = apiResponseText;
  } catch (error) {
    messageText.innerText = error.message;
    messageText.style.color = "#ff0000";
    console.log(error);
  } finally {

    //reset user's file data, removing thinking indicator and scroll chat to bottom
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    
  }
};
//handle  outgoing user message
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  //
  //stroring user's message by creating a golbal object making it accessible throughout the project
  userData.message = messageInput.value.trim();
  messageInput.value = "";

  //create and display user message
  const messageContent = `<div class="message-text"></div>
                          ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}"  class="attachment"/>` : ""}`;

  const outgoingMessageDiv = createMessageElement(
    messageContent,
    "user-message"
  );
  outgoingMessageDiv.querySelector(".message-text").textContent =
    userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  //simulate bot response wth thinking indicator after delay
  setTimeout(() => {
    const messageContent = `<img class="bot-avatar" src="/img/chatbot_17115944.png" alt="chatbot-icon" width="50" height="50">
                <div class="message-text">
                   <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                   </div>

                </div>`;

    const incomingMessageDiv = createMessageElement(
      messageContent,
      "bot-message",
      "thinking"
    );

    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

//handle enter key press for sending message
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage) {
    handleOutgoingMessage(e);
  }
});

//handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded")
    const base64String = e.target.result.split(",")[1];

    //store file data in userData
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };

    fileInput.value = "";
  };
  reader.readAsDataURL(file);
});

//cancel file upload
fileCancelButton.addEventListener("click",() => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded")
})

//handle emoji selection
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect:(emoji) => {
const {selectionStart: start, selectionEnd: end} = messageInput;
messageInput.setRangeText(emoji.native,start,end, "end");
messageInput.focus();
  },
  onClickOutside: (e) => {
    if (e.target.id === "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    }else{
      document.body.classList.remove("show-emoji-picker");
    }
  }
});

document.querySelector(".chat-form").appendChild(picker)

sendMessageButton.addEventListener("click", (e) => {
  handleOutgoingMessage(e);
});

document.querySelector("#file-upload").addEventListener("click", () => {
  fileInput.click();
});
