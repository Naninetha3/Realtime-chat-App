let selectedReceiver = null;

function showMessage(message) {
    const msgElement = document.getElementById('connectionstatus');
    msgElement.textContent = message;
    msgElement.classList.add('show');
    msgElement.style.display = 'block';
    setTimeout(() => msgElement.classList.remove('show'), 4000);
    setTimeout(() => msgElement.style.display = 'none', 5000);
}

document.getElementById('threedots').addEventListener('click', function () {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('visible');
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: "refresh_users" }));
    }
});

let websocket;

document.getElementById('login-button').addEventListener('click', function() {
    const phoneNumber = document.getElementById('login-input').value;
    if (phoneNumber) {
        websocket = new WebSocket(`ws://localhost:8000/ws/${phoneNumber}`);
        websocket.onopen = function() {
            alert("✅ Connected to WebSocket server.");
            showMessage("Connected to WebSocket server.");
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('chat-page').style.display = 'block';
        };
        websocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "user_list") {
                    updateUserList(data.users);
                } else if (data.type === "info") {
                    showMessage(data.message);
                } else {
                     document.getElementById('responseMessage').innerText = data.message || event.data;
                }
            } catch (e) {
                document.getElementById('responseMessage').innerText = event.data;
            }
        };
        websocket.onerror = function(error) {
            console.error("WebSocket Error: ", error);
        };
    } else {
        alert('Please enter a phone number.');
    }
});

document.getElementById('send-button').addEventListener('click', function() {
    const message = document.getElementById('chat-input').value;
    if (!selectedReceiver) {
        alert("Select at least one number first.");
        return;
    }
    if (message && websocket) {
        websocket.send(JSON.stringify({
            type: "chat_message",
            to: selectedReceiver,
            message: message
        }));
        document.getElementById('chat-input').value = "";
    } else {
        alert("Please enter a message.");
    }
});

function updateUserList(users) {
    console.log("✅ Received users:", users);

    const numberList = document.getElementById('number-list');
    numberList.innerHTML = '';
    const myNumber = document.getElementById('login-input').value;
    users.forEach(user => {
        if (user === myNumber) return;
        const li = document.createElement('li');
        li.textContent = user;
        li.classList.add('user-entry');
        li.addEventListener('click', function () {
            document.querySelectorAll('.user-entry').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            selectedReceiver = user;
            document.getElementById('instachat').textContent = `${user}`;
        });
        numberList.appendChild(li);
    });
}

