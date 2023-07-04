// HTML elements
const chatContainer = document.getElementById('chat-container');
const inputField = document.getElementById('input-field');



// Send user message to the chat bot
async function sendMessage(message) {
  // Add user message to the chat container
  appendUserMessage(message);

  const API_KEY = "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"
  const API_URL = "https://api.openai.com/v1/chat/completions"
  const requestOptions = {
    method: "POST",
    headers:{
        "content-type":"application/json",
        "Authorization":`Bearer ${API_KEY}`
    },
    body:JSON.stringify({
        model:"gpt-3.5-turbo",
        messages: [{ role: 'user', content: message }]
      })
    } 

  // Send the message to the API
 
      fetch(API_URL,requestOptions).then(res => res.json()).then(data =>{
        // console.log(data.choices[0].message.content)
        const botMessage = data.choices[0].message.content
        appendBotMessage(botMessage);
    }).catch((err)=>{
        console.log(err);
    })

  // Add bot message to the chat container
//   
}

// Append a user message to the chat container
function appendUserMessage(message) {
  const userMessageElement = document.createElement('li');
  userMessageElement.innerHTML = `
    <li class="clearfix">
      <div class="message-data align-right">
        <span class="message-data-time">${getTimeString()}</span>&nbsp;&nbsp;
        <span class="message-data-name"></span>
        <i class="fa fa-circle me"></i>
      </div>
      <div class="message other-message float-right">
        ${message}
      </div>
    </li>
  `;
  chatContainer.appendChild(userMessageElement);
}

// Append a bot message to the chat container
function appendBotMessage(message) {
  const botMessageElement = document.createElement('li');
  botMessageElement.innerHTML = `
    <li>
      <div class="message-data">
        <span class="message-data-name"><i class="fa fa-circle online"></i> Ai</span>
        <span class="message-data-time">${getTimeString()}</span>
      </div>
      <div class="message my-message">
        ${message}
      </div>
    </li>
  `;
  chatContainer.appendChild(botMessageElement);
}

// Get the current time as a string
function getTimeString() {
  const now = new Date();
  const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
  return now.toLocaleTimeString('en-US', timeOptions);
}

// Handle form submission
function handleSubmit(event) {
  event.preventDefault();
  const message = inputField.value;
  console.log(message);
  if (message.trim() !== '') {
    inputField.value = '';
    sendMessage(message);
  }
}

// Event listener for form submission
document.getElementById('chat-form').addEventListener('submit', handleSubmit);



