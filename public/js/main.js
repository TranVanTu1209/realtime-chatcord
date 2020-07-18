const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMsgs = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// get user name and room  from URL params

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

// join chat room

socket.emit('joinRoom', { username, room });

// get room and user

socket.on('roomusers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('message', message => {
  outputMsg(message);
  // scroll down
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
});

// message submit

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;

  // emit a message to server
  socket.emit('chat', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// output message to DOM

function outputMsg(msg) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    	<p class="meta">${msg.username} <span> ${msg.time} </span></p>
			<p class="text">
				${msg.text}
			</p>
  `;
  chatMsgs.appendChild(div);
}

// add room name ro the DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `${ users.map(user => ` <li> ${user.username}</li>`).join('')}`;
}